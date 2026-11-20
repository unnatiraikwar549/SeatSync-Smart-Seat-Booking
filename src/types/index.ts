export type SeatStatus = 'available' | 'occupied' | 'reserved' | 'away';
export type FloorId = 'ground' | 'first' | 'second';
export type BookingStatus = 'reserved' | 'checked_in' | 'away' | 'completed' | 'canceled' | 'auto_released';

export interface Seat {
  id: string;
  number: string;
  floor: FloorId;
  zone: string;
  row: number;
  col: number;
  status: SeatStatus;
  hasPower: boolean;
  isWindow: boolean;
  isQuiet: boolean;
  hasMonitor: boolean;
  isErgonomic: boolean;
  noiseLevel: 'Silent (<30dB)' | 'Quiet (<45dB)' | 'Collaborative (<60dB)';
  occupiedBy?: {
    studentId: string;
    studentName: string;
    bookingId: string;
  };
  awayStartTime?: number;
  awayExpiresAt?: number;
  hasBug?: boolean;
  bug?: WorkstationBug;
}

export interface WorkstationBug {
  category: string;
  severity: 'minor' | 'moderate' | 'critical';
  description: string;
  reportedAt: number;
  reportedBy: string;
}

export interface SupportQuery {
  id: string;
  ticketNumber: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  category: string;
  priority: 'normal' | 'high' | 'urgent';
  floor: FloorId | string;
  seatNumber?: string;
  subject: string;
  message: string;
  createdAt: number;
  status: 'pending' | 'in_progress' | 'resolved';
  adminReply?: string;
  resolvedAt?: number;
}

export interface Booking {
  id: string;
  seatId: string;
  seatNumber: string;
  floor: FloorId;
  zone: string;
  studentId: string;
  studentName: string;
  startTime: number;
  endTime: number;
  durationHours: number;
  status: BookingStatus;
  checkedInAt?: number;
  awayStartedAt?: number;
  qrCodeToken: string;
}

export interface UserPersona {
  id: string;
  name: string;
  role: 'student' | 'admin';
  email: string;
  major?: string;
  studentId?: string;
  avatar: string;
}

export interface ActivityLog {
  id: string;
  timestamp: number;
  type: 'booking' | 'checkin' | 'away' | 'return' | 'release' | 'autorelease' | 'admin';
  description: string;
  seatNumber: string;
  studentName: string;
}

export interface FloorInfo {
  id: FloorId;
  name: string;
  subtitle: string;
  level: number;
  description: string;
  features: string[];
}

export interface FilterOptions {
  floor: FloorId | 'all';
  status: SeatStatus | 'all';
  onlyAvailable: boolean;
  onlyWindow: boolean;
  onlyPower: boolean;
  onlyQuiet: boolean;
  onlyMonitor: boolean;
  searchQuery: string;
}

export type ThemeMode = 'dark' | 'light';
export type CameraPreset = 'iso' | 'aerial' | 'walk' | 'custom';
