import { NextResponse } from 'next/server';
import { runSeed } from '@/lib/seed';

export async function POST() {
  try {
    const result = await runSeed();
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with demo students, management user, and overlapping events.',
      data: {
        admin: result.adminUser.email,
        studentsCount: result.students.length,
        eventsCount: result.events.length,
      },
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed database' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
