import { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  Download, 
  RotateCcw, 
  History, 
  CalendarDays,
  FileSpreadsheet
} from 'lucide-react';
import { Staff, AttendanceRecord } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { formatReadableDate } from '../utils/dateUtils';
import { exportToCSV } from '../utils/exportUtils';

interface HistoryViewProps {
  staffList: Staff[];
  attendanceRecords: AttendanceRecord[];
}

export function HistoryView({ staffList, attendanceRecords }: HistoryViewProps) {
  const [searchName, setSearchName] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'specific' | 'range'>('all');
  const [specificDate, setSpecificDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Staff map for fast lookup
  const staffMap = useMemo(() => {
    const map = new Map<string, Staff>();
    staffList.forEach((s) => map.set(s.staffId, s));
    return map;
  }, [staffList]);

  // Filter attendance records
  const filteredRecords = useMemo(() => {
    return attendanceRecords
      .filter((record) => {
        const staffMember = staffMap.get(record.staffId);
        const staffName = staffMember ? staffMember.name.toLowerCase() : '';
        const staffIdStr = record.staffId.toLowerCase();

        // 1. Search name or ID
        if (searchName.trim()) {
          const q = searchName.toLowerCase().trim();
          if (!staffName.includes(q) && !staffIdStr.includes(q)) {
            return false;
          }
        }

        // 2. Status filter
        if (statusFilter !== 'all' && record.status !== statusFilter) {
          return false;
        }

        // 3. Date filtering
        if (filterMode === 'specific' && specificDate) {
          if (record.date !== specificDate) return false;
        } else if (filterMode === 'range') {
          if (startDate && record.date < startDate) return false;
          if (endDate && record.date > endDate) return false;
        }

        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date)); // newest first
  }, [attendanceRecords, staffMap, searchName, statusFilter, filterMode, specificDate, startDate, endDate]);

  const handleResetFilters = () => {
    setSearchName('');
    setFilterMode('all');
    setSpecificDate('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
  };

  const handleExportCSV = () => {
    const headers = ['Staff ID', 'Staff Name', 'Department', 'Date', 'Check-In', 'Check-Out', 'Status'];
    const rows = filteredRecords.map((r) => {
      const staff = staffMap.get(r.staffId);
      return [
        r.staffId,
        staff ? staff.name : 'Unknown Staff',
        staff ? staff.department : '—',
        r.date,
        r.checkIn || '—',
        r.checkOut || '—',
        r.status,
      ];
    });

    exportToCSV('attendance_history', headers, rows);
  };

  return (
    <div id="attendance-history-view" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Attendance History</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Search, filter, and review historical attendance records ({filteredRecords.length} records found)
          </p>
        </div>

        <button
          id="export-history-csv-btn"
          onClick={handleExportCSV}
          disabled={filteredRecords.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search by Name / Staff ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Staff Name or ID
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="history-search-name"
                type="text"
                placeholder="Type staff name or ID..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Date Filter Mode Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Date Filter
            </label>
            <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                  filterMode === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Dates
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('specific')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                  filterMode === 'specific'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Specific Date
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('range')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                  filterMode === 'range'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Date Range
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Status Filter
            </label>
            <select
              id="history-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Date Inputs depending on Mode */}
        {filterMode === 'specific' && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">Select Date:</label>
            <input
              id="history-specific-date-input"
              type="date"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {filterMode === 'range' && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">From:</label>
              <input
                id="history-start-date-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">To:</label>
              <input
                id="history-end-date-input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Reset Filter Button */}
        {(searchName || filterMode !== 'all' || statusFilter !== 'all') && (
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <History className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">No attendance records found</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Try adjusting your date range, search query, or status filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="history-records-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Staff Member</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-in</th>
                  <th className="py-3 px-4">Check-out</th>
                  <th className="py-3 px-4 sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredRecords.map((record) => {
                  const staff = staffMap.get(record.staffId);
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-semibold text-slate-900">
                          {staff ? staff.name : 'Unknown Staff'}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {record.staffId} • {staff?.department || '—'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {formatReadableDate(record.date)}
                        <span className="block text-xs font-mono text-slate-400">{record.date}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs sm:text-sm">
                        {record.checkIn ? (
                          <span className="font-semibold text-slate-900">{record.checkIn}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs sm:text-sm">
                        {record.checkOut ? (
                          <span className="font-semibold text-slate-900">{record.checkOut}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <StatusBadge status={record.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
