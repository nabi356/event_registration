import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(authUser.userId).select('-passwordHash');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        enrollmentNo: user.enrollmentNo,
        university: user.university,
        email: user.email,
        role: user.role,
        department: user.department,
        enrolledYear: user.enrolledYear,
        hasFaceEnrolled: Boolean(user.faceEmbedding && user.faceEmbedding.length > 0),
        faceUpdatedAt: user.faceUpdatedAt,
        deviceId: user.deviceId,
      },
    });
  } catch (error: any) {
    console.error('Me endpoint error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
