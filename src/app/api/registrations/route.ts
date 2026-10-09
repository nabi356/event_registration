import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Registration } from '@/models/Registration';
import { Event } from '@/models/Event';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { eventId, seatTier } = body;

    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID is required.' }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 });
    }

    // Check capacity
    const currentCount = await Registration.countDocuments({
      eventId,
      status: { $in: ['Registered', 'Confirmed'] },
    });

    if (currentCount >= event.capacity) {
      return NextResponse.json(
        { success: false, error: 'Event capacity reached. Registration closed.' },
        { status: 400 }
      );
    }

    // Check existing registration
    const existing = await Registration.findOne({
      userId: authUser.userId,
      eventId,
    });

    if (existing) {
      if (existing.status !== 'Cancelled') {
        return NextResponse.json(
          { success: false, error: 'You are already registered for this event.' },
          { status: 400 }
        );
      }
      // Re-activate cancelled registration
      existing.status = 'Registered';
      await existing.save();
      return NextResponse.json({
        success: true,
        message: 'Registration reactivated successfully!',
        registration: existing,
      });
    }

    // Generate ticket ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `EVT-2026-${authUser.enrollmentNo.replace(/[^A-Z0-9]/g, '')}-${randomSuffix}`;

    const registration = await Registration.create({
      userId: authUser.userId,
      eventId,
      status: 'Registered',
      ticketId,
      seatTier: seatTier || 'Standard Admission',
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully registered for event!',
      registration,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
