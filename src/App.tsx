import { useState, useEffect, useCallback } from 'react';
import { ActiveTab, Staff, AttendanceRecord, LeaveRequest, AppSettings } from './types';
import { 
  loadStaff, 
  saveStaff, 
  loadAttendance, 
  saveAttendance, 
  loadLeaves, 
  saveLeaves, 
  loadSettings, 
  saveSettings,
  loadAuthStatus,
  saveAuthStatus
} from './utils/storage';
import { getTodayDateString } from './utils/dateUtils';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { InstallPrompt } from './components/InstallPrompt';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';
import { MobileAccessModal } from './components/MobileAccessModal';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { StaffView } from './views/StaffView';
import { AttendanceView } from './views/AttendanceView';
import { HistoryView } from './views/HistoryView';
import { LeaveView } from './views/LeaveView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => loadAuthStatus());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  // Core Persistent State
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [staffList, setStaffList] = useState<Staff[]>(() => loadStaff());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => loadAttendance());
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => loadLeaves());

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    saveStaff(staffList);
  }, [staffList]);

  useEffect(() => {
    saveAttendance(attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    saveLeaves(leaves);
  }, [leaves]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Auth Handlers
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    saveAuthStatus(true);
    showToast('Signed in as Administrator.', 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    saveAuthStatus(false);
    showToast('Logged out successfully.', 'info');
  };

  // Staff Handlers
  const handleAddStaff = (newStaffData: Omit<Staff, 'id'>) => {
    const newStaff: Staff = {
      ...newStaffData,
      id: `s-${Date.now()}`,
    };
    setStaffList((prev) => [newStaff, ...prev]);
    showToast(`Staff member "${newStaff.name}" added successfully.`, 'success');
  };

  const handleUpdateStaff = (updatedStaff: Staff) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s))
    );
    showToast(`Staff details for "${updatedStaff.name}" updated successfully.`, 'success');
  };

  const handleDeleteStaff = (id: string) => {
    const target = staffList.find((s) => s.id === id);
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    showToast(
      target ? `Staff member "${target.name}" removed successfully.` : 'Staff member removed successfully.',
      'info'
    );
  };

  // Attendance Handlers
  const handleRecordCheckIn = (staffId: string, timeString: string, isLate: boolean) => {
    const today = getTodayDateString();
    setAttendanceRecords((prev) => {
      const existingIdx = prev.findIndex((r) => r.staffId === staffId && r.date === today);
      const status = isLate ? 'Late' : 'Present';

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          checkIn: timeString,
          status,
        };
        return updated;
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}`,
          staffId,
          date: today,
          checkIn: timeString,
          checkOut: null,
          status,
        };
        return [newRecord, ...prev];
      }
    });
  };

  const handleRecordCheckOut = (staffId: string, timeString: string) => {
    const today = getTodayDateString();
    setAttendanceRecords((prev) => {
      const existingIdx = prev.findIndex((r) => r.staffId === staffId && r.date === today);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          checkOut: timeString,
        };
        return updated;
      }
      return prev;
    });
  };

  // Leave Handlers
  const handleAddLeave = (newLeaveData: Omit<LeaveRequest, 'id'>) => {
    const newLeave: LeaveRequest = {
      ...newLeaveData,
      id: `leave-${Date.now()}`,
    };
    setLeaves((prev) => [newLeave, ...prev]);
  };

  const handleUpdateLeaveStatus = (leaveId: string, newStatus: LeaveRequest['status']) => {
    setLeaves((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status: newStatus } : l))
    );
  };

  const handleDeleteLeave = (leaveId: string) => {
    setLeaves((prev) => prev.filter((l) => l.id !== leaveId));
  };

  // Settings Handlers
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  // If user is not logged in, display the Login View
  if (!isLoggedIn) {
    return (
      <>
        <NetworkStatusBanner />
        <LoginView onLoginSuccess={handleLoginSuccess} settings={settings} />
        <InstallPrompt />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div id="staff-attendance-app" className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Network offline/online alert banner */}
      <NetworkStatusBanner />

      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        onOpenMobileModal={() => setIsMobileModalOpen(true)}
        settings={settings}
      />

      {/* Main layout container with desktop sidebar offset */}
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <Navbar
          activeTab={activeTab}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onLogout={handleLogout}
          onOpenMobileModal={() => setIsMobileModalOpen(true)}
          settings={settings}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              staff={staffList}
              attendance={attendanceRecords}
              leaves={leaves}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'staff' && (
            <StaffView
              staffList={staffList}
              onAddStaff={handleAddStaff}
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              staffList={staffList}
              attendanceRecords={attendanceRecords}
              leaves={leaves}
              settings={settings}
              onRecordCheckIn={handleRecordCheckIn}
              onRecordCheckOut={handleRecordCheckOut}
              showToast={showToast}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              staffList={staffList}
              attendanceRecords={attendanceRecords}
            />
          )}

          {activeTab === 'leave' && (
            <LeaveView
              staffList={staffList}
              leaves={leaves}
              onAddLeave={handleAddLeave}
              onUpdateLeaveStatus={handleUpdateLeaveStatus}
              onDeleteLeave={handleDeleteLeave}
              showToast={showToast}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              staffList={staffList}
              attendanceRecords={attendanceRecords}
              leaves={leaves}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Mobile Access & QR Code Modal */}
      <MobileAccessModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />

      {/* PWA in-app installation banner */}
      <InstallPrompt />

      {/* Global Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
