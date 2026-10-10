import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Registration } from '@/models/Registration';
import { getAuthUser, comparePassword } from '@/lib/auth';
import { enrollFaceWithCloudProvider, getActiveFaceProviderName, usesCloudImageProvider } from '@/lib/cloudFaceProvider';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const { password, faceEmbedding, consentAccepted, imageBase64, embeddingSource } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password re-entry is required to update face credentials.' },
        { status: 400 }
      );
    }

    if (!consentAccepted) {
      return NextResponse.json(
        { success: false, error: 'Biometric consent is required.' },
        { status: 400 }
      );
    }

    if (!faceEmbedding || !Array.isArray(faceEmbedding) || faceEmbedding.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Valid face embedding vector is required.' },
        { status: 400 }
      );
    }

    if (embeddingSource !== 'neural' && embeddingSource !== 'heuristic') {
      return NextResponse.json(
        { success: false, error: 'Biometric extractor source must be declared as "neural" or "heuristic".' },
        { status: 400 }
      );
    }

    const user = await User.findById(authUser.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. Face scan update rejected.' },
        { status: 401 }
      );
    }

    const activeProvider = getActiveFaceProviderName();
    let cloudFaceToken: string | undefined = undefined;

    if (imageBase64 && usesCloudImageProvider(activeProvider)) {
      const cloudRes = await enrollFaceWithCloudProvider(imageBase64, user.name);
      if (cloudRes.success && cloudRes.faceToken) {
        cloudFaceToken = cloudRes.faceToken;
      }
    }

    const now = new Date();
    user.faceEmbedding = faceEmbedding;
    user.embeddingSource = embeddingSource;
    if (cloudFaceToken) user.faceProviderId = cloudFaceToken;
    user.faceProvider = activeProvider;
    user.biometricConsent = true;
    user.biometricConsentDate = now;
    user.faceUpdatedAt = now;
    await user.save();

    await Registration.updateMany(
      { userId: user._id },
      { $set: { updatedAt: now } }
    );

    return NextResponse.json({
      success: true,
      message: 'Face biometric credentials updated successfully.',
      faceUpdatedAt: user.faceUpdatedAt,
      provider: activeProvider,
      embeddingSource: user.embeddingSource,
    });
  } catch (error: any) {
    console.error('Update face error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error updating face scan' },
      { status: 500 }
    );
  }
}
