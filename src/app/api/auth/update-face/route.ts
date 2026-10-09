import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { getAuthUser, comparePassword } from '@/lib/auth';

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
    const { password, faceEmbedding, consentAccepted } = body;

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

    user.faceEmbedding = faceEmbedding;
    user.faceUpdatedAt = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Face biometric scan updated successfully.',
      faceUpdatedAt: user.faceUpdatedAt,
    });
  } catch (error: any) {
    console.error('Update face error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error updating face scan' },
      { status: 500 }
    );
  }
}
