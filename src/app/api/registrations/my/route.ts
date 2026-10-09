import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Registration } from '@/models/Registration';
import { Event } from '@/models/Event';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const registrations = await Registration.find({
      userId: authUser.userId,
      status: { $in: ['Registered', 'Confirmed'] },
    }).populate('eventId');

    const formatted = registrations
      .filter((reg) => reg.eventId)
      .map((reg) => {
        const evt = reg.eventId as any;
        return {
          registrationId: reg._id.toString(),
          ticketId: reg.ticketId,
          status: reg.status,
          seatTier: reg.seatTier,
          event: {
            id: evt._id.toString(),
            name: evt.name,
            category: evt.category,
            startTime: evt.startTime,
            endTime: evt.endTime,
            date: new Date(evt.startTime).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }).toUpperCase(),
            time: new Date(evt.startTime).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }),
            venue: evt.venue,
            lat: evt.lat,
            lng: evt.lng,
            radiusMeters: evt.radiusMeters,
            accentColor: evt.accentColor,
          },
        };
      });

    return NextResponse.json({ success: true, registrations: formatted });
  } catch (error: any) {
    console.error('My registrations error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
