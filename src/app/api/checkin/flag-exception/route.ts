import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { CheckIn } from '@/models/CheckIn';
import { SecurityAlert } from '@/models/SecurityAlert';
import { Event } from '@/models/Event';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { eventId, reason } = body;

    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    const eventTTL = new Date(new Date(event.endTime).getTime() + 2 * 60 * 60 * 1000);
    const chosenReason = reason || 'Perimeter exception flagged manually by gate operator';

    const checkIn = await CheckIn.create({
      eventId: event._id,
      result: 'flagged',
      reason: chosenReason,
      method: 'manual',
      timestamp: new Date(),
      expiresAt: eventTTL,
    });

    await SecurityAlert.create({
      eventId: event._id,
      type: 'manual_flag',
      note: `Operator exception: ${chosenReason}`,
      timestamp: new Date(),
      expiresAt: eventTTL,
    });

    return NextResponse.json({
      success: true,
      message: 'Security exception logged successfully',
      checkIn,
    });
  } catch (error: any) {
    console.error('Flag exception error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
