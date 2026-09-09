export type StaffStatus = 'Active' | 'Inactive';

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'On Leave';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Staff {
  id: string;
  staffId: string;
  name: string;
  department: string;
  position: string;
  phone: string;
  joiningDate: string; // YYYY-MM-DD
  status: StaffStatus;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // e.g. "09:05 AM"
  checkOut: string | null; // e.g. "05:15 PM"
  status: AttendanceStatus;
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: LeaveStatus;
}

export interface AppSettings {
  companyName: string;
  workStartTime: string; // e.g. "09:00"
  workEndTime: string; // e.g. "17:00"
  lateTime: string; // e.g. "09:15"
  adminUsername: string;
  adminPassword: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'staff'
  | 'attendance'
  | 'history'
  | 'leave'
  | 'reports'
  | 'settings';
