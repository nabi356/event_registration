export type ViewMode = 'student' | 'management';

export type GeoFenceStatus = 'verified' | 'outside' | 'unavailable';
export type DeviceLockStatus = 'verified' | 'mismatch';

export interface EventItem {
  id: string;
  name: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  status: 'Registered' | 'Confirmed' | 'Waitlisted' | 'Available';
  ticketId: string;
  seatTier?: string;
  doorsOpen?: string;
  accentColor?: string;
  imageUrl?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  registrationDeadline?: string | Date;
  lat?: number;
  lng?: number;
  radiusMeters?: number;
  capacity?: number;
  registeredCount?: number;
  checkedInCount?: number;
}

export interface CheckInRecord {
  id: string;
  name: string;
  ticketId: string;
  timeAgo: string;
  timestamp: Date | string;
  status: 'verified' | 'flagged' | 'denied';
  reason?: string;
  avatarSeed?: string;
  method?: string;
}

export interface SecuritySettings {
  strictGeoFence: boolean;
  dynamicQR: boolean;
  singleDeviceSession: boolean;
  allowGuests: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: number;
}

export interface AuthUserData {
  id: string;
  name: string;
  enrollmentNo: string;
  university: string;
  email: string;
  role: 'student' | 'management';
  department?: string;
  enrolledYear?: string;
  hasFaceEnrolled: boolean;
  faceUpdatedAt?: string | Date;
  deviceId?: string;
}

export interface UserRegistration {
  registrationId: string;
  ticketId: string;
  status: string;
  seatTier: string;
  event: {
    id: string;
    name: string;
    category?: string;
    startTime: string | Date;
    endTime: string | Date;
    date: string;
    time: string;
    venue: string;
    lat: number;
    lng: number;
    radiusMeters: number;
    accentColor: string;
  };
}

