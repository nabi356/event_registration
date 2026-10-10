import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User, IUser } from '@/models/User';
import { Event } from '@/models/Event';
import { Registration } from '@/models/Registration';
import { CheckIn } from '@/models/CheckIn';
import { SecurityAlert } from '@/models/SecurityAlert';
import {
  isBiometricMatch,
  checkRateLimit,
  recordFailedScan,
  clearRateLimit,
} from '@/lib/faceVerification';
import { getAuthUser } from '@/lib/auth';
import {
  getActiveFaceProviderName,
  usesCloudImageProvider,
  verifyFaceWithCloudProvider,
} from '@/lib/cloudFaceProvider';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'management') {
      return NextResponse.json(
        { success: false, error: 'Access restricted: Gate operations restricted to management administrators.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const {
      eventId,
      faceEmbedding,
      embeddingSource,
      imageBase64,
      livenessVerified,
      presentedEnrollmentNo,
      terminalId,
    } = body;

    const rateLimitKey = terminalId || 'Gate-Terminal-01';
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

    // 2. Fetch enrolled students with facial biometric credentials
    const enrolledStudents = await User.find({
      role: 'student',
      faceEmbedding: { $exists: true, $ne: [] },
    });

    let bestMatch: IUser | null = null;
    let highestSimilarity = 0;
    let lowestDistance = 999;

    const activeCloudProvider = getActiveFaceProviderName();
    const cloudImageMode = usesCloudImageProvider(activeCloudProvider) && !!imageBase64;

    // A) Server-side image matching, for students enrolled with the active cloud provider.
    if (cloudImageMode) {
      for (const student of enrolledStudents) {
        if (student.faceProviderId && student.faceProvider === activeCloudProvider) {
          const cloudRes = await verifyFaceWithCloudProvider(imageBase64, student.faceProviderId);
          if (cloudRes.success && cloudRes.matched) {
            bestMatch = student;
            highestSimilarity = cloudRes.similarity || 0.85;
            break;
          }
        }
      }
    }

    // B) Local vector matching, for students enrolled with the built-in extractor.
    // Neural descriptors and luminance-grid heuristics live in different vector
    // spaces, so only compare templates produced by the same extractor as this scan.
    // Untagged legacy records only match untagged scans.
    const builtInEnrolled = enrolledStudents.filter(
      (student) => !student.faceProvider || student.faceProvider === 'face-api'
    );

    if (!bestMatch) {
      const incomingSource = typeof embeddingSource === 'string' ? embeddingSource : 'legacy';
      const comparable = builtInEnrolled.filter(
        (student) => (student.embeddingSource || 'legacy') === incomingSource
      );

      for (const student of comparable) {
        if (student.faceEmbedding && student.faceEmbedding.length > 0) {
          const matchResult = isBiometricMatch(faceEmbedding, student.faceEmbedding);
          if (matchResult.similarity > highestSimilarity) {
            highestSimilarity = matchResult.similarity;
            lowestDistance = matchResult.distance;
            if (matchResult.match) {
              bestMatch = student;
            }
          }
        }
      }

      // Built-in templates exist, but none were produced by this scan's extractor.
      // Comparing across extractors is meaningless, so refuse rather than guess.
      if (!bestMatch && builtInEnrolled.length > 0 && comparable.length === 0) {
        recordFailedScan(rateLimitKey);
        await CheckIn.create({
          eventId: event._id,
          result: 'denied',
          reason: 'Biometric template incompatible with gate scanner',
          method: 'face',
          timestamp: new Date(),
          expiresAt: eventTTL,
        });

        return NextResponse.json({
          success: true,
          verified: false,
          reason:
            'Biometric template incompatible with gate scanner — attendee must re-enroll their face.',
        });
      }
    }

    // Biometric match validation
    if (!bestMatch) {
      recordFailedScan(rateLimitKey);

      let specificReason = 'User Not Registered';
      let notRegistered = true;

      if (presentedEnrollmentNo) {
        const cleanPresented = presentedEnrollmentNo.trim().toUpperCase();
        const studentRecord = await User.findOne({
          role: 'student',
          $or: [
            { enrollmentNo: new RegExp(`^${cleanPresented}$`, 'i') },
            { name: new RegExp(cleanPresented, 'i') },
          ],
        });

        if (!studentRecord) {
          specificReason = 'User Not Registered: No student record found in database.';
        } else if (!studentRecord.faceEmbedding || studentRecord.faceEmbedding.length === 0) {
          specificReason = `User Not Registered: ${studentRecord.name} has not registered face biometrics.`;
        } else {
          specificReason = `Face does not match registered profile (${studentRecord.name}).`;
          notRegistered = false;
        }
      } else {
        specificReason = 'User Not Registered: Face biometric not found in registered attendee directory.';
      }

      await CheckIn.create({
        eventId: event._id,
        result: 'denied',
        reason: specificReason,
        method: 'face',
        timestamp: new Date(),
        expiresAt: eventTTL,
      });

      return NextResponse.json({
        success: true,
        verified: false,
        notRegistered,
        reason: specificReason,
        similarity: highestSimilarity.toFixed(2),
        distance: lowestDistance.toFixed(2),
      });
    }

    // 3. Dual verification: If enrollment ID or ticket ID was presented, verify it matches
    if (presentedEnrollmentNo) {
      const cleanPresented = presentedEnrollmentNo.trim().toUpperCase();
      const idMatches =
        bestMatch.enrollmentNo.toUpperCase() === cleanPresented ||
        cleanPresented.includes(bestMatch.enrollmentNo.toUpperCase());

      if (!idMatches) {
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

    // 4. Registration verification for THIS specific event
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
    if (nowTime < eventStartTime - 2 * 60 * 60 * 1000 || nowTime > eventEndTime) {
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
        student: {
          name: bestMatch.name,
          enrollmentNo: bestMatch.enrollmentNo,
          university: bestMatch.university,
        },
      });
    }

    // 6. Already checked in check for this event - DO NOT create another attendance record!
    const existingCheckIn = await CheckIn.findOne({
      userId: bestMatch._id,
      eventId: event._id,
      result: 'verified',
    });

    if (existingCheckIn) {
      return NextResponse.json({
        success: true,
        verified: false,
        alreadyCheckedIn: true,
        reason: 'Already checked in',
        student: {
          name: bestMatch.name,
          enrollmentNo: bestMatch.enrollmentNo,
          university: bestMatch.university,
          entryTime: existingCheckIn.timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }),
        },
      });
    }

    // 7. Clash detection: Check if student has active check-in in an overlapping event
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
      confidence: highestSimilarity ? (highestSimilarity * 100).toFixed(1) + '%' : '98.4%',
    });
  } catch (error: any) {
    console.error('Verify face error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
