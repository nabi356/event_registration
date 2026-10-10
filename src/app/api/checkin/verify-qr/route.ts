import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Event } from '@/models/Event';
import { Registration } from '@/models/Registration';
import { CheckIn } from '@/models/CheckIn';
import { SecurityAlert } from '@/models/SecurityAlert';
import { verifyScannedPassToken } from '@/lib/passToken';
import { getAuthUser } from '@/lib/auth';

/**
 * Dedicated Real vs Fake QR Pass Verification Endpoint
 * Validates cryptographically signed Eventra passes (Dynamic rotating & Static pass tokens)
 * and ticket references. Returns a granular authenticity verdict:
 * - GENUINE: Cryptographically authentic & registered
 * - FAKE_SIGNATURE: Forged HMAC or tampered token
 * - MALFORMED: Invalid token format
 * - EVENT_MISMATCH: Pass belongs to a different event
 * - ALREADY_CHECKED_IN: Pass is genuine but already redeemed
 * - NOT_REGISTERED: Attendee not found in database
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'management') {
      return NextResponse.json(
        { success: false, error: 'Access restricted: Management role required.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const { token, eventId } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'QR Token string is required.' },
        { status: 400 }
      );
    }

    const cleanToken = token.trim();

    // 1. Resolve Active Event
    let event = null;
    if (eventId) {
      event = await Event.findById(eventId);
    }
    if (!event) {
      event = await Event.findOne().sort({ startTime: -1 });
    }

    if (!event) {
      return NextResponse.json({ success: false, error: 'No active event found.' }, { status: 404 });
    }

    const eventTTL = new Date(new Date(event.endTime).getTime() + 2 * 60 * 60 * 1000);

    // 2. Check if token starts with Eventra Cryptographic Prefix (EVTRA: or EVTRALT:)
    const isEventraToken = cleanToken.startsWith('EVTRA:') || cleanToken.startsWith('EVTRALT:');

    if (isEventraToken) {
      const verification = verifyScannedPassToken(cleanToken);

      // A. Forged or Corrupted Cryptographic Signature -> FAKE PASS!
      if (!verification.valid) {
        await CheckIn.create({
          eventId: event._id,
          result: 'denied',
          reason: `FAKE/FORGED PASS: ${verification.reason || 'Cryptographic signature mismatch'}`,
          method: 'qr',
          timestamp: new Date(),
          expiresAt: eventTTL,
        });

        await SecurityAlert.create({
          eventId: event._id,
          type: 'forged_pass',
          note: `COUNTERFEIT / FAKE PASS DETECTED: ${verification.reason || 'Invalid HMAC signature'}`,
          timestamp: new Date(),
          expiresAt: eventTTL,
        });

        return NextResponse.json({
          success: true,
          isAuthentic: false,
          verdict: 'FAKE_FORGED',
          badgeText: 'COUNTERFEIT / FAKE PASS',
          reason: verification.reason || 'Cryptographic HMAC signature does not match Eventra Zero-Trust Authority. Token was tampered with or forged.',
          rawToken: cleanToken.substring(0, 32) + '...',
        });
      }

      // B. Valid signature, but check if issued for THIS event
      if (verification.eventId && verification.eventId !== event._id.toString()) {
        const passEvent = await Event.findById(verification.eventId);
        const passEventName = passEvent?.name || 'Another Event';

        await CheckIn.create({
          eventId: event._id,
          result: 'flagged',
          reason: `Event Mismatch: Pass is for "${passEventName}"`,
          method: 'qr',
          timestamp: new Date(),
          expiresAt: eventTTL,
        });

        return NextResponse.json({
          success: true,
          isAuthentic: true,
          verdict: 'EVENT_MISMATCH',
          badgeText: 'WRONG EVENT GATE',
          reason: `Pass is cryptographically authentic, but was issued for "${passEventName}". Not authorized for "${event.name}".`,
          tokenEventName: passEventName,
          targetEventName: event.name,
        });
      }

      // C. Look up registered attendee
      const [attendee, registration] = await Promise.all([
        User.findById(verification.userId),
        Registration.findOne({
          userId: verification.userId,
          eventId: event._id,
        }),
      ]);

      if (!attendee) {
        return NextResponse.json({
          success: true,
          isAuthentic: false,
          verdict: 'FAKE_USER',
          badgeText: 'USER NOT FOUND',
          reason: 'Pass references a student ID that does not exist in the institutional directory.',
        });
      }

      if (!registration || registration.status === 'Cancelled') {
        return NextResponse.json({
          success: true,
          isAuthentic: false,
          verdict: 'NOT_REGISTERED',
          badgeText: 'NOT REGISTERED',
          reason: `${attendee.name} (${attendee.enrollmentNo}) has not registered for this event.`,
          attendee: {
            name: attendee.name,
            enrollmentNo: attendee.enrollmentNo,
            email: attendee.email,
          },
        });
      }

      // D. Check if ALREADY checked in
      if (registration.status === 'Confirmed') {
        const priorCheckIn = await CheckIn.findOne({
          eventId: event._id,
          userId: attendee._id,
          result: 'verified',
        }).sort({ timestamp: -1 });

        return NextResponse.json({
          success: true,
          isAuthentic: true,
          verdict: 'ALREADY_CHECKED_IN',
          badgeText: 'PASS ALREADY USED',
          reason: `Pass is authentic, but ${attendee.name} has ALREADY entered this venue.`,
          attendee: {
            name: attendee.name,
            enrollmentNo: attendee.enrollmentNo,
            email: attendee.email,
          },
          priorEntryTime: priorCheckIn?.timestamp || new Date(),
          ticketId: registration.ticketId,
          seatTier: registration.seatTier,
        });
      }

      // E. SUCCESS: GENUINE & VALID PASS!
      registration.status = 'Confirmed';
      await registration.save();

      const newCheckIn: any = await CheckIn.create({
        eventId: event._id,
        userId: attendee._id,
        result: 'verified',
        reason: 'Optical QR pass verified (Cryptographic HMAC authentic)',
        method: 'qr',
        timestamp: new Date(),
        expiresAt: eventTTL,
      });

      return NextResponse.json({
        success: true,
        isAuthentic: true,
        verdict: 'GENUINE',
        badgeText: 'AUTHENTIC EVENTRA PASS',
        attendee: {
          name: attendee.name,
          enrollmentNo: attendee.enrollmentNo,
          email: attendee.email,
          university: attendee.university,
        },
        event: {
          id: event._id.toString(),
          name: event.name,
          venue: event.venue,
        },
        ticketId: registration.ticketId,
        seatTier: registration.seatTier || 'General Admission',
        checkInTime: newCheckIn?.timestamp || new Date(),
      });
    }

    // 3. Check if plain Ticket Reference (e.g. EVT-2026-UNI8472-1234)
    const rawTicketId = cleanToken.toUpperCase();
    const registration = await Registration.findOne({ ticketId: rawTicketId }).populate('userId').populate('eventId');

    if (registration) {
      const regUser = registration.userId as any;
      const regEvent = registration.eventId as any;

      if (regEvent?._id?.toString() !== event._id.toString()) {
        return NextResponse.json({
          success: true,
          isAuthentic: true,
          verdict: 'EVENT_MISMATCH',
          badgeText: 'WRONG EVENT GATE',
          reason: `Ticket ${rawTicketId} is authentic, but registered for "${regEvent?.name || 'Another Event'}".`,
          tokenEventName: regEvent?.name,
          targetEventName: event.name,
        });
      }

      if (registration.status === 'Confirmed') {
        return NextResponse.json({
          success: true,
          isAuthentic: true,
          verdict: 'ALREADY_CHECKED_IN',
          badgeText: 'PASS ALREADY USED',
          reason: `Ticket ${rawTicketId} has already been checked in.`,
          attendee: {
            name: regUser?.name || 'Attendee',
            enrollmentNo: regUser?.enrollmentNo || '',
            email: regUser?.email || '',
          },
          ticketId: registration.ticketId,
          seatTier: registration.seatTier,
        });
      }

      registration.status = 'Confirmed';
      await registration.save();

      const newCheckIn: any = await CheckIn.create({
        eventId: event._id,
        userId: regUser?._id,
        result: 'verified',
        reason: 'Ticket ID reference verified',
        method: 'qr',
        timestamp: new Date(),
        expiresAt: eventTTL,
      });

      return NextResponse.json({
        success: true,
        isAuthentic: true,
        verdict: 'GENUINE',
        badgeText: 'AUTHENTIC EVENTRA TICKET',
        attendee: {
          name: regUser?.name || 'Attendee',
          enrollmentNo: regUser?.enrollmentNo || '',
          email: regUser?.email || '',
          university: regUser?.university || '',
        },
        event: {
          id: event._id.toString(),
          name: event.name,
          venue: event.venue,
        },
        ticketId: registration.ticketId,
        seatTier: registration.seatTier || 'General Admission',
        checkInTime: newCheckIn?.timestamp || new Date(),
      });
    }

    // 4. Token has NO valid signature and does NOT exist in ledger -> FAKE PASS!
    await CheckIn.create({
      eventId: event._id,
      result: 'denied',
      reason: 'COUNTERFEIT QR: Unrecognized token string not minted by Eventra',
      method: 'qr',
      timestamp: new Date(),
      expiresAt: eventTTL,
    });

    await SecurityAlert.create({
      eventId: event._id,
      type: 'fake_ticket',
      note: `Unrecognized QR token scanned: "${cleanToken.substring(0, 40)}"`,
      timestamp: new Date(),
      expiresAt: eventTTL,
    });

    return NextResponse.json({
      success: true,
      isAuthentic: false,
      verdict: 'FAKE_FORGED',
      badgeText: 'COUNTERFEIT / FAKE PASS',
      reason: 'Token is NOT an Eventra cryptographic pass. No valid HMAC signature or registered ledger match found.',
      rawToken: cleanToken.substring(0, 32) + '...',
    });
  } catch (error: any) {
    console.error('Verify QR error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error verifying pass' },
      { status: 500 }
    );
  }
}
