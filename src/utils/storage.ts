import { Staff, AttendanceRecord, LeaveRequest, AppSettings } from '../types';
import { getTodayDateString } from './dateUtils';

const STORAGE_KEYS = {
  STAFF: 'staff_attendance_staff_data',
  ATTENDANCE: 'staff_attendance_records_data',
  LEAVES: 'staff_attendance_leaves_data',
  SETTINGS: 'staff_attendance_settings_data',
  AUTH: 'staff_attendance_admin_auth',
};

export const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'Apex Innovations Inc.',
  workStartTime: '09:00',
  workEndTime: '17:00',
  lateTime: '09:15',
  adminUsername: 'admin',
  adminPassword: 'password123',
};

const DEFAULT_STAFF: Staff[] = [
  {
    id: 's-1',
    staffId: 'STF-001',
    name: 'Sarah Jenkins',
    department: 'Operations',
    position: 'Operations Manager',
    phone: '+1 (555) 234-5678',
    joiningDate: '2023-01-15',
    status: 'Active',
  },
  {
    id: 's-2',
    staffId: 'STF-002',
    name: 'Michael Chang',
    department: 'Technology',
    position: 'Senior Engineer',
    phone: '+1 (555) 345-6789',
    joiningDate: '2023-03-20',
    status: 'Active',
  },
  {
    id: 's-3',
    staffId: 'STF-003',
    name: 'Emily Rodriguez',
    department: 'Human Resources',
    position: 'HR Specialist',
    phone: '+1 (555) 456-7890',
    joiningDate: '2023-06-10',
    status: 'Active',
  },
  {
    id: 's-4',
    staffId: 'STF-004',
    name: 'David Kim',
    department: 'Sales',
    position: 'Account Executive',
    phone: '+1 (555) 567-8901',
    joiningDate: '2023-09-01',
    status: 'Active',
  },
  {
    id: 's-5',
    staffId: 'STF-005',
    name: 'Amina Al-Mansoor',
    department: 'Customer Support',
    position: 'Support Lead',
    phone: '+1 (555) 678-9012',
    joiningDate: '2024-02-14',
    status: 'Active',
  },
  {
    id: 's-6',
    staffId: 'STF-006',
    name: 'James Wilson',
    department: 'Finance',
    position: 'Financial Analyst',
    phone: '+1 (555) 789-0123',
    joiningDate: '2024-05-18',
    status: 'Inactive',
  },
];

function generateInitialRecords(): AttendanceRecord[] {
  const today = getTodayDateString();
  
  // Calculate yesterday and day before
  const dToday = new Date();
  const dYesterday = new Date(dToday);
  dYesterday.setDate(dYesterday.getDate() - 1);
  const yesterday = dYesterday.toISOString().split('T')[0];

  const dPrev = new Date(dToday);
  dPrev.setDate(dPrev.getDate() - 2);
  const dayBefore = dPrev.toISOString().split('T')[0];

  return [
    // Today records (some checked in, some not yet)
    {
      id: 'att-today-1',
      staffId: 'STF-001',
      date: today,
      checkIn: '08:55 AM',
      checkOut: null,
      status: 'Present',
    },
    {
      id: 'att-today-2',
      staffId: 'STF-002',
      date: today,
      checkIn: '09:24 AM',
      checkOut: null,
      status: 'Late',
    },
    // Past records
    {
      id: 'att-past-1',
      staffId: 'STF-001',
      date: yesterday,
      checkIn: '08:58 AM',
      checkOut: '05:05 PM',
      status: 'Present',
    },
    {
      id: 'att-past-2',
      staffId: 'STF-002',
      date: yesterday,
      checkIn: '09:02 AM',
      checkOut: '05:10 PM',
      status: 'Present',
    },
    {
      id: 'att-past-3',
      staffId: 'STF-004',
      date: yesterday,
      checkIn: '09:30 AM',
      checkOut: '05:00 PM',
      status: 'Late',
    },
    {
      id: 'att-past-4',
      staffId: 'STF-005',
      date: yesterday,
      checkIn: null,
      checkOut: null,
      status: 'Absent',
    },
    {
      id: 'att-past-5',
      staffId: 'STF-001',
      date: dayBefore,
      checkIn: '08:50 AM',
      checkOut: '05:00 PM',
      status: 'Present',
    },
    {
      id: 'att-past-6',
      staffId: 'STF-002',
      date: dayBefore,
      checkIn: '08:55 AM',
      checkOut: '05:02 PM',
      status: 'Present',
    },
    {
      id: 'att-past-7',
      staffId: 'STF-004',
      date: dayBefore,
      checkIn: '08:59 AM',
      checkOut: '05:15 PM',
      status: 'Present',
    },
  ];
}

function generateInitialLeaves(): LeaveRequest[] {
  const today = getTodayDateString();
  const dToday = new Date();
  
  // Create an approved leave that covers today for Emily Rodriguez (STF-003)
  const dStart = new Date(dToday);
  dStart.setDate(dStart.getDate() - 1);
  const startDate = dStart.toISOString().split('T')[0];

  const dEnd = new Date(dToday);
  dEnd.setDate(dEnd.getDate() + 2);
  const endDate = dEnd.toISOString().split('T')[0];

  return [
    {
      id: 'leave-1',
      staffId: 'STF-003',
      startDate: startDate,
      endDate: endDate,
      reason: 'Annual medical checkup & recovery',
      status: 'Approved',
    },
    {
      id: 'leave-2',
      staffId: 'STF-004',
      startDate: today,
      endDate: today,
      reason: 'Personal family appointment',
      status: 'Pending',
    },
  ];
}

export function loadStaff(): Staff[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (!raw) {
      saveStaff(DEFAULT_STAFF);
      return DEFAULT_STAFF;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_STAFF;
  }
}

export function saveStaff(staff: Staff[]): void {
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
}

export function loadAttendance(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) {
      const init = generateInitialRecords();
      saveAttendance(init);
      return init;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAttendance(records: AttendanceRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
}

export function loadLeaves(): LeaveRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEAVES);
    if (!raw) {
      const init = generateInitialLeaves();
      saveLeaves(init);
      return init;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLeaves(leaves: LeaveRequest[]): void {
  localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function loadAuthStatus(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  } catch {
    return false;
  }
}

export function saveAuthStatus(isLoggedIn: boolean): void {
  localStorage.setItem(STORAGE_KEYS.AUTH, isLoggedIn ? 'true' : 'false');
}
