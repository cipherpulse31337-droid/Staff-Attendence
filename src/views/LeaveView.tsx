import React, { useState } from 'react';
import { 
  Palmtree, 
  Plus, 
  Check, 
  X, 
  Trash2, 
  Calendar, 
  AlertCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import { Staff, LeaveRequest, LeaveStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { formatReadableDate, getTodayDateString } from '../utils/dateUtils';

interface LeaveViewProps {
  staffList: Staff[];
  leaves: LeaveRequest[];
  onAddLeave: (leave: Omit<LeaveRequest, 'id'>) => void;
  onUpdateLeaveStatus: (leaveId: string, newStatus: LeaveStatus) => void;
  onDeleteLeave: (leaveId: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function LeaveView({
  staffList,
  leaves,
  onAddLeave,
  onUpdateLeaveStatus,
  onDeleteLeave,
  showToast,
}: LeaveViewProps) {
  const today = getTodayDateString();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<LeaveRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form State
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');

  const staffMap = new Map(staffList.map((s) => [s.staffId, s]));

  const filteredLeaves = leaves.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    return true;
  });

  const handleOpenModal = () => {
    setSelectedStaffId(staffList[0]?.staffId || '');
    setStartDate(today);
    setEndDate(today);
    setReason('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedStaffId) {
      setFormError('Please select a staff member.');
      return;
    }
    if (!startDate || !endDate) {
      setFormError('Please provide both start date and end date.');
      return;
    }
    if (startDate > endDate) {
      setFormError('Leave end date cannot be earlier than start date.');
      return;
    }
    if (!reason.trim()) {
      setFormError('Please provide a reason for leave.');
      return;
    }

    onAddLeave({
      staffId: selectedStaffId,
      startDate,
      endDate,
      reason: reason.trim(),
      status: 'Pending',
    });

    setIsModalOpen(false);
    showToast('Leave request submitted successfully.', 'success');
  };

  const handleApprove = (leave: LeaveRequest) => {
    onUpdateLeaveStatus(leave.id, 'Approved');
    const staff = staffMap.get(leave.staffId);
    showToast(`Leave for ${staff ? staff.name : leave.staffId} approved successfully.`, 'success');
  };

  const handleReject = (leave: LeaveRequest) => {
    onUpdateLeaveStatus(leave.id, 'Rejected');
    const staff = staffMap.get(leave.staffId);
    showToast(`Leave for ${staff ? staff.name : leave.staffId} marked as Rejected.`, 'info');
  };

  return (
    <div id="leave-management-view" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Leave Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Submit, review, and track staff leave requests ({leaves.length} total)
          </p>
        </div>

        <button
          id="add-leave-btn"
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Leave</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs w-fit">
        {['all', 'Pending', 'Approved', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
              statusFilter === status
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {status === 'all' ? 'All Leaves' : status}
          </button>
        ))}
      </div>

      {/* Leave Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLeaves.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Palmtree className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">No leave requests found</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {statusFilter !== 'all'
                ? `No ${statusFilter.toLowerCase()} leave requests.`
                : 'Click "+ Add Leave" to schedule a leave.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="leave-history-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Staff Member</th>
                  <th className="py-3 px-4">Leave Duration</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredLeaves.map((leave) => {
                  const staff = staffMap.get(leave.staffId);
                  return (
                    <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-semibold text-slate-900">
                          {staff ? staff.name : 'Unknown Staff'}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {leave.staffId} • {staff?.department || '—'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {formatReadableDate(leave.startDate)} → {formatReadableDate(leave.endDate)}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {leave.startDate === leave.endDate
                            ? '1 day'
                            : `${leave.startDate} to ${leave.endDate}`}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs text-slate-600 truncate">
                        {leave.reason}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={leave.status} />
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {leave.status === 'Pending' && (
                            <>
                              <button
                                id={`approve-leave-btn-${leave.id}`}
                                onClick={() => handleApprove(leave)}
                                title="Approve Leave"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                id={`reject-leave-btn-${leave.id}`}
                                onClick={() => handleReject(leave)}
                                title="Reject Leave"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          <button
                            id={`delete-leave-btn-${leave.id}`}
                            onClick={() => setLeaveToDelete(leave)}
                            title="Delete Leave"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Leave Modal */}
      {isModalOpen && (
        <div
          id="add-leave-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            id="add-leave-modal-content"
            className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Leave</h3>
                <p className="text-xs text-slate-500">Record a new leave request for staff</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Select Staff */}
              <div>
                <label
                  htmlFor="leave-select-staff"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Staff Member *
                </label>
                <select
                  id="leave-select-staff"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.staffId}>
                      {s.name} ({s.staffId} - {s.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="leave-start-date"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Start Date *
                  </label>
                  <input
                    id="leave-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="leave-end-date"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    End Date *
                  </label>
                  <input
                    id="leave-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label
                  htmlFor="leave-reason"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Leave Reason *
                </label>
                <textarea
                  id="leave-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Medical recovery, family emergency, vacation..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-leave-btn"
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  Submit Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(leaveToDelete)}
        title="Delete Leave Request"
        message="Are you sure you want to delete this leave record? This action cannot be undone."
        confirmLabel="Delete Leave"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={() => {
          if (leaveToDelete) {
            onDeleteLeave(leaveToDelete.id);
            setLeaveToDelete(null);
            showToast('Leave request removed successfully.', 'info');
          }
        }}
        onCancel={() => setLeaveToDelete(null)}
      />
    </div>
  );
}
