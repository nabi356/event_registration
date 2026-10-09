import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Event } from '@/models/Event';
import { CheckIn } from '@/models/CheckIn';
import { SecurityAlert } from '@/models/SecurityAlert';
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
    const now = new Date();

    // Find events whose endTime + 2 hours grace period has passed
    const expiredEvents = await Event.find({
      endTime: { $lt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
    });

    const expiredEventIds = expiredEvents.map((e) => e._id);

    let deletedCheckIns = 0;
    let deletedAlerts = 0;

    if (expiredEventIds.length > 0) {
      const checkInResult = await CheckIn.deleteMany({
        eventId: { $in: expiredEventIds },
      });
      deletedCheckIns = checkInResult.deletedCount || 0;

      const alertResult = await SecurityAlert.deleteMany({
        eventId: { $in: expiredEventIds },
      });
      deletedAlerts = alertResult.deletedCount || 0;
    }

    // Also purge any items whose TTL expiresAt <= now directly
    const ttlCheckInResult = await CheckIn.deleteMany({
      expiresAt: { $lte: now },
    });
    const ttlAlertResult = await SecurityAlert.deleteMany({
      expiresAt: { $lte: now },
    });

    deletedCheckIns += ttlCheckInResult.deletedCount || 0;
    deletedAlerts += ttlAlertResult.deletedCount || 0;

    return NextResponse.json({
      success: true,
      message: 'Automated data retention cleanup executed successfully.',
      expiredEventsCount: expiredEvents.length,
      deletedCheckIns,
      deletedAlerts,
    });
  } catch (error: any) {
    console.error('Cleanup route error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST({} as any);
}
