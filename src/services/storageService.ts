import { Seat, Booking, ActivityLog, UserPersona, SeatStatus } from '../types';
import { generateInitialSeats, PERSONAS } from '../data/initialSeats';

const STORAGE_KEYS = {
  SEATS: 'seatsync_seats_v1',
  BOOKINGS: 'seatsync_bookings_v1',
  LOGS: 'seatsync_logs_v1',
  ACTIVE_USER: 'seatsync_active_user_v1',
  CONFIG: 'seatsync_config_v1'
};

export interface AppConfig {
  demoFastTimer: boolean; // if true, away timer is 30s instead of 20m for hackathon presentation
  soundEnabled: boolean;
  supabaseConnected: boolean;
  supabaseUrl?: string;
  supabaseKey?: string;
}

const DEFAULT_CONFIG: AppConfig = {
  demoFastTimer: false,
  soundEnabled: true,
  supabaseConnected: false
};

class StorageService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('seatsync_broadcast');
        this.channel.onmessage = () => {
          this.notifyListeners();
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or error:', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', () => {
        this.notifyListeners();
      });
      // Start background auto-release timer interval
      setInterval(() => {
        this.checkExpiredAwayTimers();
      }, 1000);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => fn());
  }

  private broadcast() {
    this.notifyListeners();
    if (this.channel) {
      this.channel.postMessage({ type: 'SYNC_UPDATE', timestamp: Date.now() });
    }
  }

  public getConfig(): AppConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return data ? { ...DEFAULT_CONFIG, ...JSON.parse(data) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  public saveConfig(config: Partial<AppConfig>) {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
    this.broadcast();
  }

  public getSeats(): Seat[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SEATS);
      if (!data) {
        const initial = generateInitialSeats();
        this.saveSeats(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return generateInitialSeats();
    }
  }

  public saveSeats(seats: Seat[]) {
    localStorage.setItem(STORAGE_KEYS.SEATS, JSON.stringify(seats));
    this.broadcast();
  }

  public getBookings(): Booking[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveBookings(bookings: Booking[]) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    this.broadcast();
  }

  public getLogs(): ActivityLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (!data) {
        const defaultLogs: ActivityLog[] = [
          {
            id: 'log-1',
            timestamp: Date.now() - 3600000,
            type: 'checkin',
            description: 'Student checked in to Seat F-04',
            seatNumber: 'F-04',
            studentName: 'Maya Patel'
          },
          {
            id: 'log-2',
            timestamp: Date.now() - 1800000,
            type: 'away',
            description: 'Away timer activated (20 min) on Seat G-05',
            seatNumber: 'G-05',
            studentName: 'Jordan Miller'
          },
          {
            id: 'log-3',
            timestamp: Date.now() - 900000,
            type: 'booking',
            description: 'Seat S-10 reserved for research study',
            seatNumber: 'S-10',
            studentName: 'Alex Chen'
          }
        ];
        this.saveLogs(defaultLogs);
        return defaultLogs;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public saveLogs(logs: ActivityLog[]) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 50))); // Keep last 50
    this.broadcast();
  }

  public addLog(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const logs = this.getLogs();
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now()
    };
    logs.unshift(newLog);
    this.saveLogs(logs);
  }

  public getActiveUser(): UserPersona {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      return data ? JSON.parse(data) : PERSONAS[0];
    } catch {
      return PERSONAS[0];
    }
  }

  public setActiveUser(user: UserPersona) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    this.broadcast();
  }

  // CORE LOGIC: Book Seat
  public bookSeat(
    seatId: string,
    user: UserPersona,
    durationHours: number = 2
  ): { success: boolean; booking?: Booking; error?: string } {
    const seats = this.getSeats();
    const seatIndex = seats.findIndex((s) => s.id === seatId);

    if (seatIndex === -1) {
      return { success: false, error: 'Seat not found in library directory.' };
    }

    const seat = seats[seatIndex];
    if (seat.status !== 'available') {
      return { success: false, error: `Seat ${seat.number} is already occupied or reserved.` };
    }

    // Check if user already has an active booking
    const bookings = this.getBookings();
    const existingActive = bookings.find(
      (b) => b.studentId === (user.studentId || user.id) && ['reserved', 'checked_in', 'away'].includes(b.status)
    );

    if (existingActive) {
      return {
        success: false,
        error: `You already hold active booking #${existingActive.id} on Seat ${existingActive.seatNumber}. Please release it first.`
      };
    }

    const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}-${seat.number.replace('-', '')}`;
    const qrToken = `SEATSYNC:${bookingId}:${seat.id}:${user.studentId || user.id}:${Date.now()}`;

    const newBooking: Booking = {
      id: bookingId,
      seatId: seat.id,
      seatNumber: seat.number,
      floor: seat.floor,
      zone: seat.zone,
      studentId: user.studentId || user.id,
      studentName: user.name,
      startTime: Date.now(),
      endTime: Date.now() + durationHours * 3600 * 1000,
      durationHours,
      status: 'reserved',
      qrCodeToken: qrToken
    };

    // Update Seat to reserved by user
    seats[seatIndex] = {
      ...seat,
      status: 'reserved',
      occupiedBy: {
        studentId: user.studentId || user.id,
        studentName: user.name,
        bookingId: bookingId
      }
    };

    bookings.unshift(newBooking);
    this.saveSeats(seats);
    this.saveBookings(bookings);

    this.addLog({
      type: 'booking',
      description: `Seat ${seat.number} reserved by ${user.name} (${durationHours}h)`,
      seatNumber: seat.number,
      studentName: user.name
    });

    return { success: true, booking: newBooking };
  }

  // Check in via QR code
  public checkIn(bookingIdOrToken: string): { success: boolean; booking?: Booking; error?: string } {
    const bookings = this.getBookings();
    const booking = bookings.find(
      (b) => b.id === bookingIdOrToken || b.qrCodeToken === bookingIdOrToken
    );

    if (!booking) {
      return { success: false, error: 'Invalid QR code or booking reference not found.' };
    }

    if (booking.status === 'checked_in') {
      return { success: false, error: `Student is already checked into Seat ${booking.seatNumber}.` };
    }

    if (['completed', 'canceled', 'auto_released'].includes(booking.status)) {
      return { success: false, error: `This booking is no longer active (Status: ${booking.status}).` };
    }

    const seats = this.getSeats();
    const seatIndex = seats.findIndex((s) => s.id === booking.seatId);

    booking.status = 'checked_in';
    booking.checkedInAt = Date.now();

    if (seatIndex !== -1) {
      seats[seatIndex] = {
        ...seats[seatIndex],
        status: 'occupied',
        awayStartTime: undefined,
        awayExpiresAt: undefined
      };
      this.saveSeats(seats);
    }

    this.saveBookings(bookings);

    this.addLog({
      type: 'checkin',
      description: `QR Verified: ${booking.studentName} checked in to Seat ${booking.seatNumber}`,
      seatNumber: booking.seatNumber,
      studentName: booking.studentName
    });

    return { success: true, booking };
  }

  // 20-Minute Away Timer Start
  public startAwayTimer(bookingId: string): { success: boolean; expiresAt?: number; error?: string } {
    const bookings = this.getBookings();
    const booking = bookings.find((b) => b.id === bookingId);

    if (!booking || !['checked_in', 'reserved'].includes(booking.status)) {
      return { success: false, error: 'You must have an active checked-in seat to start away break.' };
    }

    const config = this.getConfig();
    // 30 seconds for fast demo mode, or 20 full minutes (1200000ms)
    const durationMs = config.demoFastTimer ? 30 * 1000 : 20 * 60 * 1000;
    const now = Date.now();
    const expiresAt = now + durationMs;

    booking.status = 'away';
    booking.awayStartedAt = now;

    const seats = this.getSeats();
    const seatIndex = seats.findIndex((s) => s.id === booking.seatId);
    if (seatIndex !== -1) {
      seats[seatIndex] = {
        ...seats[seatIndex],
        status: 'away',
        awayStartTime: now,
        awayExpiresAt: expiresAt
      };
      this.saveSeats(seats);
    }

    this.saveBookings(bookings);

    this.addLog({
      type: 'away',
      description: `Away timer started for ${booking.studentName} (${config.demoFastTimer ? '30s Demo' : '20 min'})`,
      seatNumber: booking.seatNumber,
      studentName: booking.studentName
    });

    return { success: true, expiresAt };
  }

  // Cancel Away Timer / Return to seat
  public returnFromAway(bookingId: string): { success: boolean; error?: string } {
    const bookings = this.getBookings();
    const booking = bookings.find((b) => b.id === bookingId);

    if (!booking || booking.status !== 'away') {
      return { success: false, error: 'Booking is not currently in away state.' };
    }

    booking.status = 'checked_in';
    booking.awayStartedAt = undefined;

    const seats = this.getSeats();
    const seatIndex = seats.findIndex((s) => s.id === booking.seatId);
    if (seatIndex !== -1) {
      seats[seatIndex] = {
        ...seats[seatIndex],
        status: 'occupied',
        awayStartTime: undefined,
        awayExpiresAt: undefined
      };
      this.saveSeats(seats);
    }

    this.saveBookings(bookings);

    this.addLog({
      type: 'return',
      description: `${booking.studentName} returned to Seat ${booking.seatNumber} safely`,
      seatNumber: booking.seatNumber,
      studentName: booking.studentName
    });

    return { success: true };
  }

  // Student manual release or cancel
  public releaseSeat(bookingId: string): { success: boolean; error?: string } {
    const bookings = this.getBookings();
    const booking = bookings.find((b) => b.id === bookingId);

    if (!booking) {
      return { success: false, error: 'Booking not found.' };
    }

    booking.status = 'canceled';
    booking.endTime = Date.now();

    const seats = this.getSeats();
    const seatIndex = seats.findIndex((s) => s.id === booking.seatId);
    if (seatIndex !== -1) {
      seats[seatIndex] = {
        ...seats[seatIndex],
        status: 'available',
        occupiedBy: undefined,
        awayStartTime: undefined,
        awayExpiresAt: undefined
      };
      this.saveSeats(seats);
    }

    this.saveBookings(bookings);

    this.addLog({
      type: 'release',
      description: `Seat ${booking.seatNumber} released by ${booking.studentName}`,
      seatNumber: booking.seatNumber,
      studentName: booking.studentName
    });

    return { success: true };
  }

  // Background Auto-Release Engine (checks every second)
  public checkExpiredAwayTimers(): number {
    const seats = this.getSeats();
    const bookings = this.getBookings();
    const now = Date.now();
    let releasedCount = 0;

    seats.forEach((seat, idx) => {
      if (seat.status === 'away' && seat.awayExpiresAt && seat.awayExpiresAt <= now) {
        // Seat timed out!
        const bIdx = bookings.findIndex((b) => b.id === seat.occupiedBy?.bookingId);
        const studentName = seat.occupiedBy?.studentName || 'Student';

        if (bIdx !== -1) {
          bookings[bIdx].status = 'auto_released';
          bookings[bIdx].endTime = now;
        }

        seats[idx] = {
          ...seat,
          status: 'available',
          occupiedBy: undefined,
          awayStartTime: undefined,
          awayExpiresAt: undefined
        };

        releasedCount++;

        this.addLog({
          type: 'autorelease',
          description: `AUTO-RELEASE: Seat ${seat.number} vacated (20-min grace expired for ${studentName})`,
          seatNumber: seat.number,
          studentName: studentName
        });
      }
    });

    if (releasedCount > 0) {
      this.saveSeats(seats);
      this.saveBookings(bookings);
    }

    return releasedCount;
  }

  // Admin Actions
  public adminSetSeatStatus(seatId: string, status: SeatStatus, adminName: string = 'Admin') {
    const seats = this.getSeats();
    const seat = seats.find((s) => s.id === seatId);
    if (!seat) return;

    const previousStatus = seat.status;
    seat.status = status;

    if (status === 'available') {
      if (seat.occupiedBy?.bookingId) {
        const bookings = this.getBookings();
        const b = bookings.find((bk) => bk.id === seat.occupiedBy?.bookingId);
        if (b) {
          b.status = 'completed';
          this.saveBookings(bookings);
        }
      }
      seat.occupiedBy = undefined;
      seat.awayStartTime = undefined;
      seat.awayExpiresAt = undefined;
    }

    this.saveSeats(seats);

    this.addLog({
      type: 'admin',
      description: `Admin changed Seat ${seat.number} status from ${previousStatus} to ${status}`,
      seatNumber: seat.number,
      studentName: adminName
    });
  }

  public adminAddSeat(newSeatData: Partial<Seat>): Seat {
    const seats = this.getSeats();
    const id = `seat-${newSeatData.floor || 'ground'}-${Date.now().toString(36)}`;
    const newSeat: Seat = {
      id,
      number: newSeatData.number || `X-${seats.length + 1}`,
      floor: newSeatData.floor || 'ground',
      zone: newSeatData.zone || 'General Study',
      row: newSeatData.row || 1,
      col: newSeatData.col || 1,
      status: 'available',
      hasPower: newSeatData.hasPower ?? true,
      isWindow: newSeatData.isWindow ?? false,
      isQuiet: newSeatData.isQuiet ?? true,
      hasMonitor: newSeatData.hasMonitor ?? false,
      isErgonomic: newSeatData.isErgonomic ?? true,
      noiseLevel: newSeatData.noiseLevel || 'Quiet (<45dB)'
    };

    seats.push(newSeat);
    this.saveSeats(seats);

    this.addLog({
      type: 'admin',
      description: `Admin installed new Seat ${newSeat.number} on ${newSeat.floor} floor`,
      seatNumber: newSeat.number,
      studentName: 'Library Staff'
    });

    return newSeat;
  }

  public adminDeleteSeat(seatId: string) {
    let seats = this.getSeats();
    const seat = seats.find((s) => s.id === seatId);
    if (!seat) return;

    seats = seats.filter((s) => s.id !== seatId);
    this.saveSeats(seats);

    this.addLog({
      type: 'admin',
      description: `Admin decommissioned Seat ${seat.number}`,
      seatNumber: seat.number,
      studentName: 'Library Staff'
    });
  }

  public resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.SEATS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);

    const initial = generateInitialSeats();
    this.saveSeats(initial);
    this.broadcast();
  }
}

export const storageService = new StorageService();
