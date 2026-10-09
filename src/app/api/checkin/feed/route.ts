import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { CheckIn } from '@/models/CheckIn';
import { Registration } from '@/models/Registration';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    const filter: any = {};
    if (eventId) {
      filter.eventId = eventId;
    }

    const checkIns = await CheckIn.find(filter)
      .populate('userId', 'name enrollmentNo email')
      .sort({ timestamp: -1 })
      .limit(50);

    const formatted = await Promise.all(
      checkIns.map(async (record) => {
        const u = record.userId as any;
        let ticketId = 'EVT-MANUAL';

        if (u) {
          const reg = await Registration.findOne({
            userId: u._id,
            eventId: record.eventId,
          });
          if (reg) {
            ticketId = reg.ticketId;
          } else {
            ticketId = `EVT-${u.enrollmentNo}`;
          }
        }

        const now = Date.now();
        const diffMs = now - new Date(record.timestamp).getTime();
        let timeAgo = 'Just now';
        const diffSec = Math.floor(diffMs / 1000);
        if (diffSec < 15) {
          timeAgo = 'Just now';
        } else if (diffSec < 60) {
          timeAgo = `${diffSec} sec ago`;
        } else if (diffSec < 3600) {
          timeAgo = `${Math.floor(diffSec / 60)} min ago`;
        } else {
          timeAgo = `${Math.floor(diffSec / 3600)}h ago`;
        }

        return {
          id: record._id.toString(),
          name: u?.name || 'Gate Terminal Scan',
          ticketId,
          timeAgo,
          timestamp: record.timestamp,
          status: record.result,
          reason: record.reason,
          method: record.method,
        };
      })
    );

    return NextResponse.json({ success: true, checkIns: formatted });
  } catch (error: any) {
    console.error('Checkin feed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
