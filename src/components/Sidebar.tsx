import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CalendarDays, 
  Palmtree, 
  BarChart3, 
  Settings, 
  LogOut,
  Building2,
  X,
  Smartphone
} from 'lucide-react';
import { ActiveTab, AppSettings } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onOpenMobileModal: () => void;
  settings: AppSettings;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onLogout,
  onOpenMobileModal,
  settings,
}: SidebarProps) {
  const navItems: { id: ActiveTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'history', label: 'History', icon: CalendarDays },
    { id: 'leave', label: 'Leave', icon: Palmtree },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-sm font-semibold text-white truncate">
                {settings.companyName || 'Staff Attendance'}
              </h1>
              <p className="text-xs text-slate-400">Attendance Portal</p>
            </div>
          </div>
          <button
            id="sidebar-close-btn"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer / Logout & Mobile Connect */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            id="sidebar-mobile-connect-btn"
            onClick={() => {
              onClose();
              onOpenMobileModal();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/50 hover:bg-indigo-900/70 border border-indigo-800/50 transition-colors"
          >
            <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Open on Mobile / QR</span>
          </button>

          <div className="px-3 py-2 bg-slate-800/60 rounded-lg">
            <div className="text-xs text-slate-400">Logged in as</div>
            <div className="text-sm font-medium text-slate-200 truncate">
              {settings.adminUsername || 'Administrator'}
            </div>
          </div>
          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
