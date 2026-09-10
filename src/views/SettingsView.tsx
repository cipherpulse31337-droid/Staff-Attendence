import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  ShieldCheck, 
  Save, 
  Eye, 
  EyeOff, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../utils/storage';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function SettingsView({
  settings,
  onSaveSettings,
  showToast,
}: SettingsViewProps) {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.companyName.trim()) {
      errs.companyName = 'Company name is required';
    }
    if (!formData.workStartTime) {
      errs.workStartTime = 'Work start time is required';
    }
    if (!formData.workEndTime) {
      errs.workEndTime = 'Work end time is required';
    }
    if (formData.workStartTime && formData.workEndTime && formData.workStartTime >= formData.workEndTime) {
      errs.workEndTime = 'Work end time must be after work start time';
    }
    if (!formData.lateTime) {
      errs.lateTime = 'Late cutoff time is required';
    }
    if (!formData.adminUsername.trim()) {
      errs.adminUsername = 'Admin username cannot be empty';
    }
    if (!formData.adminPassword.trim()) {
      errs.adminPassword = 'Admin password cannot be empty';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSaveSettings(formData);
    showToast('Settings saved successfully.', 'success');
  };

  const handleResetDefaults = () => {
    setFormData({ ...DEFAULT_SETTINGS });
    setErrors({});
    showToast('Settings reset to system defaults. Click "Save Settings" to apply.', 'info');
  };

  return (
    <div id="settings-view" className="space-y-6 max-w-4xl">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Settings</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure company identity, working shift hours, late threshold, and admin access
          </p>
        </div>

        <button
          id="reset-settings-btn"
          type="button"
          onClick={handleResetDefaults}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Company Section */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Company Information</h3>
              <p className="text-xs text-slate-500">Organization name displayed across the system</p>
            </div>
          </div>

          <div>
            <label
              htmlFor="settings-company-name"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Company Name *
            </label>
            <input
              id="settings-company-name"
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full max-w-md px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Acme Corporation"
            />
            {errors.companyName && (
              <p className="text-xs text-rose-600 mt-1">{errors.companyName}</p>
            )}
          </div>
        </div>

        {/* 2. Working Hours & Late Threshold Section */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Working Hours & Late Rules</h3>
              <p className="text-xs text-slate-500">
                Daily office hours and rule threshold for marking staff Late
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Work Start Time */}
            <div>
              <label
                htmlFor="settings-work-start-time"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Work Start Time *
              </label>
              <input
                id="settings-work-start-time"
                type="time"
                value={formData.workStartTime}
                onChange={(e) => setFormData({ ...formData, workStartTime: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {errors.workStartTime && (
                <p className="text-xs text-rose-600 mt-1">{errors.workStartTime}</p>
              )}
            </div>

            {/* Work End Time */}
            <div>
              <label
                htmlFor="settings-work-end-time"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Work End Time *
              </label>
              <input
                id="settings-work-end-time"
                type="time"
                value={formData.workEndTime}
                onChange={(e) => setFormData({ ...formData, workEndTime: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {errors.workEndTime && (
                <p className="text-xs text-rose-600 mt-1">{errors.workEndTime}</p>
              )}
            </div>

            {/* Late Time Cutoff */}
            <div>
              <label
                htmlFor="settings-late-time"
                className="block text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1.5"
              >
                Mark Late After *
              </label>
              <input
                id="settings-late-time"
                type="time"
                value={formData.lateTime}
                onChange={(e) => setFormData({ ...formData, lateTime: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50/40 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              {errors.lateTime && (
                <p className="text-xs text-rose-600 mt-1">{errors.lateTime}</p>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p>
                Staff checking in after <strong>{formData.lateTime}</strong> will automatically receive the <strong>Late</strong> status in today's attendance records and reports.
              </p>
            </div>
            <div className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md shrink-0">
              Schedule: Mon–Sat (Sunday Off)
            </div>
          </div>
        </div>

        {/* 3. Admin Account Section */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Admin Account</h3>
              <p className="text-xs text-slate-500">Update username and login password for admin portal access</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {/* Admin Username */}
            <div>
              <label
                htmlFor="settings-admin-username"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Admin Username *
              </label>
              <input
                id="settings-admin-username"
                type="text"
                value={formData.adminUsername}
                onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {errors.adminUsername && (
                <p className="text-xs text-rose-600 mt-1">{errors.adminUsername}</p>
              )}
            </div>

            {/* Admin Password */}
            <div>
              <label
                htmlFor="settings-admin-password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Admin Password *
              </label>
              <div className="relative">
                <input
                  id="settings-admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  className="w-full px-3.5 py-2 pr-10 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.adminPassword && (
                <p className="text-xs text-rose-600 mt-1">{errors.adminPassword}</p>
              )}
            </div>
          </div>
        </div>

        {/* Clear Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            id="save-settings-submit-btn"
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
