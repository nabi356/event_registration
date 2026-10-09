import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const uri = 'mongodb+srv://dancernabi_db_user:Nabi2005@cluster0.blsmvvs.mongodb.net/eventra?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  console.log('Connected successfully!');

  // Define schemas
  const UserSchema = new Schema({
    name: String,
    enrollmentNo: { type: String, unique: true },
    university: String,
    email: { type: String, unique: true },
    passwordHash: String,
    role: String,
    faceEmbedding: [Number],
    faceUpdatedAt: Date,
    deviceId: String,
    department: String,
    enrolledYear: String,
  }, { timestamps: true });

  const EventSchema = new Schema({
    name: String,
    category: String,
    startTime: Date,
    endTime: Date,
    venue: String,
    lat: Number,
    lng: Number,
    radiusMeters: Number,
    capacity: Number,
    accentColor: String,
  }, { timestamps: true });

  const RegistrationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    status: String,
    ticketId: { type: String, unique: true },
    seatTier: String,
  }, { timestamps: true });

  const CheckInSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    result: String,
    reason: String,
    method: String,
    timestamp: { type: Date, default: Date.now },
    expiresAt: Date,
  }, { timestamps: true });
  CheckInSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  const SecurityAlertSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    type: String,
    note: String,
    timestamp: { type: Date, default: Date.now },
    expiresAt: Date,
  }, { timestamps: true });
  SecurityAlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
  const Registration = mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema);
  const CheckIn = mongoose.models.CheckIn || mongoose.model('CheckIn', CheckInSchema);
  const SecurityAlert = mongoose.models.SecurityAlert || mongoose.model('SecurityAlert', SecurityAlertSchema);

  // Clear collections
  console.log('Clearing old collections...');
  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Registration.deleteMany({}),
    CheckIn.deleteMany({}),
    SecurityAlert.deleteMany({}),
  ]);

  // Synthetic normalized 128-d face embedding
  function generateSyntheticEmbedding(seed) {
    const embedding = [];
    for (let i = 0; i < 128; i++) {
      embedding.push(Math.sin(seed * (i + 1) * 0.17) * 0.5 + Math.cos((seed + i) * 0.23) * 0.5);
    }
    const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    return embedding.map((v) => Number((v / norm).toFixed(6)));
  }

  const salt = await bcrypt.genSalt(10);
  const studentPasswordHash = await bcrypt.hash('student123', salt);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);

  console.log('Creating demo users...');
  const admin = await User.create({
    name: 'K. Nabidul Hasan (Operations Lead)',
    enrollmentNo: 'MGMT-2026-001',
    university: 'Apex Institute of Technology',
    email: 'admin@eventra.io',
    passwordHash: adminPasswordHash,
    role: 'management',
    department: 'Campus Safety & Gate Operations',
    enrolledYear: 'Staff Lead',
  });

  const student1 = await User.create({
    name: 'K. Nabidul Hasan',
    enrollmentNo: 'UNI-2026-8472',
    university: 'Apex Institute of Technology',
    email: 'k.nabidul.hasan@university.edu',
    passwordHash: studentPasswordHash,
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
    passwordHash: studentPasswordHash,
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
    passwordHash: studentPasswordHash,
    role: 'student',
    faceEmbedding: generateSyntheticEmbedding(8474),
    faceUpdatedAt: new Date(),
    department: 'Data Science & Cybernetics',
    enrolledYear: 'Class of 2027',
  });

  console.log('Creating 3 events (including 2 overlapping in time)...');
  const now = new Date();
  const event1Start = new Date(now.getTime() - 1 * 60 * 60 * 1000);
  const event1End = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const event1 = await Event.create({
    name: 'AI & Future Technologies',
    category: 'Keynote & Tech',
    startTime: event1Start,
    endTime: event1End,
    venue: 'Seminar Hall A',
    lat: 28.5355,
    lng: 77.3910,
    radiusMeters: 50,
    capacity: 500,
    accentColor: '#3B82F6',
  });

  const event2Start = new Date(now.getTime() + 30 * 60 * 1000);
  const event2End = new Date(now.getTime() + 2.5 * 60 * 60 * 1000);
  const event2 = await Event.create({
    name: 'Quantum Computing Colloquium',
    category: 'Academic Research',
    startTime: event2Start,
    endTime: event2End,
    venue: 'Physics Hall 302',
    lat: 28.5360,
    lng: 77.3915,
    radiusMeters: 50,
    capacity: 200,
    accentColor: '#06B6D4',
  });

  const event3Start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const event3End = new Date(now.getTime() + 34 * 60 * 60 * 1000);
  const event3 = await Event.create({
    name: 'TechFest Hackathon',
    category: 'Hackathon & Dev',
    startTime: event3Start,
    endTime: event3End,
    venue: 'Innovation Lab',
    lat: 28.5340,
    lng: 77.3900,
    radiusMeters: 50,
    capacity: 350,
    accentColor: '#10B981',
  });

  console.log('Creating registrations...');
  await Registration.create([
    {
      userId: student1._id,
      eventId: event1._id,
      status: 'Registered',
      ticketId: 'EVT-2026-STUDENT-8472',
      seatTier: 'Tier 1 Priority · Section A',
    },
    {
      userId: student1._id,
      eventId: event2._id,
      status: 'Registered',
      ticketId: 'EVT-2026-STUDENT-8472-B',
      seatTier: 'General Seating',
    },
    {
      userId: student2._id,
      eventId: event1._id,
      status: 'Confirmed',
      ticketId: 'EVT-10482',
      seatTier: 'Section B',
    },
    {
      userId: student3._id,
      eventId: event1._id,
      status: 'Confirmed',
      ticketId: 'EVT-10481',
      seatTier: 'Section C',
    },
  ]);

  console.log('Creating check-in telemetry and security alerts with TTL indexes...');
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
      reason: 'Dynamic QR verified',
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

  await SecurityAlert.create({
    eventId: event1._id,
    type: 'device_mismatch',
    note: 'Unrecognized hardware session attempt detected at Gate Terminal 02',
    timestamp: new Date(Date.now() - 150 * 1000),
    expiresAt: event1TTL,
  });

  console.log('MongoDB Atlas seeded successfully!');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
