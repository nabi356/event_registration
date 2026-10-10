import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Registration } from '@/models/Registration';
import { Event } from '@/models/Event';
import { User } from '@/models/User';
import { getAuthUser, TokenPayload } from '@/lib/auth';
import { generateEventPassToken } from '@/lib/passToken';
import { sendRegistrationConfirmation } from '@/lib/mailer';

// The gate admits attendees until 2 hours after an event ends; the emailed
// pass expires on exactly the same boundary so the two never disagree.
function passExpiryFor(event: { endTime: Date | string }): Date {
  return new Date(new Date(event.endTime).getTime() + 2 * 60 * 60 * 1000);
}

interface EventForEmail {
  _id: { toString(): string };
  name: string;
  category?: string;
  venue: string;
  startTime: Date | string;
  endTime: Date | string;
}

/**
 * Build and send the confirmation email for a registration.
 *
 * Never throws and never blocks on infrastructure: a failure here is logged
 * and reported back as `emailSent: false`, while the registration itself stays
 * committed either way.
 */
async function emailRegistrationConfirmation(
  authUser: TokenPayload,
  event: EventForEmail,
  registration: { ticketId: string; seatTier?: string }
): Promise<boolean> {
  try {
    // The JWT does not carry the institution, so read it from the account.
    const user = await User.findById(authUser.userId).lean();
    if (!user?.email) return false;

    const { token, expiresAt } = generateEventPassToken(
      authUser.userId,
      event._id.toString(),
      authUser.enrollmentNo,
      passExpiryFor(event)
    );

    const result = await sendRegistrationConfirmation({
      attendeeName: authUser.name,
      attendeeEmail: user.email,
      enrollmentNo: authUser.enrollmentNo,
      university: user.university || '—',
      ticketId: registration.ticketId,
      seatTier: registration.seatTier || 'Standard Admission',
      event: {
        name: event.name,
        category: event.category || 'General Event',
        venue: event.venue,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
      },
      passToken: token,
      passExpiresAt: expiresAt,
    });

    return result.sent;
  } catch (error) {
    console.error('Registration confirmation email error:', error);
    return false;
  }
}

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

    // Check registration deadline
    const deadline = event.registrationDeadline || event.startTime;
    if (deadline && new Date() > new Date(deadline)) {
      const formattedDeadline = new Date(deadline).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      return NextResponse.json(
        {
          success: false,
          error: `Registration closed. The deadline for this event was ${formattedDeadline}. No new registrations are accepted after the deadline.`,
        },
        { status: 400 }
      );
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

      const emailSent = await emailRegistrationConfirmation(
        authUser,
        event as unknown as EventForEmail,
        existing
      );

      return NextResponse.json({
        success: true,
        message: 'Registration reactivated successfully!',
        registration: existing,
        emailSent,
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

    // Awaiting this gives the client an accurate "pass emailed" confirmation;
    // the mailer swallows its own failures and is bounded by SMTP timeouts.
    const emailSent = await emailRegistrationConfirmation(
      authUser,
      event as unknown as EventForEmail,
      registration
    );

    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'Successfully registered for event! Your entry pass has been emailed.'
        : 'Successfully registered for event!',
      registration,
      emailSent,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
