import { EventItem, CheckInRecord, SecuritySettings } from './types';

export const CURRENT_STUDENT = {
  name: 'K. Nabidul Hasan',
  studentId: 'UNI-2026-8472',
  email: 'k.nabidul.hasan@university.edu',
  avatar: 'KH',
  department: 'Computer Science & AI Engineering',
  enrolledYear: 'Class of 2027',
};

export const MOCK_EVENTS: EventItem[] = [
  {
    id: 'evt-ai-future',
    name: 'AI & Future Technologies',
    category: 'Keynote & Tech',
    date: '25 OCT 2026',
    time: '6:00 PM',
    venue: 'Seminar Hall A',
    status: 'Registered',
    ticketId: 'EVT-2026-STUDENT-8472',
    seatTier: 'Tier 1 Priority · Section A',
    doorsOpen: '5:30 PM',
    accentColor: '#3B82F6', // Sapphire blue
  },
  {
    id: 'evt-techfest',
    name: 'TechFest Hackathon',
    category: 'Hackathon & Dev',
    date: '18 OCT 2026',
    time: '9:00 AM',
    venue: 'Innovation Lab',
    status: 'Registered',
    ticketId: 'EVT-2026-STUDENT-8473',
    seatTier: 'Team Pod #14',
    doorsOpen: '8:15 AM',
    accentColor: '#10B981', // Emerald green
  },
  {
    id: 'evt-cultural-night',
    name: 'Cultural Night',
    category: 'Arts & Music',
    date: '22 OCT 2026',
    time: '7:30 PM',
    venue: 'University Auditorium',
    status: 'Registered',
    ticketId: 'EVT-2026-STUDENT-8474',
    seatTier: 'Orchestra Row G',
    doorsOpen: '6:45 PM',
    accentColor: '#8B5CF6', // Deep amethyst
  },
  {
    id: 'evt-quantum-symposium',
    name: 'Quantum Computing Colloquium',
    category: 'Academic Research',
    date: '29 OCT 2026',
    time: '3:00 PM',
    venue: 'Physics Hall 302',
    status: 'Confirmed',
    ticketId: 'EVT-2026-STUDENT-8475',
    seatTier: 'General Seating',
    doorsOpen: '2:30 PM',
    accentColor: '#06B6D4',
  },
];

export const INITIAL_CHECKINS: CheckInRecord[] = [
  {
    id: 'chk-1',
    name: 'Aarav Shah',
    ticketId: 'EVT-10482',
    timeAgo: 'Just now',
    timestamp: new Date('2026-10-25T17:59:50Z'),
    status: 'verified',
  },
  {
    id: 'chk-2',
    name: 'Riya Patel',
    ticketId: 'EVT-10481',
    timeAgo: '12 sec ago',
    timestamp: new Date('2026-10-25T17:59:40Z'),
    status: 'verified',
  },
  {
    id: 'chk-3',
    name: 'Unknown Device',
    ticketId: 'EVT-10479',
    timeAgo: '21 sec ago',
    timestamp: new Date('2026-10-25T17:59:30Z'),
    status: 'flagged',
    reason: 'Device session mismatch',
  },
  {
    id: 'chk-4',
    name: 'Elena Rostova',
    ticketId: 'EVT-10478',
    timeAgo: '45 sec ago',
    timestamp: new Date('2026-10-25T17:59:00Z'),
    status: 'verified',
  },
  {
    id: 'chk-5',
    name: 'Marcus Vance',
    ticketId: 'EVT-10476',
    timeAgo: '1 min ago',
    timestamp: new Date('2026-10-25T17:58:30Z'),
    status: 'flagged',
    reason: 'Perimeter breach (240m away)',
  },
  {
    id: 'chk-6',
    name: 'Sofia Chen',
    ticketId: 'EVT-10475',
    timeAgo: '2 mins ago',
    timestamp: new Date('2026-10-25T17:57:00Z'),
    status: 'verified',
  },
];

export const INITIAL_METRICS = {
  totalRegistered: 1248,
  checkedIn: 684,
  get capacityPercentage() {
    return ((this.checkedIn / this.totalRegistered) * 100).toFixed(1);
  },
};

export const INITIAL_SECURITY_SETTINGS: SecuritySettings = {
  strictGeoFence: true,
  dynamicQR: true,
  singleDeviceSession: true,
  allowGuests: false,
};

export const INITIAL_SECURITY_ACTIVITY = {
  locationFailures: 3,
  expiredQrAttempts: 7,
  deviceMismatches: 2,
};

export const RANDOM_STUDENT_NAMES = [
  'Aarav Shah',
  'Riya Patel',
  'Zayn Malik',
  'Devika Sharma',
  'Priya Nair',
  'Aditya Verma',
  'Tariq Al-Mansoor',
  'Liam Thorne',
  'Mei-Ling Zhou',
  'Kenji Sato',
  'Chloe Dupont',
  'Hannah Baker',
  'Lucas Rossi',
  'Nia Washington',
];
