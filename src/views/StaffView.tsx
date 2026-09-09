import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  Eye, 
  Pencil, 
  Trash2, 
  X, 
  Users, 
  Phone, 
  Briefcase, 
  Calendar, 
  CheckCircle 
} from 'lucide-react';
import { Staff, StaffStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { formatReadableDate } from '../utils/dateUtils';

interface StaffViewProps {
  staffList: Staff[];
  onAddStaff: (newStaff: Omit<Staff, 'id'>) => void;
  onUpdateStaff: (staff: Staff) => void;
  onDeleteStaff: (id: string) => void;
}

export function StaffView({
  staffList,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
}: StaffViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    staffId: '',
    name: '',
    department: '',
    position: '',
    phone: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active' as StaffStatus,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filtered staff list
  const filteredStaff = staffList.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.staffId.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.position.toLowerCase().includes(q)
    );
  });

  const resetForm = () => {
    setFormData({
      staffId: '',
      name: '',
      department: '',
      position: '',
      phone: '',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    // Auto suggest next Staff ID
    const maxNumber = staffList.reduce((acc, curr) => {
      const match = curr.staffId.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        return num > acc ? num : acc;
      }
      return acc;
    }, 0);
    const nextId = `STF-${String(maxNumber + 1).padStart(3, '0')}`;
    setFormData((prev) => ({ ...prev, staffId: nextId }));
    setIsAddModalOpen(true);
  };

  const openEditModal = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      staffId: staff.staffId,
      name: staff.name,
      department: staff.department,
      position: staff.position,
      phone: staff.phone,
      joiningDate: staff.joiningDate,
      status: staff.status,
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.staffId.trim()) errors.staffId = 'Staff ID is required';
    if (!formData.name.trim()) errors.name = 'Full Name is required';
    if (!formData.department.trim()) errors.department = 'Department is required';
    if (!formData.position.trim()) errors.position = 'Position is required';
    if (!formData.phone.trim()) errors.phone = 'Phone Number is required';
    if (!formData.joiningDate) errors.joiningDate = 'Joining Date is required';

    // Check duplicate staffId
    const duplicate = staffList.find(
      (s) =>
        s.staffId.toLowerCase() === formData.staffId.trim().toLowerCase() &&
        (!editingStaff || s.id !== editingStaff.id)
    );
    if (duplicate) {
      errors.staffId = 'This Staff ID is already assigned to another staff member.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingStaff) {
      onUpdateStaff({
        ...editingStaff,
        staffId: formData.staffId.trim(),
        name: formData.name.trim(),
        department: formData.department.trim(),
        position: formData.position.trim(),
        phone: formData.phone.trim(),
        joiningDate: formData.joiningDate,
        status: formData.status,
      });
      setEditingStaff(null);
    } else {
      onAddStaff({
        staffId: formData.staffId.trim(),
        name: formData.name.trim(),
        department: formData.department.trim(),
        position: formData.position.trim(),
        phone: formData.phone.trim(),
        joiningDate: formData.joiningDate,
        status: formData.status,
      });
      setIsAddModalOpen(false);
    }
    resetForm();
  };

  return (
    <div id="staff-management-view" className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Staff Directory</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            View, add, edit, and organize employee records ({staffList.length} total)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="add-staff-top-btn"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Staff</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="staff-search-input"
            type="text"
            placeholder="Search by name, ID, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">No staff members found</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs mx-auto">
              {searchQuery
                ? `No staff matching "${searchQuery}". Try another search term.`
                : 'Get started by clicking "+ Add Staff" above.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Clear search filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="staff-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Staff ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Department / Position</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-indigo-700 text-xs sm:text-sm">
                      {staff.staffId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{staff.name}</div>
                      <div className="text-xs text-slate-400">Joined {formatReadableDate(staff.joiningDate)}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 font-medium">{staff.department}</div>
                      <div className="text-xs text-slate-500">{staff.position}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs sm:text-sm text-slate-600">
                      {staff.phone}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={staff.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`view-staff-btn-${staff.id}`}
                          onClick={() => setViewingStaff(staff)}
                          title="View Details"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`edit-staff-btn-${staff.id}`}
                          onClick={() => openEditModal(staff)}
                          title="Edit Staff"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-staff-btn-${staff.id}`}
                          onClick={() => setStaffToDelete(staff)}
                          title="Delete Staff"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Staff Modal */}
      {(isAddModalOpen || editingStaff) && (
        <div
          id="staff-form-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => {
            setIsAddModalOpen(false);
            setEditingStaff(null);
          }}
        >
          <div
            id="staff-form-modal-content"
            className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingStaff ? 'Edit Staff Member' : 'Add New Staff'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingStaff
                    ? 'Update employee details and status'
                    : 'Enter the details of the new staff member'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStaff(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Staff ID */}
                <div>
                  <label
                    htmlFor="staff-input-staffid"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Staff ID *
                  </label>
                  <input
                    id="staff-input-staffid"
                    type="text"
                    value={formData.staffId}
                    onChange={(e) =>
                      setFormData({ ...formData, staffId: e.target.value })
                    }
                    placeholder="e.g. STF-007"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  {formErrors.staffId && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.staffId}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="staff-input-status"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Status *
                  </label>
                  <select
                    id="staff-input-status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as StaffStatus })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="staff-input-name"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Full Name *
                </label>
                <input
                  id="staff-input-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                {formErrors.name && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department */}
                <div>
                  <label
                    htmlFor="staff-input-department"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Department *
                  </label>
                  <input
                    id="staff-input-department"
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    placeholder="e.g. Operations"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  {formErrors.department && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.department}</p>
                  )}
                </div>

                {/* Position */}
                <div>
                  <label
                    htmlFor="staff-input-position"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Position *
                  </label>
                  <input
                    id="staff-input-position"
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    placeholder="e.g. Manager"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  {formErrors.position && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.position}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label
                    htmlFor="staff-input-phone"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="staff-input-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                {/* Joining Date */}
                <div>
                  <label
                    htmlFor="staff-input-joining"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Joining Date *
                  </label>
                  <input
                    id="staff-input-joining"
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) =>
                      setFormData({ ...formData, joiningDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  {formErrors.joiningDate && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.joiningDate}</p>
                  )}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStaff(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="save-staff-btn"
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingStaff ? 'Save Changes' : 'Add Staff'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Staff Details Modal */}
      {viewingStaff && (
        <div
          id="view-staff-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          onClick={() => setViewingStaff(null)}
        >
          <div
            id="view-staff-modal-content"
            className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Staff Details</h3>
              <button
                onClick={() => setViewingStaff(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-slate-900">{viewingStaff.name}</h4>
                  <p className="font-mono text-xs text-indigo-600 font-semibold">{viewingStaff.staffId}</p>
                </div>
                <StatusBadge status={viewingStaff.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Department</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-800">{viewingStaff.department}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Position</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-800">{viewingStaff.position}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Phone</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-800">{viewingStaff.phone}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Joined</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {formatReadableDate(viewingStaff.joiningDate)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  const staffToEdit = viewingStaff;
                  setViewingStaff(null);
                  openEditModal(staffToEdit);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Edit Details
              </button>
              <button
                onClick={() => setViewingStaff(null)}
                className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(staffToDelete)}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${staffToDelete?.name} (${staffToDelete?.staffId})? This will permanently remove their profile from the staff directory.`}
        confirmLabel="Delete Staff"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={() => {
          if (staffToDelete) {
            onDeleteStaff(staffToDelete.id);
            setStaffToDelete(null);
          }
        }}
        onCancel={() => setStaffToDelete(null)}
      />
    </div>
  );
}
