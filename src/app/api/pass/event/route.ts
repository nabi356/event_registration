import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Registration } from '@/models/Registration';
import { Event } from '@/models/Event';
import { getAuthUser } from '@/lib/auth';
import { generateEventPassToken } from '@/lib/passToken';

/**
 * Long-lived signed entry pass for the Student Portal QR.
 *
 * Unlike /api/pass/token (the 10-second rotating gate pass), this token:
 * - is visible immediately after registration, with no geo-fence or device
 *   lock requirements,
 * - never refreshes; it stays valid until the same gate boundary the check-in
 *   scanner enforces (2h after the event ends),
 * - remains bound to one user + one event, and is rejected at any other
 *   event's gate (enforced in /api/checkin/rapid).
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    const [event, registration] = await Promise.all([
      Event.findById(eventId),
      Registration.findOne({
        userId: authUser.userId,
        eventId,
        status: { $in: ['Registered', 'Confirmed'] },
      }),
    ]);

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'You are not registered for this event.' },
        { status: 403 }
      );
    }

    // Gate admits attendees until 2h after the event ends — the pass expires on
    // the same boundary, so the ticket and the scanner never disagree.
    const expiresAt = new Date(new Date(event.endTime).getTime() + 2 * 60 * 60 * 1000);

    const { token } = generateEventPassToken(
      authUser.userId,
      event._id.toString(),
      authUser.enrollmentNo,
      expiresAt
    );

    return NextResponse.json({
      success: true,
      token,
      validUntil: expiresAt.toISOString(),
      ticketId: registration.ticketId,
      student: {
        name: authUser.name,
        enrollmentNo: authUser.enrollmentNo,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Event pass error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
