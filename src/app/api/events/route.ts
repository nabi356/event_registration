import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Event } from '@/models/Event';
import { Registration } from '@/models/Registration';
import { CheckIn } from '@/models/CheckIn';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();
    const events = await Event.find().sort({ startTime: 1 });

    // Enrich each event with real counts from Registration and CheckIn
    const enrichedEvents = await Promise.all(
      events.map(async (evt) => {
        const registeredCount = await Registration.countDocuments({
          eventId: evt._id,
          status: { $in: ['Registered', 'Confirmed'] },
        });

        const checkedInCount = await CheckIn.countDocuments({
          eventId: evt._id,
          result: 'verified',
        });

        return {
          id: evt._id.toString(),
          name: evt.name,
          category: evt.category || 'General',
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
          radiusMeters: evt.radiusMeters || 50,
          capacity: evt.capacity,
          accentColor: evt.accentColor || '#3B82F6',
          registeredCount,
          checkedInCount,
          capacityPercentage: evt.capacity > 0 ? ((checkedInCount / evt.capacity) * 100).toFixed(1) : '0',
        };
      })
    );

    return NextResponse.json({
      success: true,
      events: enrichedEvents,
    });
  } catch (error: any) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error fetching events' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'management') {
      return NextResponse.json(
        { success: false, error: 'Access restricted to management administrators.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const { name, category, startTime, endTime, venue, lat, lng, radiusMeters, capacity, accentColor } = body;

    if (!name || !startTime || !endTime || !venue || lat === undefined || lng === undefined || !capacity) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required event details.' },
        { status: 400 }
      );
    }

    const event = await Event.create({
      name,
      category: category || 'Keynote & Tech',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      venue,
      lat: Number(lat),
      lng: Number(lng),
      radiusMeters: Number(radiusMeters) || 50,
      capacity: Number(capacity),
      accentColor: accentColor || '#3B82F6',
      createdBy: authUser.userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      event: {
        id: event._id.toString(),
        name: event.name,
        category: event.category,
        startTime: event.startTime,
        endTime: event.endTime,
        venue: event.venue,
        lat: event.lat,
        lng: event.lng,
        radiusMeters: event.radiusMeters,
        capacity: event.capacity,
        accentColor: event.accentColor,
      },
    });
  } catch (error: any) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error creating event' },
      { status: 500 }
    );
  }
}
