import { useState } from 'react';
import { 
  LogIn, 
  LogOut, 
  Search, 
  Calendar, 
  Clock, 
  AlertCircle,
  Palmtree,
  Users,
  Sun
} from 'lucide-react';
import { Staff, AttendanceRecord, LeaveRequest, AppSettings } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { 
  getTodayDateString, 
  formatCurrentDisplayDate, 
  getCurrentTimeString, 
  getCurrentTime24, 
  isTimeLate, 
  isDateInRange,
  isSunday
} from '../utils/dateUtils';

interface AttendanceViewProps {
  staffList: Staff[];
  attendanceRecords: AttendanceRecord[];
  leaves: LeaveRequest[];
  settings: AppSettings;
  onRecordCheckIn: (staffId: string, timeString: string, isLate: boolean) => void;
  onRecordCheckOut: (staffId: string, timeString: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function AttendanceView({
  staffList,
  attendanceRecords,
  leaves,
  settings,
  onRecordCheckIn,
  onRecordCheckOut,
  showToast,
}: AttendanceViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const today = getTodayDateString();

  // Filter only active staff for daily attendance
  const activeStaff = staffList.filter((s) => s.status === 'Active');

  const filteredStaff = activeStaff.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.staffId.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  });

  const handleCheckInClick = (staff: Staff) => {
    // 1. Check if already has approved leave
    const hasApprovedLeave = leaves.some(
      (l) =>
        l.staffId === staff.staffId &&
        l.status === 'Approved' &&
        isDateInRange(today, l.startDate, l.endDate)
    );

    if (hasApprovedLeave) {
      showToast(`${staff.name} is scheduled on Approved Leave today.`, 'error');
      return;
    }

    // 2. Check if already checked in today
    const existing = attendanceRecords.find(
      (a) => a.staffId === staff.staffId && a.date === today
    );

    if (existing && existing.checkIn) {
      showToast(`${staff.name} has already checked in today at ${existing.checkIn}.`, 'error');
      return;
    }

    // Record check in
    const timeStr = getCurrentTimeString();
    const time24 = getCurrentTime24();
    const isLate = isTimeLate(time24, settings.lateTime);

    onRecordCheckIn(staff.staffId, timeStr, isLate);
    showToast(
      `${staff.name} checked in successfully at ${timeStr} (${isLate ? 'Marked Late' : 'Marked Present'}).`,
      'success'
    );
  };

  const handleCheckOutClick = (staff: Staff) => {
    // 1. Check if checked in first
    const existing = attendanceRecords.find(
      (a) => a.staffId === staff.staffId && a.date === today
    );

    if (!existing || !existing.checkIn) {
      showToast(`Cannot check out: ${staff.name} has not checked in yet today.`, 'error');
      return;
    }

    // 2. Check if already checked out
    if (existing.checkOut) {
      showToast(`${staff.name} has already checked out today at ${existing.checkOut}.`, 'error');
      return;
    }

    // Record check out
    const timeStr = getCurrentTimeString();
    onRecordCheckOut(staff.staffId, timeStr);
    showToast(`${staff.name} checked out successfully at ${timeStr}.`, 'success');
  };

  return (
    <div id="attendance-view" className="space-y-6">
      {/* Date and Rules Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Attendance Register
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {formatCurrentDisplayDate()}
          </h2>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Work Hours: <strong className="text-slate-700 font-semibold">{settings.workStartTime} - {settings.workEndTime}</strong>
            </span>
            <span className="inline-flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Late Cutoff: <strong className="text-amber-700 font-semibold">After {settings.lateTime}</strong>
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Schedule: <strong className="text-indigo-700 font-semibold">Mon–Sat (Sunday Off)</strong>
            </span>
          </div>
        </div>

        {/* Quick Search */}
        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="attendance-search-input"
              type="text"
              placeholder="Search staff by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Sunday Off Day Banner */}
      {isSunday(today) && (
        <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-950">Sunday Off Day / Weekly Holiday</h4>
            <p className="text-xs text-indigo-700 mt-0.5">
              Working days are Monday through Saturday. Sunday is treated as an official off day and does not count as absent.
            </p>
          </div>
        </div>
      )}

      {/* Staff Attendance Action Cards / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">No active staff members found</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {searchQuery ? `No staff matching "${searchQuery}"` : 'Add staff to manage attendance.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="today-attendance-sheet" className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Staff Member</th>
                  <th className="py-3.5 px-4">Department / Position</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4">Check-in Time</th>
                  <th className="py-3.5 px-4">Check-out Time</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Attendance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredStaff.map((staff) => {
                  // Check if approved leave covers today
                  const onLeave = leaves.some(
                    (l) =>
                      l.staffId === staff.staffId &&
                      l.status === 'Approved' &&
                      isDateInRange(today, l.startDate, l.endDate)
                  );

                  // Find today's attendance record
                  const record = attendanceRecords.find(
                    (a) => a.staffId === staff.staffId && a.date === today
                  );

                  const hasCheckedIn = Boolean(record?.checkIn);
                  const hasCheckedOut = Boolean(record?.checkOut);

                  let computedStatus = isSunday(today) ? 'Weekly Off' : 'Absent';
                  if (onLeave) {
                    computedStatus = 'On Leave';
                  } else if (hasCheckedIn && record) {
                    computedStatus = record.status;
                  }

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & ID */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-semibold text-slate-900">{staff.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{staff.staffId}</div>
                      </td>

                      {/* Department */}
                      <td className="py-4 px-4">
                        <div className="text-slate-800 font-medium">{staff.department}</div>
                        <div className="text-xs text-slate-500">{staff.position}</div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge
                          status={computedStatus as 'Present' | 'Late' | 'Absent' | 'On Leave' | 'Weekly Off'}
                        />
                      </td>

                      {/* Check-in time */}
                      <td className="py-4 px-4 font-mono text-xs sm:text-sm text-slate-700">
                        {record?.checkIn ? (
                          <span className="font-semibold text-slate-900">{record.checkIn}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Check-out time */}
                      <td className="py-4 px-4 font-mono text-xs sm:text-sm text-slate-700">
                        {record?.checkOut ? (
                          <span className="font-semibold text-slate-900">{record.checkOut}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Action Buttons (Large, Clear, Responsive) */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        {onLeave ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-2 rounded-lg border border-sky-200">
                            <Palmtree className="w-4 h-4 text-sky-500" />
                            <span>On Approved Leave</span>
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            {/* Check In Button */}
                            <button
                              id={`check-in-btn-${staff.staffId}`}
                              onClick={() => handleCheckInClick(staff)}
                              disabled={hasCheckedIn}
                              title={hasCheckedIn ? `Checked in at ${record?.checkIn}` : 'Record Check In'}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                                hasCheckedIn
                                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-2 focus:ring-emerald-500'
                              }`}
                            >
                              <LogIn className="w-4 h-4" />
                              <span>{hasCheckedIn ? 'Checked In' : 'Check In'}</span>
                            </button>

                            {/* Check Out Button */}
                            <button
                              id={`check-out-btn-${staff.staffId}`}
                              onClick={() => handleCheckOutClick(staff)}
                              disabled={!hasCheckedIn || hasCheckedOut}
                              title={
                                !hasCheckedIn
                                  ? 'Staff must check in before checking out'
                                  : hasCheckedOut
                                  ? `Checked out at ${record?.checkOut}`
                                  : 'Record Check Out'
                              }
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                                !hasCheckedIn || hasCheckedOut
                                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs focus:ring-2 focus:ring-indigo-500'
                              }`}
                            >
                              <LogOut className="w-4 h-4" />
                              <span>{hasCheckedOut ? 'Checked Out' : 'Check Out'}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Helpful Instructions note */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Attendance Rules:</strong> Checking in automatically captures the current time. If checked in after <strong>{settings.lateTime}</strong>, status is marked <strong>Late</strong>; otherwise marked <strong>Present</strong>. Check-out can only be clicked once check-in is complete. Staff on approved leave are marked <strong>On Leave</strong>.
        </p>
      </div>
    </div>
  );
}
