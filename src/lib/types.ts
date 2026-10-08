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
  status: 'Registered' | 'Confirmed' | 'Waitlisted';
  ticketId: string;
  seatTier?: string;
  doorsOpen?: string;
  accentColor?: string;
}

export interface CheckInRecord {
  id: string;
  name: string;
  ticketId: string;
  timeAgo: string;
  timestamp: Date;
  status: 'verified' | 'flagged' | 'denied';
  reason?: string;
  avatarSeed?: string;
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
