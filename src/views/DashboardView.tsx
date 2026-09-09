import { Users, UserCheck, UserX, Clock, ArrowUpRight, Palmtree } from 'lucide-react';
import { Staff, AttendanceRecord, LeaveRequest, ActiveTab } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { getTodayDateString, formatCurrentDisplayDate, isDateInRange } from '../utils/dateUtils';

interface DashboardViewProps {
  staff: Staff[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  setActiveTab: (tab: ActiveTab) => void;
}

export function DashboardView({
  staff,
  attendance,
  leaves,
  setActiveTab,
}: DashboardViewProps) {
  const today = getTodayDateString();

  // Active staff only count toward daily attendance expectation
  const activeStaff = staff.filter((s) => s.status === 'Active');

  // Compute status for all active staff for today
  const todayStaffStatusList = activeStaff.map((member) => {
    // Check approved leaves for today
    const activeLeave = leaves.find(
      (l) =>
        l.staffId === member.staffId &&
        l.status === 'Approved' &&
        isDateInRange(today, l.startDate, l.endDate)
    );

    // Check attendance record for today
    const record = attendance.find(
      (a) => a.staffId === member.staffId && a.date === today
    );

    if (activeLeave) {
      return {
        member,
        record,
        status: 'On Leave' as const,
        checkIn: record?.checkIn || '—',
        checkOut: record?.checkOut || '—',
      };
    }

    if (record && record.checkIn) {
      return {
        member,
        record,
        status: record.status, // 'Present' or 'Late'
        checkIn: record.checkIn,
        checkOut: record.checkOut || '—',
      };
    }

    return {
      member,
      record: null,
      status: 'Absent' as const,
      checkIn: '—',
      checkOut: '—',
    };
  });

  const totalStaffCount = staff.length;
  const presentCount = todayStaffStatusList.filter((s) => s.status === 'Present').length;
  const lateCount = todayStaffStatusList.filter((s) => s.status === 'Late').length;
  const onLeaveCount = todayStaffStatusList.filter((s) => s.status === 'On Leave').length;
  const absentCount = todayStaffStatusList.filter((s) => s.status === 'Absent').length;

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Welcome & Today's Date Banner */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Overview
            </p>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {formatCurrentDisplayDate()}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daily attendance status and live statistics for all company staff.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="dashboard-goto-attendance-btn"
            onClick={() => setActiveTab('attendance')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-xs"
          >
            <Clock className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
          <button
            id="dashboard-goto-staff-btn"
            onClick={() => setActiveTab('staff')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Manage Staff</span>
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards (As explicitly requested in Section 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Staff */}
        <div
          id="stat-card-total-staff"
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs transition-all hover:border-slate-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Total Staff</span>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900">{totalStaffCount}</span>
            <span className="ml-2 text-xs text-slate-500">
              ({activeStaff.length} active)
            </span>
          </div>
          <button
            onClick={() => setActiveTab('staff')}
            className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            <span>View directory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Present Today */}
        <div
          id="stat-card-present-today"
          className="bg-white rounded-xl p-5 border border-emerald-100 shadow-xs transition-all hover:border-emerald-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Present Today</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-emerald-700">{presentCount}</span>
            <span className="ml-2 text-xs text-emerald-600 font-medium">on time</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Recorded check-ins within regular hours
          </div>
        </div>

        {/* Late Today */}
        <div
          id="stat-card-late-today"
          className="bg-white rounded-xl p-5 border border-amber-100 shadow-xs transition-all hover:border-amber-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Late Today</span>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-amber-700">{lateCount}</span>
            <span className="ml-2 text-xs text-amber-600 font-medium">after late cutoff</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Checked in past cutoff threshold
          </div>
        </div>

        {/* Absent Today */}
        <div
          id="stat-card-absent-today"
          className="bg-white rounded-xl p-5 border border-rose-100 shadow-xs transition-all hover:border-rose-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Absent Today</span>
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-rose-700">{absentCount}</span>
            {onLeaveCount > 0 && (
              <span className="ml-2 text-xs text-sky-600 font-medium">
                ({onLeaveCount} on leave)
              </span>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-500">
            No check-in recorded for today
          </div>
        </div>
      </div>

      {/* Today's Attendance Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Today's Attendance</h3>
            <p className="text-xs text-slate-500">
              Live status tracking for active team members on {today}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('attendance')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Attendance Sheet</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayStaffStatusList.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">No active staff members found.</p>
            <p className="text-xs text-slate-400 mt-1">Add staff to begin recording attendance.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="dashboard-attendance-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Staff Name</th>
                  <th className="py-3 px-4">Department / Position</th>
                  <th className="py-3 px-4">Check-in</th>
                  <th className="py-3 px-4">Check-out</th>
                  <th className="py-3 px-4 sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {todayStaffStatusList.map(({ member, checkIn, checkOut, status }) => (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900">{member.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{member.staffId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800">{member.department}</div>
                      <div className="text-xs text-slate-500">{member.position}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs sm:text-sm text-slate-600">
                      {checkIn}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs sm:text-sm text-slate-600">
                      {checkOut}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <StatusBadge status={status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
