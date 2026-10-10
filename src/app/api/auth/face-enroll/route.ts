import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Registration } from '@/models/Registration';
import { getAuthUser } from '@/lib/auth';
import { enrollFaceWithCloudProvider, getActiveFaceProviderName, usesCloudImageProvider } from '@/lib/cloudFaceProvider';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in to enroll biometric credentials.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const { faceEmbedding, consentAccepted, deviceId, imageBase64, embeddingSource } = body;

    if (!consentAccepted) {
      return NextResponse.json(
        { success: false, error: 'Biometric consent is required to enroll face credentials.' },
        { status: 400 }
      );
    }

    if (!faceEmbedding || !Array.isArray(faceEmbedding) || faceEmbedding.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Valid 128-dimensional face embedding vector is required.' },
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
        { success: false, error: 'User not found in system.' },
        { status: 404 }
      );
    }

    // Optional Cloud Provider enrollment (Face++ / Luxand) if configured
    let cloudFaceToken: string | undefined = undefined;
    const activeProvider = getActiveFaceProviderName();

    if (imageBase64 && usesCloudImageProvider(activeProvider)) {
      const cloudRes = await enrollFaceWithCloudProvider(imageBase64, user.name);
      if (cloudRes.success && cloudRes.faceToken) {
        cloudFaceToken = cloudRes.faceToken;
      }
    }

    const now = new Date();

    // Save only mathematical embedding vector and provider ID, never raw photo feeds
    user.faceEmbedding = faceEmbedding;
    user.embeddingSource = embeddingSource;
    user.faceProviderId = cloudFaceToken || user.faceProviderId;
    user.faceProvider = activeProvider;
    user.biometricConsent = true;
    user.biometricConsentDate = now;
    user.faceUpdatedAt = now;

    if (deviceId) {
      user.deviceId = deviceId;
    }

    await user.save();

    // Connect face enrollment status with all user's active event registrations
    await Registration.updateMany(
      { userId: user._id },
      { $set: { updatedAt: now } }
    );

    return NextResponse.json({
      success: true,
      message: 'Face biometric credentials successfully enrolled.',
      hasFaceEnrolled: true,
      provider: activeProvider,
      embeddingSource: user.embeddingSource,
      faceUpdatedAt: user.faceUpdatedAt,
      biometricConsentDate: user.biometricConsentDate,
    });
  } catch (error: any) {
    console.error('Face enroll error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error during face enrollment' },
      { status: 500 }
    );
  }
}
