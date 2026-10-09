import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Registration } from '@/models/Registration';
import { CheckIn } from '@/models/CheckIn';
import { Event } from '@/models/Event';
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
      .populate('userId', 'name enrollmentNo department university email')
      .populate('eventId', 'name venue')
      .sort({ createdAt: -1 });

    const rows: string[] = [];
    rows.push('Attendee Name,Enrollment ID,Email,University,Department,Event Name,Ticket ID,Tier,Status,Check-in Time');

    for (const reg of registrations) {
      const u = reg.userId as any;
      const e = reg.eventId as any;

      const latestCheckIn = u
        ? await CheckIn.findOne({
            userId: u._id,
            eventId: reg.eventId,
          }).sort({ timestamp: -1 })
        : null;

      let status: string = reg.status;
      let checkInTimeStr = 'N/A';

      if (latestCheckIn) {
        if (latestCheckIn.result === 'verified') {
          status = 'Checked In';
          checkInTimeStr = new Date(latestCheckIn.timestamp).toISOString();
        } else if (latestCheckIn.result === 'flagged') {
          status = 'Flagged';
        }
      }

      const name = (u?.name || 'N/A').replace(/,/g, ' ');
      const enrollmentNo = u?.enrollmentNo || 'N/A';
      const email = u?.email || 'N/A';
      const university = (u?.university || 'N/A').replace(/,/g, ' ');
      const department = (u?.department || 'N/A').replace(/,/g, ' ');
      const eventName = (e?.name || 'N/A').replace(/,/g, ' ');
      const ticketId = reg.ticketId;
      const tier = reg.seatTier || 'Standard';

      rows.push(
        `"${name}","${enrollmentNo}","${email}","${university}","${department}","${eventName}","${ticketId}","${tier}","${status}","${checkInTimeStr}"`
      );
    }

    const csvContent = rows.join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="eventra_attendees_${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export CSV error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
