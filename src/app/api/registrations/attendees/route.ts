import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Registration } from '@/models/Registration';
import { CheckIn } from '@/models/CheckIn';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'management') {
      return NextResponse.json(
        { success: false, error: 'Access restricted: Management role required.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    const filter: any = {};
    if (eventId) {
      filter.eventId = eventId;
    }

    const registrations = await Registration.find(filter)
      .populate('userId', 'name enrollmentNo department university email deviceId')
      .populate('eventId', 'name venue startTime')
      .sort({ createdAt: -1 });

    const attendees = await Promise.all(
      registrations.map(async (reg) => {
        const u = reg.userId as any;
        const e = reg.eventId as any;

        // Check latest checkin status
        const latestCheckIn = u
          ? await CheckIn.findOne({
              userId: u._id,
              eventId: reg.eventId,
            }).sort({ timestamp: -1 })
          : null;

        let displayStatus: string = reg.status;
        if (latestCheckIn) {
          if (latestCheckIn.result === 'verified') {
            displayStatus = 'Checked In';
          } else if (latestCheckIn.result === 'flagged') {
            displayStatus = 'Flagged';
          }
        }

        return {
          id: reg._id.toString(),
          userId: u?._id?.toString(),
          name: u?.name || 'Unregistered Attendee',
          studentId: u?.enrollmentNo || 'N/A',
          university: u?.university || 'University',
          dept: u?.department || 'Engineering',
          ticket: reg.ticketId,
          tier: reg.seatTier || 'Standard Admission',
          status: displayStatus,
          eventName: e?.name || 'Event',
          checkInTime: latestCheckIn?.timestamp,
        };
      })
    );

    return NextResponse.json({ success: true, attendees });
  } catch (error: any) {
    console.error('Attendees route error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
