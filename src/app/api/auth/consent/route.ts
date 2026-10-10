import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { getAuthUser } from '@/lib/auth';

/**
 * DELETE /api/auth/consent
 * Allows a student to withdraw biometric consent and erase facial biometric embeddings
 * without terminating their university account or event registrations.
 */
export async function DELETE(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Permanently wipe biometric data from database
    await User.findByIdAndUpdate(authUser.userId, {
      $unset: {
        faceEmbedding: 1,
        faceProviderId: 1,
        faceProvider: 1,
        embeddingSource: 1,
        faceUpdatedAt: 1,
        biometricConsentDate: 1,
      },
      $set: {
        biometricConsent: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Biometric consent withdrawn. Facial templates and vector embeddings permanently deleted.',
      hasFaceEnrolled: false,
    });
  } catch (error: any) {
    console.error('Withdraw consent error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error withdrawing consent' },
      { status: 500 }
    );
  }
}
