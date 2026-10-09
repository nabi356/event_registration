import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { SecurityAlert } from '@/models/SecurityAlert';
import { CheckIn } from '@/models/CheckIn';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    const filter: any = {};
    if (eventId) {
      filter.eventId = eventId;
    }

    const [alerts, locationFailures, expiredQrAttempts, deviceMismatches, verifiedCount] =
      await Promise.all([
        SecurityAlert.find(filter)
          .populate('userId', 'name enrollmentNo')
          .populate('eventId', 'name venue')
          .sort({ timestamp: -1 })
          .limit(30),
        CheckIn.countDocuments({ ...filter, reason: /Perimeter|Location|radius|outside/i }),
        CheckIn.countDocuments({ ...filter, reason: /expired|token|replay/i }),
        CheckIn.countDocuments({ ...filter, reason: /device|mismatch/i }),
        CheckIn.countDocuments({ ...filter, result: 'verified' }),
      ]);

    const formattedAlerts = alerts.map((a) => {
      const u = a.userId as any;
      const e = a.eventId as any;
      return {
        id: a._id.toString(),
        type: a.type,
        note: a.note,
        timestamp: a.timestamp,
        userName: u?.name,
        enrollmentNo: u?.enrollmentNo,
        eventName: e?.name,
      };
    });

    return NextResponse.json({
      success: true,
      activity: {
        locationFailures,
        expiredQrAttempts,
        deviceMismatches,
        successfulCheckIns: verifiedCount,
      },
      alerts: formattedAlerts,
    });
  } catch (error: any) {
    console.error('Security alerts error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
