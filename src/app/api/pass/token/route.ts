import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Event } from '@/models/Event';
import { Registration } from '@/models/Registration';
import { getAuthUser } from '@/lib/auth';
import {
  generateDynamicPassToken,
  calculateHaversineDistance,
} from '@/lib/passToken';

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { eventId, deviceId, userLat, userLng } = body;

    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    const [user, event, registration] = await Promise.all([
      User.findById(authUser.userId),
      Event.findById(eventId),
      Registration.findOne({
        userId: authUser.userId,
        eventId,
        status: { $in: ['Registered', 'Confirmed'] },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'You are not registered for this event.' },
        { status: 403 }
      );
    }

    // 1. Hardware Device Lock
    let deviceStatus: 'verified' | 'mismatch' = 'verified';
    if (deviceId) {
      if (!user.deviceId) {
        // Bind to first device session
        user.deviceId = deviceId;
        await user.save();
      } else if (user.deviceId !== deviceId) {
        deviceStatus = 'mismatch';
      }
    }

    // 2. Real Geo-Location Perimeter Validation
    let geoStatus: 'verified' | 'outside' | 'unavailable' = 'verified';
    let distanceMeters = 0;

    if (userLat !== undefined && userLng !== undefined && userLat !== null && userLng !== null) {
      distanceMeters = calculateHaversineDistance(
        Number(userLat),
        Number(userLng),
        event.lat,
        event.lng
      );
      const allowedRadius = event.radiusMeters || 50;
      if (distanceMeters > allowedRadius) {
        geoStatus = 'outside';
      } else {
        geoStatus = 'verified';
      }
    } else {
      geoStatus = 'unavailable';
    }

    // Generate rotating token (valid for 10s)
    const { token, secondsRemaining } = generateDynamicPassToken(
      user._id.toString(),
      event._id.toString(),
      user.enrollmentNo
    );

    return NextResponse.json({
      success: true,
      token,
      secondsRemaining,
      deviceStatus,
      geoStatus,
      distanceMeters: Math.round(distanceMeters),
      allowedRadius: event.radiusMeters || 50,
      student: {
        name: user.name,
        enrollmentNo: user.enrollmentNo,
        university: user.university,
        ticketId: registration.ticketId,
      },
    });
  } catch (error: any) {
    console.error('Pass token error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
