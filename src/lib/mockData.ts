import { EventItem, CheckInRecord, SecuritySettings } from './types';

// Zero fake data - initial baselines empty until real data loaded from MongoDB
export const MOCK_EVENTS: EventItem[] = [];

export const INITIAL_CHECKINS: CheckInRecord[] = [];

export const INITIAL_METRICS = {
  totalRegistered: 0,
  checkedIn: 0,
  capacityPercentage: '0.0',
};

export const INITIAL_SECURITY_SETTINGS: SecuritySettings = {
  strictGeoFence: true,
  dynamicQR: true,
  singleDeviceSession: true,
  allowGuests: false,
};

export const INITIAL_SECURITY_ACTIVITY = {
  locationFailures: 0,
  expiredQrAttempts: 0,
  deviceMismatches: 0,
};
