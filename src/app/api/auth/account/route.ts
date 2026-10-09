import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Registration } from '@/models/Registration';
import { getAuthUser } from '@/lib/auth';

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

    // Delete user registrations and user document (purging face embeddings)
    await Registration.deleteMany({ userId: authUser.userId });
    await User.findByIdAndDelete(authUser.userId);

    return NextResponse.json({
      success: true,
      message: 'Account, registrations, and biometric face embeddings permanently purged.',
    });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error deleting account' },
      { status: 500 }
    );
  }
}
