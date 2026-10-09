import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Event } from '@/models/Event';
import { getAuthUser } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'management') {
      return NextResponse.json(
        { success: false, error: 'Access restricted to management administrators.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectToDatabase();
    const body = await req.json();

    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.category) updateData.category = body.category;
    if (body.startTime) updateData.startTime = new Date(body.startTime);
    if (body.endTime) updateData.endTime = new Date(body.endTime);
    if (body.venue) updateData.venue = body.venue;
    if (body.lat !== undefined) updateData.lat = Number(body.lat);
    if (body.lng !== undefined) updateData.lng = Number(body.lng);
    if (body.radiusMeters !== undefined) updateData.radiusMeters = Number(body.radiusMeters);
    if (body.capacity !== undefined) updateData.capacity = Number(body.capacity);
    if (body.accentColor) updateData.accentColor = body.accentColor;

    const event = await Event.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      event,
    });
  } catch (error: any) {
    console.error('Update event error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error updating event' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
