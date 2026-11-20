import { Seat, FloorInfo, UserPersona } from '../types';

export const FLOORS: FloorInfo[] = [
  {
    id: 'ground',
    name: 'Ground Floor',
    subtitle: 'Commons & Collaborative Learning Hub',
    level: 0,
    description: 'Active discussion zones, campus cafe adjacent, multimedia stations & group booths.',
    features: ['Cafe access', 'Collaborative conversation permitted', 'High density power sockets', 'Group study tables']
  },
  {
    id: 'first',
    name: 'First Floor',
    subtitle: 'Silent Study & Window Vista Desks',
    level: 1,
    description: 'Strict silent policy, panoramic campus garden views, dual-monitor workstations & carrels.',
    features: ['Strictly Silent (<30dB)', 'Full-height window light', 'Dual monitor docks', 'Noise-canceling dividers']
  },
  {
    id: 'second',
    name: 'Second Floor',
    subtitle: 'Deep Focus & Postgraduate Research Pods',
    level: 2,
    description: 'Ultra-quiet zone, standing desk options, thesis carrels & ergonomic Herman Miller seating.',
    features: ['Whisper-quiet environment', 'Ergonomic standing desks', 'Reference archives nearby', 'Lockable study nooks']
  }
];

export const PERSONAS: UserPersona[] = [
  {
    id: 'stu-alex-chen',
    name: 'Alex Chen',
    role: 'student',
    email: 'alex.chen@alexandria.edu',
    major: 'Computer Science (Senior)',
    studentId: 'STU-2024-9182',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'stu-maya-patel',
    name: 'Maya Patel',
    role: 'student',
    email: 'm.patel@alexandria.edu',
    major: 'Biomedical Science (Junior)',
    studentId: 'STU-2024-7431',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'admin-sarah-vance',
    name: 'Dr. Sarah Vance',
    role: 'admin',
    email: 's.vance@alexandria.edu',
    major: 'Head Librarian & Operations',
    studentId: 'LIB-ADMIN-01',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
];

// Helper to generate 60 realistic seats
export const generateInitialSeats = (): Seat[] => {
  const seats: Seat[] = [];

  // Ground Floor: 20 seats (G-01 to G-20)
  const groundZones = [
    'Collaborative Commons',
    'Collaborative Commons',
    'Cafe Vista Pods',
    'Tech & Multimedia Hub'
  ];

  for (let i = 1; i <= 20; i++) {
    const numStr = i < 10 ? `0${i}` : `${i}`;
    const zoneIndex = Math.floor((i - 1) / 5);
    const row = Math.floor((i - 1) / 5) + 1;
    const col = ((i - 1) % 5) + 1;
    
    // Initial status distribution: 12 available, 6 occupied, 2 away
    let status: Seat['status'] = 'available';
    let occupiedBy: Seat['occupiedBy'] = undefined;
    let awayStartTime: number | undefined = undefined;
    let awayExpiresAt: number | undefined = undefined;

    if ([3, 7, 11, 14, 18, 19].includes(i)) {
      status = 'occupied';
      occupiedBy = {
        studentId: `STU-GEN-${1000 + i}`,
        studentName: `Student ${i}`,
        bookingId: `BK-INIT-${i}`
      };
    } else if (i === 5) {
      status = 'away';
      occupiedBy = {
        studentId: `STU-GEN-999`,
        studentName: `Jordan Miller`,
        bookingId: `BK-AWAY-5`
      };
      // away for 6 minutes already, 14 minutes remaining
      awayStartTime = Date.now() - (6 * 60 * 1000);
      awayExpiresAt = Date.now() + (14 * 60 * 1000);
    }

    seats.push({
      id: `seat-ground-${numStr}`,
      number: `G-${numStr}`,
      floor: 'ground',
      zone: groundZones[zoneIndex],
      row,
      col,
      status,
      hasPower: true,
      isWindow: i >= 11 && i <= 15,
      isQuiet: false,
      hasMonitor: i % 4 === 0,
      isErgonomic: true,
      noiseLevel: 'Collaborative (<60dB)',
      occupiedBy,
      awayStartTime,
      awayExpiresAt
    });
  }

  // First Floor: 20 seats (F-01 to F-20)
  const firstZones = [
    'Window Panorama Desks',
    'Silent Carrel Section A',
    'Silent Carrel Section B',
    'Dual Monitor Workstations'
  ];

  for (let i = 1; i <= 20; i++) {
    const numStr = i < 10 ? `0${i}` : `${i}`;
    const zoneIndex = Math.floor((i - 1) / 5);
    const row = Math.floor((i - 1) / 5) + 1;
    const col = ((i - 1) % 5) + 1;

    let status: Seat['status'] = 'available';
    let occupiedBy: Seat['occupiedBy'] = undefined;
    let awayStartTime: number | undefined = undefined;
    let awayExpiresAt: number | undefined = undefined;

    if ([2, 4, 8, 12, 16, 20].includes(i)) {
      status = 'occupied';
      occupiedBy = {
        studentId: `STU-GEN-${2000 + i}`,
        studentName: `Student ${i + 20}`,
        bookingId: `BK-INIT-F${i}`
      };
    } else if (i === 9) {
      status = 'away';
      occupiedBy = {
        studentId: `STU-GEN-888`,
        studentName: `Liam Zhang`,
        bookingId: `BK-AWAY-9`
      };
      awayStartTime = Date.now() - (3 * 60 * 1000);
      awayExpiresAt = Date.now() + (17 * 60 * 1000);
    }

    seats.push({
      id: `seat-first-${numStr}`,
      number: `F-${numStr}`,
      floor: 'first',
      zone: firstZones[zoneIndex],
      row,
      col,
      status,
      hasPower: true,
      isWindow: i <= 5 || (i >= 16 && i <= 20),
      isQuiet: true,
      hasMonitor: i >= 16,
      isErgonomic: true,
      noiseLevel: 'Silent (<30dB)',
      occupiedBy,
      awayStartTime,
      awayExpiresAt
    });
  }

  // Second Floor: 20 seats (S-01 to S-20)
  const secondZones = [
    'Postgrad Research Pods',
    'Ultra-Silent Thesis Nooks',
    'Standing Desk Ergonomics',
    'Archive Study Enclaves'
  ];

  for (let i = 1; i <= 20; i++) {
    const numStr = i < 10 ? `0${i}` : `${i}`;
    const zoneIndex = Math.floor((i - 1) / 5);
    const row = Math.floor((i - 1) / 5) + 1;
    const col = ((i - 1) % 5) + 1;

    let status: Seat['status'] = 'available';
    let occupiedBy: Seat['occupiedBy'] = undefined;
    let awayStartTime: number | undefined = undefined;
    let awayExpiresAt: number | undefined = undefined;

    if ([1, 6, 10, 15, 17].includes(i)) {
      status = 'occupied';
      occupiedBy = {
        studentId: `STU-GEN-${3000 + i}`,
        studentName: `Researcher ${i}`,
        bookingId: `BK-INIT-S${i}`
      };
    } else if (i === 13) {
      status = 'away';
      occupiedBy = {
        studentId: `STU-GEN-777`,
        studentName: `Sophia Al-Mansoor`,
        bookingId: `BK-AWAY-13`
      };
      awayStartTime = Date.now() - (12 * 60 * 1000);
      awayExpiresAt = Date.now() + (8 * 60 * 1000);
    }

    seats.push({
      id: `seat-second-${numStr}`,
      number: `S-${numStr}`,
      floor: 'second',
      zone: secondZones[zoneIndex],
      row,
      col,
      status,
      hasPower: true,
      isWindow: i >= 6 && i <= 10,
      isQuiet: true,
      hasMonitor: i <= 5,
      isErgonomic: true,
      noiseLevel: 'Silent (<30dB)',
      occupiedBy,
      awayStartTime,
      awayExpiresAt
    });
  }

  return seats;
};
