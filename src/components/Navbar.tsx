import { useState, useEffect } from 'react';
import { Menu, Calendar, Clock, LogOut, Smartphone, QrCode } from 'lucide-react';
import { ActiveTab, AppSettings } from '../types';
import { formatCurrentDisplayDate } from '../utils/dateUtils';

interface NavbarProps {
  activeTab: ActiveTab;
  onOpenSidebar: () => void;
  onLogout: () => void;
  onOpenMobileModal: () => void;
  settings: AppSettings;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Real-time overview of staff attendance today',
  },
  staff: {
    title: 'Staff Management',
    subtitle: 'Manage directory of active and inactive employees',
  },
  attendance: {
    title: 'Today Attendance',
    subtitle: 'Record daily check-ins and check-outs effortlessly',
  },
  history: {
    title: 'Attendance History',
    subtitle: 'Filter and inspect past attendance logs',
  },
  leave: {
    title: 'Leave Management',
    subtitle: 'Review leave requests and approved absence schedules',
  },
  reports: {
    title: 'Attendance Reports',
    subtitle: 'Daily, monthly, and individual staff attendance metrics',
  },
  settings: {
    title: 'System Settings',
    subtitle: 'Configure company hours, late cutoff, and administrator access',
  },
};

export function Navbar({ activeTab, onOpenSidebar, onLogout, onOpenMobileModal }: NavbarProps) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const { title, subtitle } = TAB_TITLES[activeTab] || {
    title: 'Attendance',
    subtitle: 'Staff Attendance Portal',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Date, Time & Quick Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Open on Mobile / QR Code Button */}
          <button
            id="open-on-mobile-header-btn"
            onClick={onOpenMobileModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
            title="Scan QR Code to open and install on any mobile device worldwide"
          >
            <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="hidden sm:inline">Open on Mobile / QR</span>
            <span className="sm:hidden">Mobile</span>
          </button>

          {/* Today's Date Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 font-medium">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{formatCurrentDisplayDate()}</span>
          </div>

          {/* Live Clock Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs sm:text-sm font-semibold text-indigo-900 tabular-nums">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>{currentTime || '00:00:00 AM'}</span>
          </div>

          <button
            id="header-logout-btn"
            onClick={onLogout}
            title="Log out"
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors hidden sm:inline-flex"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
