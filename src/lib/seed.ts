import { connectToDatabase } from './db';
import { User } from '@/models/User';
import { Event } from '@/models/Event';
import { Registration } from '@/models/Registration';
import { CheckIn } from '@/models/CheckIn';
import { SecurityAlert } from '@/models/SecurityAlert';
import { hashPassword } from './auth';

// Standard 128-dimensional synthetic embedding for demo students
function generateSyntheticEmbedding(seed: number): number[] {
  const embedding: number[] = [];
  for (let i = 0; i < 128; i++) {
    embedding.push(Math.sin(seed * (i + 1) * 0.17) * 0.5 + Math.cos((seed + i) * 0.23) * 0.5);
  }
  // Normalize vector to unit length (cosine similarity ready)
  const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return embedding.map((v) => v / norm);
}

export async function runSeed() {
  await connectToDatabase();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Registration.deleteMany({}),
    CheckIn.deleteMany({}),
    SecurityAlert.deleteMany({}),
  ]);

  const defaultPasswordHash = await hashPassword('student123');
  const adminPasswordHash = await hashPassword('admin123');

  // 1. Create Management User
  const adminUser = await User.create({
    name: 'K. Nabidul Hasan (Operations Lead)',
    enrollmentNo: 'MGMT-2026-001',
    university: 'Apex Institute of Technology',
    email: 'admin@eventra.io',
    passwordHash: adminPasswordHash,
    role: 'management',
    department: 'Campus Safety & Gate Operations',
    enrolledYear: 'Staff Lead',
  });

  // 2. Create Demo Students
  const student1 = await User.create({
    name: 'K. Nabidul Hasan',
    enrollmentNo: 'UNI-2026-8472',
    university: 'Apex Institute of Technology',
    email: 'k.nabidul.hasan@university.edu',
    passwordHash: defaultPasswordHash,
    role: 'student',
    faceEmbedding: generateSyntheticEmbedding(8472),
    faceUpdatedAt: new Date(),
    department: 'Computer Science & AI Engineering',
    enrolledYear: 'Class of 2027',
  });

  const student2 = await User.create({
    name: 'Aarav Shah',
    enrollmentNo: 'UNI-2026-8473',
    university: 'Apex Institute of Technology',
    email: 'aarav.shah@university.edu',
    passwordHash: defaultPasswordHash,
    role: 'student',
    faceEmbedding: generateSyntheticEmbedding(8473),
    faceUpdatedAt: new Date(),
    department: 'Software Engineering',
    enrolledYear: 'Class of 2026',
  });

  const student3 = await User.create({
    name: 'Riya Patel',
    enrollmentNo: 'UNI-2026-8474',
    university: 'Apex Institute of Technology',
    email: 'riya.patel@university.edu',
    passwordHash: defaultPasswordHash,
    role: 'student',
    faceEmbedding: generateSyntheticEmbedding(8474),
    faceUpdatedAt: new Date(),
    department: 'Data Science & Cybernetics',
    enrolledYear: 'Class of 2027',
  });

  // 3. Create 3 Events (Two of them OVERLAPPING in time)
  const now = new Date();
  
  // Event 1: AI & Future Technologies (Starts now - 1h, Ends in +3h)
  const event1Start = new Date(now.getTime() - 1 * 60 * 60 * 1000);
  const event1End = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const event1 = await Event.create({
    name: 'AI & Future Technologies',
    category: 'Keynote & Tech',
    startTime: event1Start,
    endTime: event1End,
    venue: 'Seminar Hall A',
    lat: 28.5355,
    lng: 77.391,
    radiusMeters: 50,
    capacity: 500,
    accentColor: '#3B82F6',
  });

  // Event 2: Quantum Computing Colloquium (OVERLAPS with Event 1: Starts in +30m, Ends in +2.5h)
  const event2Start = new Date(now.getTime() + 30 * 60 * 1000);
  const event2End = new Date(now.getTime() + 2.5 * 60 * 60 * 1000);
  const event2 = await Event.create({
    name: 'Quantum Computing Colloquium',
    category: 'Academic Research',
    startTime: event2Start,
    endTime: event2End,
    venue: 'Physics Hall 302',
    lat: 28.536,
    lng: 77.3915,
    radiusMeters: 50,
    capacity: 200,
    accentColor: '#06B6D4',
  });

  // Event 3: TechFest Hackathon (Non-overlapping, starts tomorrow morning)
  const event3Start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const event3End = new Date(now.getTime() + 34 * 60 * 60 * 1000);
  const event3 = await Event.create({
    name: 'TechFest Hackathon',
    category: 'Hackathon & Dev',
    startTime: event3Start,
    endTime: event3End,
    venue: 'Innovation Lab',
    lat: 28.534,
    lng: 77.39,
    radiusMeters: 50,
    capacity: 350,
    accentColor: '#10B981',
  });

  // 4. Create Registrations
  // Student 1 registered for Event 1 and Event 2 (Overlapping events to test clash detection!)
  await Registration.create({
    userId: student1._id,
    eventId: event1._id,
    status: 'Registered',
    ticketId: 'EVT-2026-STUDENT-8472',
    seatTier: 'Tier 1 Priority · Section A',
  });

  await Registration.create({
    userId: student1._id,
    eventId: event2._id,
    status: 'Registered',
    ticketId: 'EVT-2026-STUDENT-8472-B',
    seatTier: 'General Seating',
  });

  await Registration.create({
    userId: student2._id,
    eventId: event1._id,
    status: 'Confirmed',
    ticketId: 'EVT-10482',
    seatTier: 'Section B',
  });

  await Registration.create({
    userId: student3._id,
    eventId: event1._id,
    status: 'Confirmed',
    ticketId: 'EVT-10481',
    seatTier: 'Section C',
  });

  // 5. Create CheckIn logs with TTL (expires 2 hours after event end)
  const event1TTL = new Date(event1End.getTime() + 2 * 60 * 60 * 1000);

  await CheckIn.create([
    {
      userId: student2._id,
      eventId: event1._id,
      result: 'verified',
      reason: 'Pass authenticated',
      method: 'face',
      timestamp: new Date(Date.now() - 30 * 1000),
      expiresAt: event1TTL,
    },
    {
      userId: student3._id,
      eventId: event1._id,
      result: 'verified',
      reason: 'Pass authenticated',
      method: 'qr',
      timestamp: new Date(Date.now() - 90 * 1000),
      expiresAt: event1TTL,
    },
    {
      eventId: event1._id,
      result: 'flagged',
      reason: 'Device session mismatch',
      method: 'qr',
      timestamp: new Date(Date.now() - 150 * 1000),
      expiresAt: event1TTL,
    },
  ]);

  // 6. Initial Security Alert
  await SecurityAlert.create({
    eventId: event1._id,
    type: 'device_mismatch',
    note: 'Unrecognized hardware session attempt detected at Gate Terminal 02',
    timestamp: new Date(Date.now() - 150 * 1000),
    expiresAt: event1TTL,
  });

  return {
    adminUser,
    students: [student1, student2, student3],
    events: [event1, event2, event3],
  };
}
