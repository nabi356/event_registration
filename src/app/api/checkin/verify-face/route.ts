import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User, IUser } from '@/models/User';
import { Event } from '@/models/Event';
import { Registration } from '@/models/Registration';
import { CheckIn } from '@/models/CheckIn';
import { SecurityAlert } from '@/models/SecurityAlert';
import {
  calculateCosineSimilarity,
  checkRateLimit,
  recordFailedScan,
  clearRateLimit,
} from '@/lib/faceVerification';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { eventId, faceEmbedding, livenessVerified, presentedEnrollmentNo, terminalId } = body;

    const rateLimitKey = terminalId || 'default-terminal';
    const rateCheck = checkRateLimit(rateLimitKey);
    if (rateCheck.isLocked) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          reason: `Rate limit active: terminal locked out for ${rateCheck.secondsRemaining}s due to repeated failed scans.`,
        },
        { status: 429 }
      );
    }

    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    const eventTTL = new Date(new Date(event.endTime).getTime() + 2 * 60 * 60 * 1000);

    // 1. Liveness check verification
    if (livenessVerified === false) {
      recordFailedScan(rateLimitKey);
      await CheckIn.create({
        eventId: event._id,
        result: 'flagged',
        reason: 'Spoof or fake face detected',
        method: 'face',
        timestamp: new Date(),
        expiresAt: eventTTL,
      });

      await SecurityAlert.create({
        eventId: event._id,
        type: 'spoof',
        note: `Biometric liveness check failed at Gate Terminal: potential spoofing attempt.`,
        timestamp: new Date(),
        expiresAt: eventTTL,
      });

      return NextResponse.json({
        success: true,
        verified: false,
        reason: 'Spoof or fake face detected',
      });
    }

    if (!faceEmbedding || !Array.isArray(faceEmbedding) || faceEmbedding.length === 0) {
      recordFailedScan(rateLimitKey);
      await CheckIn.create({
        eventId: event._id,
        result: 'denied',
        reason: 'Face not recognised',
        method: 'face',
        timestamp: new Date(),
        expiresAt: eventTTL,
      });

      return NextResponse.json({
        success: true,
        verified: false,
        reason: 'Face not recognised',
      });
    }

    // 2. Fetch all enrolled students
    const enrolledStudents = await User.find({
      role: 'student',
      faceEmbedding: { $exists: true, $ne: [] },
    });

    let bestMatch: IUser | null = null;
    let highestSimilarity = 0;

    for (const student of enrolledStudents) {
      if (student.faceEmbedding && student.faceEmbedding.length > 0) {
        const similarity = calculateCosineSimilarity(faceEmbedding, student.faceEmbedding);
        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          bestMatch = student;
        }
      }
    }

    // Similarity threshold (>= 0.60 for match)
    if (!bestMatch || highestSimilarity < 0.6) {
      recordFailedScan(rateLimitKey);
      await CheckIn.create({
        eventId: event._id,
        result: 'denied',
        reason: 'Face not recognised',
        method: 'face',
        timestamp: new Date(),
        expiresAt: eventTTL,
      });

      return NextResponse.json({
        success: true,
        verified: false,
        reason: 'Face not recognised',
        similarity: highestSimilarity.toFixed(2),
      });
    }

    // 3. If ID was presented, verify it matches the face owner
    if (presentedEnrollmentNo) {
      if (bestMatch.enrollmentNo.toUpperCase() !== presentedEnrollmentNo.trim().toUpperCase()) {
        recordFailedScan(rateLimitKey);
        await CheckIn.create({
          userId: bestMatch._id,
          eventId: event._id,
          result: 'flagged',
          reason: 'Face does not match the ID presented',
          method: 'face',
          timestamp: new Date(),
          expiresAt: eventTTL,
        });

        await SecurityAlert.create({
          userId: bestMatch._id,
          eventId: event._id,
          type: 'id_mismatch',
          note: `Presented ID ${presentedEnrollmentNo} does not match face owner (${bestMatch.enrollmentNo}).`,
          timestamp: new Date(),
          expiresAt: eventTTL,
        });

        return NextResponse.json({
          success: true,
          verified: false,
          reason: 'Face does not match the ID presented',
          student: {
            name: bestMatch.name,
            enrollmentNo: bestMatch.enrollmentNo,
          },
        });
      }
    }

    // 4. Registration verification for THIS event
    const registration = await Registration.findOne({
      userId: bestMatch._id,
      eventId: event._id,
      status: { $in: ['Registered', 'Confirmed'] },
    });

    if (!registration) {
      // Check if student is registered for ANY other event instead
      const otherReg = await Registration.findOne({
        userId: bestMatch._id,
        status: { $in: ['Registered', 'Confirmed'] },
      }).populate('eventId');

      const reason = otherReg
        ? 'Registered for a different event'
        : 'Not registered for this event';

      recordFailedScan(rateLimitKey);
      await CheckIn.create({
        userId: bestMatch._id,
        eventId: event._id,
        result: 'denied',
        reason,
        method: 'face',
        timestamp: new Date(),
        expiresAt: eventTTL,
      });

      return NextResponse.json({
        success: true,
        verified: false,
        reason,
        student: {
          name: bestMatch.name,
          enrollmentNo: bestMatch.enrollmentNo,
          university: bestMatch.university,
        },
      });
    }

    // 5. Event timing check
    const nowTime = new Date().getTime();
    const eventStartTime = new Date(event.startTime).getTime();
    const eventEndTime = new Date(event.endTime).getTime();

    // Allow entry 2 hours before event start
    if (nowTime < eventStartTime - 2 * 60 * 60 * 1000) {
      await CheckIn.create({
        userId: bestMatch._id,
        eventId: event._id,
        result: 'denied',
        reason: 'Event not started / already ended',
        method: 'face',
        timestamp: new Date(),
        expiresAt: eventTTL,
      });

      return NextResponse.json({
        success: true,
        verified: false,
        reason: 'Event not started / already ended',
      });
    }

    if (nowTime > eventEndTime) {
      await CheckIn.create({
        userId: bestMatch._id,
        eventId: event._id,
        result: 'denied',
        reason: 'Event not started / already ended',
        method: 'face',
        timestamp: new Date(),
        expiresAt: eventTTL,
      });

      return NextResponse.json({
        success: true,
        verified: false,
        reason: 'Event not started / already ended',
      });
    }

    // 6. Already checked in check for this event
    const existingCheckIn = await CheckIn.findOne({
      userId: bestMatch._id,
      eventId: event._id,
      result: 'verified',
    });

    if (existingCheckIn) {
      await CheckIn.create({
        userId: bestMatch._id,
        eventId: event._id,
        result: 'flagged',
        reason: 'Already checked in',
        method: 'face',
        timestamp: new Date(),
        expiresAt: eventTTL,
      });

      return NextResponse.json({
        success: true,
        verified: false,
        reason: 'Already checked in',
        student: {
          name: bestMatch.name,
          enrollmentNo: bestMatch.enrollmentNo,
          university: bestMatch.university,
        },
      });
    }

    // 7. CLASH DETECTION: Check if student has checked into an overlapping event!
    // Overlapping condition: (otherStart < thisEnd) AND (otherEnd > thisStart)
    const overlappingEvents = await Event.find({
      _id: { $ne: event._id },
      startTime: { $lt: event.endTime },
      endTime: { $gt: event.startTime },
    });

    if (overlappingEvents.length > 0) {
      const overlappingEventIds = overlappingEvents.map((e) => e._id);
      const activeCheckInInOverlap = await CheckIn.findOne({
        userId: bestMatch._id,
        eventId: { $in: overlappingEventIds },
        result: 'verified',
      }).populate('eventId');

      if (activeCheckInInOverlap) {
        const overlapEventName = (activeCheckInInOverlap.eventId as any)?.name || 'another event';
        recordFailedScan(rateLimitKey);

        await CheckIn.create({
          userId: bestMatch._id,
          eventId: event._id,
          result: 'flagged',
          reason: 'Same ID active in another overlapping event',
          method: 'face',
          timestamp: new Date(),
          expiresAt: eventTTL,
        });

        await SecurityAlert.create({
          userId: bestMatch._id,
          eventId: event._id,
          type: 'clash',
          note: `Concurrent check-in clash blocked for ${bestMatch.name} (${bestMatch.enrollmentNo}): active in overlapping event "${overlapEventName}".`,
          timestamp: new Date(),
          expiresAt: eventTTL,
        });

        return NextResponse.json({
          success: true,
          verified: false,
          reason: 'Same ID active in another overlapping event',
          student: {
            name: bestMatch.name,
            enrollmentNo: bestMatch.enrollmentNo,
            university: bestMatch.university,
          },
        });
      }
    }

    // ALL CHECKS PASSED -> VERIFIED!
    clearRateLimit(rateLimitKey);

    const checkInRecord = await CheckIn.create({
      userId: bestMatch._id,
      eventId: event._id,
      result: 'verified',
      reason: 'Biometric face match verified',
      method: 'face',
      timestamp: new Date(),
      expiresAt: eventTTL,
    });

    // Update registration status to Confirmed
    registration.status = 'Confirmed';
    await registration.save();

    return NextResponse.json({
      success: true,
      verified: true,
      student: {
        id: bestMatch._id.toString(),
        name: bestMatch.name,
        enrollmentNo: bestMatch.enrollmentNo,
        university: bestMatch.university,
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
        venue: event.venue,
      },
    });
  } catch (error: any) {
    console.error('Verify face error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
