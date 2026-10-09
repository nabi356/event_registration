import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, enrollmentNo, university, email, password, role, department, enrolledYear } = body;

    if (!name || !enrollmentNo || !university || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    const existingEnrollment = await User.findOne({ enrollmentNo: enrollmentNo.toUpperCase() });
    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment number is already registered' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userRole = role === 'management' ? 'management' : 'student';

    const user = await User.create({
      name,
      enrollmentNo: enrollmentNo.toUpperCase(),
      university,
      email: email.toLowerCase(),
      passwordHash,
      role: userRole,
      department: department || 'Computer Science & AI',
      enrolledYear: enrolledYear || 'Class of 2027',
    });

    const token = signToken({
      userId: user._id.toString(),
      enrollmentNo: user.enrollmentNo,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
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
        hasFaceEnrolled: false,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error during signup' },
      { status: 500 }
    );
  }
}
