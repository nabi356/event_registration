import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Event } from '@/models/Event';
import { Registration } from '@/models/Registration';
import { CheckIn } from '@/models/CheckIn';
import { SecurityAlert } from '@/models/SecurityAlert';
import { verifyDynamicPassToken } from '@/lib/passToken';
import { getAuthUser } from '@/lib/auth';

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
    const { eventId, identifier, qrToken } = body;

    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    const eventTTL = new Date(new Date(event.endTime).getTime() + 2 * 60 * 60 * 1000);

    let targetUserId: string | null = null;
    let method: 'qr' | 'rapid' = 'rapid';

    // 1. If QR token presented, verify server signature and dynamic window
    if (qrToken) {
      method = 'qr';
      const tokenVerification = verifyDynamicPassToken(qrToken);
      if (!tokenVerification.valid) {
        await CheckIn.create({
          eventId: event._id,
          result: 'flagged',
          reason: tokenVerification.reason || 'Invalid QR token',
          method: 'qr',
          timestamp: new Date(),
          expiresAt: eventTTL,
        });

        await SecurityAlert.create({
          eventId: event._id,
          type: 'expired_qr',
          note: `Expired or forged QR token presented: ${tokenVerification.reason}`,
          timestamp: new Date(),
          expiresAt: eventTTL,
        });

        return NextResponse.json({
          success: true,
          verified: false,
          reason: tokenVerification.reason,
        });
      }

      targetUserId = tokenVerification.data!.userId;
    } else if (identifier) {
      // Find user by enrollmentNo, ticketId, or email
      const clean = identifier.trim().toUpperCase();
      const user = await User.findOne({
        $or: [{ enrollmentNo: clean }, { email: clean.toLowerCase() }],
      });

      if (user) {
        targetUserId = user._id.toString();
      } else {
        // Try finding by ticketId in Registration
        const reg = await Registration.findOne({ ticketId: clean });
        if (reg) {
          targetUserId = reg.userId.toString();
        }
      }
    }

    if (!targetUserId) {
      await CheckIn.create({
        eventId: event._id,
        result: 'denied',
        reason: 'Attendee / ID not found in system',
        method,
        timestamp: new Date(),
        expiresAt: eventTTL,
      });

      return NextResponse.json({
        success: true,
        verified: false,
        reason: 'Attendee / ID not found in system',
      });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return NextResponse.json({
        success: true,
        verified: false,
        reason: 'Attendee account not found',
      });
    }

    // 2. Check registration for THIS event
    const registration = await Registration.findOne({
      userId: user._id,
      eventId: event._id,
      status: { $in: ['Registered', 'Confirmed'] },
    });

    if (!registration) {
      await CheckIn.create({
        userId: user._id,
        eventId: event._id,
        result: 'denied',
        reason: 'Not registered for this event',
        method,
        timestamp: new Date(),
        expiresAt: eventTTL,
      });

      return NextResponse.json({
        success: true,
        verified: false,
        reason: 'Not registered for this event',
        student: {
          name: user.name,
          enrollmentNo: user.enrollmentNo,
        },
      });
    }

    // 3. Already checked in?
    const existingCheckIn = await CheckIn.findOne({
      userId: user._id,
      eventId: event._id,
      result: 'verified',
    });

    if (existingCheckIn) {
      await CheckIn.create({
        userId: user._id,
        eventId: event._id,
        result: 'flagged',
        reason: 'Already checked in',
        method,
        timestamp: new Date(),
        expiresAt: eventTTL,
      });

      return NextResponse.json({
        success: true,
        verified: false,
        reason: 'Already checked in',
        student: {
          name: user.name,
          enrollmentNo: user.enrollmentNo,
        },
      });
    }

    // 4. CLASH DETECTION: Overlapping event check!
    const overlappingEvents = await Event.find({
      _id: { $ne: event._id },
      startTime: { $lt: event.endTime },
      endTime: { $gt: event.startTime },
    });

    if (overlappingEvents.length > 0) {
      const overlappingEventIds = overlappingEvents.map((e) => e._id);
      const activeCheckInInOverlap = await CheckIn.findOne({
        userId: user._id,
        eventId: { $in: overlappingEventIds },
        result: 'verified',
      }).populate('eventId');

      if (activeCheckInInOverlap) {
        const overlapEventName = (activeCheckInInOverlap.eventId as any)?.name || 'another event';

        await CheckIn.create({
          userId: user._id,
          eventId: event._id,
          result: 'flagged',
          reason: 'Same ID active in another overlapping event',
          method,
          timestamp: new Date(),
          expiresAt: eventTTL,
        });

        await SecurityAlert.create({
          userId: user._id,
          eventId: event._id,
          type: 'clash',
          note: `Rapid check-in clash blocked for ${user.name} (${user.enrollmentNo}): already active in overlapping event "${overlapEventName}". Face scan mandatory.`,
          timestamp: new Date(),
          expiresAt: eventTTL,
        });

        return NextResponse.json({
          success: true,
          verified: false,
          reason: 'Same ID active in another overlapping event',
          student: {
            name: user.name,
            enrollmentNo: user.enrollmentNo,
          },
        });
      }
    }

    // All passed -> VERIFIED!
    const checkInRecord = await CheckIn.create({
      userId: user._id,
      eventId: event._id,
      result: 'verified',
      reason: method === 'qr' ? 'Dynamic QR verified' : 'Rapid Gate pass verified',
      method,
      timestamp: new Date(),
      expiresAt: eventTTL,
    });

    registration.status = 'Confirmed';
    await registration.save();

    return NextResponse.json({
      success: true,
      verified: true,
      student: {
        id: user._id.toString(),
        name: user.name,
        enrollmentNo: user.enrollmentNo,
        university: user.university,
        ticketId: registration.ticketId,
        entryTime: checkInRecord.timestamp.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      },
      event: {
        id: event._id.toString(),
        name: event.name,
      },
    });
  } catch (error: any) {
    console.error('Rapid check-in error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
