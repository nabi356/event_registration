import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide enrollment number / email and password' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { enrollmentNo: cleanIdentifier.toUpperCase() },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials. User not found.' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials. Incorrect password.' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      enrollmentNo: user.enrollmentNo,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
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
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error during login' },
      { status: 500 }
    );
  }
}
