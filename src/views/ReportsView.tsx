import { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  User, 
  Download, 
  CheckCircle2, 
  Clock, 
  UserX, 
  Palmtree, 
  CalendarDays,
  FileSpreadsheet
} from 'lucide-react';
import { Staff, AttendanceRecord, LeaveRequest } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { getTodayDateString, formatReadableDate, isDateInRange } from '../utils/dateUtils';
import { exportToCSV } from '../utils/exportUtils';

interface ReportsViewProps {
  staffList: Staff[];
  attendanceRecords: AttendanceRecord[];
  leaves: LeaveRequest[];
}

type ReportType = 'daily' | 'monthly' | 'individual';

export function ReportsView({
  staffList,
  attendanceRecords,
  leaves,
}: ReportsViewProps) {
  const today = getTodayDateString();
  const [reportType, setReportType] = useState<ReportType>('daily');

  // Daily Report State
  const [selectedDate, setSelectedDate] = useState(today);

  // Monthly Report State (YYYY-MM)
  const currentYearMonth = today.slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth);

  // Individual Report State
  const [selectedStaffId, setSelectedStaffId] = useState(staffList[0]?.staffId || '');

  const staffMap = useMemo(() => {
    return new Map(staffList.map((s) => [s.staffId, s]));
  }, [staffList]);

  // --- 1. DAILY REPORT DATA ---
  const dailyReportData = useMemo(() => {
    const activeStaff = staffList.filter((s) => s.status === 'Active');
    const recordsForDate = attendanceRecords.filter((r) => r.date === selectedDate);

    const rows = activeStaff.map((member) => {
      // Check leave
      const onLeave = leaves.some(
        (l) =>
          l.staffId === member.staffId &&
          l.status === 'Approved' &&
          isDateInRange(selectedDate, l.startDate, l.endDate)
      );

      const record = recordsForDate.find((r) => r.staffId === member.staffId);

      let status = 'Absent';
      let checkIn = '—';
      let checkOut = '—';

      if (onLeave) {
        status = 'On Leave';
      } else if (record && record.checkIn) {
        status = record.status;
        checkIn = record.checkIn;
        checkOut = record.checkOut || '—';
      }

      return {
        member,
        checkIn,
        checkOut,
        status,
      };
    });

    const presentDays = rows.filter((r) => r.status === 'Present').length;
    const lateDays = rows.filter((r) => r.status === 'Late').length;
    const leaveDays = rows.filter((r) => r.status === 'On Leave').length;
    const absentDays = rows.filter((r) => r.status === 'Absent').length;

    return {
      date: selectedDate,
      rows,
      totalWorkingDays: 1,
      presentDays,
      lateDays,
      leaveDays,
      absentDays,
    };
  }, [staffList, attendanceRecords, leaves, selectedDate]);

  // --- 2. MONTHLY REPORT DATA ---
  const monthlyReportData = useMemo(() => {
    // Records matching YYYY-MM
    const monthRecords = attendanceRecords.filter((r) => r.date.startsWith(selectedMonth));
    const activeStaff = staffList.filter((s) => s.status === 'Active');

    // Distinct dates recorded in this month
    const distinctDates = Array.from(new Set(monthRecords.map((r) => r.date)));
    const totalWorkingDays = distinctDates.length || 1;

    // Aggregate for each staff
    const staffAggregates = activeStaff.map((member) => {
      let presentCount = 0;
      let lateCount = 0;
      let absentCount = 0;
      let leaveCount = 0;

      // Check each distinct date recorded
      distinctDates.forEach((dateStr) => {
        const onLeave = leaves.some(
          (l) =>
            l.staffId === member.staffId &&
            l.status === 'Approved' &&
            isDateInRange(dateStr, l.startDate, l.endDate)
        );

        const rec = monthRecords.find((r) => r.staffId === member.staffId && r.date === dateStr);

        if (onLeave) {
          leaveCount += 1;
        } else if (rec && rec.checkIn) {
          if (rec.status === 'Late') lateCount += 1;
          else presentCount += 1;
        } else {
          absentCount += 1;
        }
      });

      const totalAttended = presentCount + lateCount;
      const rate = totalWorkingDays > 0 ? Math.round((totalAttended / totalWorkingDays) * 100) : 0;

      return {
        member,
        presentCount,
        lateCount,
        absentCount,
        leaveCount,
        totalWorkingDays,
        rate,
      };
    });

    const totalPresent = staffAggregates.reduce((a, b) => a + b.presentCount, 0);
    const totalLate = staffAggregates.reduce((a, b) => a + b.lateCount, 0);
    const totalAbsent = staffAggregates.reduce((a, b) => a + b.absentCount, 0);
    const totalLeave = staffAggregates.reduce((a, b) => a + b.leaveCount, 0);

    return {
      month: selectedMonth,
      totalWorkingDays,
      staffAggregates,
      totalPresent,
      totalLate,
      totalAbsent,
      totalLeave,
    };
  }, [staffList, attendanceRecords, leaves, selectedMonth]);

  // --- 3. INDIVIDUAL STAFF REPORT DATA ---
  const individualReportData = useMemo(() => {
    const currentStaff = staffMap.get(selectedStaffId);
    const staffRecords = attendanceRecords
      .filter((r) => r.staffId === selectedStaffId)
      .sort((a, b) => b.date.localeCompare(a.date));

    // Also collect leaves for this staff
    const staffLeaves = leaves.filter(
      (l) => l.staffId === selectedStaffId && l.status === 'Approved'
    );

    const presentDays = staffRecords.filter((r) => r.status === 'Present').length;
    const lateDays = staffRecords.filter((r) => r.status === 'Late').length;
    const absentDays = staffRecords.filter((r) => r.status === 'Absent').length;
    
    // Estimate leave days
    let leaveDays = 0;
    staffLeaves.forEach((l) => {
      const d1 = new Date(l.startDate);
      const d2 = new Date(l.endDate);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      leaveDays += diffDays;
    });

    const totalWorkingDays = staffRecords.length || (presentDays + lateDays + absentDays);

    return {
      staff: currentStaff,
      records: staffRecords,
      totalWorkingDays,
      presentDays,
      lateDays,
      absentDays,
      leaveDays,
    };
  }, [selectedStaffId, staffMap, attendanceRecords, leaves]);

  // Handle Export CSV
  const handleExport = () => {
    if (reportType === 'daily') {
      const headers = ['Staff ID', 'Name', 'Department', 'Date', 'Check-In', 'Check-Out', 'Status'];
      const rows = dailyReportData.rows.map((r) => [
        r.member.staffId,
        r.member.name,
        r.member.department,
        selectedDate,
        r.checkIn,
        r.checkOut,
        r.status,
      ]);
      exportToCSV(`Daily_Report_${selectedDate}`, headers, rows);
    } else if (reportType === 'monthly') {
      const headers = [
        'Staff ID',
        'Staff Name',
        'Department',
        'Total Working Days',
        'Present Days',
        'Late Days',
        'Absent Days',
        'Leave Days',
        'Attendance Rate %',
      ];
      const rows = monthlyReportData.staffAggregates.map((s) => [
        s.member.staffId,
        s.member.name,
        s.member.department,
        s.totalWorkingDays,
        s.presentCount,
        s.lateCount,
        s.absentCount,
        s.leaveCount,
        `${s.rate}%`,
      ]);
      exportToCSV(`Monthly_Report_${selectedMonth}`, headers, rows);
    } else if (reportType === 'individual') {
      const headers = ['Staff ID', 'Name', 'Date', 'Check-In', 'Check-Out', 'Status'];
      const staffName = individualReportData.staff?.name || selectedStaffId;
      const rows = individualReportData.records.map((r) => [
        r.staffId,
        staffName,
        r.date,
        r.checkIn || '—',
        r.checkOut || '—',
        r.status,
      ]);
      exportToCSV(`Staff_Report_${selectedStaffId}_${today}`, headers, rows);
    }
  };

  return (
    <div id="attendance-reports-view" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Attendance Reports</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Generate and export daily, monthly, and individual staff attendance metrics
          </p>
        </div>

        <button
          id="export-report-btn"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Report (CSV)</span>
        </button>
      </div>

      {/* Report Selector Tabs */}
      <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-xs flex flex-wrap gap-2">
        <button
          id="tab-daily-report"
          onClick={() => setReportType('daily')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            reportType === 'daily'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daily Report</span>
        </button>

        <button
          id="tab-monthly-report"
          onClick={() => setReportType('monthly')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            reportType === 'monthly'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Monthly Report</span>
        </button>

        <button
          id="tab-individual-report"
          onClick={() => setReportType('individual')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            reportType === 'individual'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Individual Staff Report</span>
        </button>
      </div>

      {/* Config / Filter Selector Box */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
        {reportType === 'daily' && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Select Date:
            </label>
            <input
              id="report-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {reportType === 'monthly' && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Select Month:
            </label>
            <input
              id="report-month-picker"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {reportType === 'individual' && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Select Staff:
            </label>
            <select
              id="report-staff-picker"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.staffId}>
                  {s.name} ({s.staffId} - {s.department})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Summary KPI Cards (Section 10: Total working days, Present days, Absent days, Late days, Leave days) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Working Days */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Working Days</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {reportType === 'daily'
              ? dailyReportData.totalWorkingDays
              : reportType === 'monthly'
              ? monthlyReportData.totalWorkingDays
              : individualReportData.totalWorkingDays}
          </div>
        </div>

        {/* Present Days */}
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Present Days</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {reportType === 'daily'
              ? dailyReportData.presentDays
              : reportType === 'monthly'
              ? monthlyReportData.totalPresent
              : individualReportData.presentDays}
          </div>
        </div>

        {/* Late Days */}
        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-medium">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Late Days</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700">
            {reportType === 'daily'
              ? dailyReportData.lateDays
              : reportType === 'monthly'
              ? monthlyReportData.totalLate
              : individualReportData.lateDays}
          </div>
        </div>

        {/* Absent Days */}
        <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-xs">
          <div className="flex items-center gap-2 text-rose-700 text-xs font-medium">
            <UserX className="w-4 h-4 text-rose-500" />
            <span>Absent Days</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700">
            {reportType === 'daily'
              ? dailyReportData.absentDays
              : reportType === 'monthly'
              ? monthlyReportData.totalAbsent
              : individualReportData.absentDays}
          </div>
        </div>

        {/* Leave Days */}
        <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-sky-700 text-xs font-medium">
            <Palmtree className="w-4 h-4 text-sky-500" />
            <span>Leave Days</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-700">
            {reportType === 'daily'
              ? dailyReportData.leaveDays
              : reportType === 'monthly'
              ? monthlyReportData.totalLeave
              : individualReportData.leaveDays}
          </div>
        </div>
      </div>

      {/* Main Report Table Display */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {reportType === 'daily' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Staff Member</th>
                  <th className="py-3 px-4">Department / Position</th>
                  <th className="py-3 px-4">Check-in</th>
                  <th className="py-3 px-4">Check-out</th>
                  <th className="py-3 px-4 sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {dailyReportData.rows.map(({ member, checkIn, checkOut, status }) => (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900">{member.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{member.staffId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800">{member.department}</div>
                      <div className="text-xs text-slate-500">{member.position}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs sm:text-sm">{checkIn}</td>
                    <td className="py-3.5 px-4 font-mono text-xs sm:text-sm">{checkOut}</td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <StatusBadge status={status as any} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'monthly' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Staff Member</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Present</th>
                  <th className="py-3 px-4">Late</th>
                  <th className="py-3 px-4">Absent</th>
                  <th className="py-3 px-4">On Leave</th>
                  <th className="py-3 px-4 sm:px-6">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {monthlyReportData.staffAggregates.map((item) => (
                  <tr key={item.member.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900">{item.member.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{item.member.staffId}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {item.member.department}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">
                      {item.presentCount}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-amber-700">
                      {item.lateCount}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-rose-700">
                      {item.absentCount}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-sky-700">
                      {item.leaveCount}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.rate >= 80
                                ? 'bg-emerald-500'
                                : item.rate >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${item.rate}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs text-slate-900">{item.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'individual' && (
          <div className="overflow-x-auto">
            {individualReportData.records.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">
                No attendance logs found for this staff member.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4 sm:px-6">Date</th>
                    <th className="py-3 px-4">Check-in</th>
                    <th className="py-3 px-4">Check-out</th>
                    <th className="py-3 px-4 sm:px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {individualReportData.records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-900">
                        {formatReadableDate(rec.date)}
                        <span className="block text-xs font-mono text-slate-400">{rec.date}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs sm:text-sm">
                        {rec.checkIn || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs sm:text-sm">
                        {rec.checkOut || '—'}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <StatusBadge status={rec.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
