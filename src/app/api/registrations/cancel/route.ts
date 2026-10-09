import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Registration } from '@/models/Registration';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID is required.' }, { status: 400 });
    }

    const registration = await Registration.findOneAndUpdate(
      { userId: authUser.userId, eventId },
      { $set: { status: 'Cancelled' } },
      { new: true }
    );

    if (!registration) {
      return NextResponse.json({ success: false, error: 'Registration not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Registration cancelled successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
