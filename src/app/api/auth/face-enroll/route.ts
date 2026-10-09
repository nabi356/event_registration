import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { getAuthUser } from '@/lib/auth';

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
    const { faceEmbedding, consentAccepted, deviceId } = body;

    if (!consentAccepted) {
      return NextResponse.json(
        { success: false, error: 'Biometric consent is required to enroll face credentials.' },
        { status: 400 }
      );
    }

    if (!faceEmbedding || !Array.isArray(faceEmbedding) || faceEmbedding.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Valid face embedding vector is required.' },
        { status: 400 }
      );
    }

    // Save only the embedding vector, never any image
    const updateData: any = {
      faceEmbedding,
      faceUpdatedAt: new Date(),
    };

    if (deviceId) {
      updateData.deviceId = deviceId;
    }

    const updatedUser = await User.findByIdAndUpdate(
      authUser.userId,
      { $set: updateData },
      { new: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Face biometric embedding successfully enrolled.',
      hasFaceEnrolled: true,
      faceUpdatedAt: updatedUser.faceUpdatedAt,
    });
  } catch (error: any) {
    console.error('Face enroll error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error during face enrollment' },
      { status: 500 }
    );
  }
}
