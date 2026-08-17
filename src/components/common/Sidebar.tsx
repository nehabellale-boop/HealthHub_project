import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Receipt,
  FileText,
  Building2,
  Stethoscope,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Role, UserAccount } from '../../types';

interface SidebarProps {
  currentRole: Role;
  currentUser: UserAccount;
  activeNav: string;
  onSelectNav: (navKey: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeNav,
  onSelectNav,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  isOpenMobile,
  onCloseMobile,
}) => {
  // Define navigation items tailored per role
  const getNavItems = (): NavItem[] => {
    switch (currentRole) {
      case 'ADMIN':
        return [
          { key: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { key: 'appointments', label: 'Appointments', icon: Calendar },
          { key: 'doctors', label: 'Specialists', icon: Stethoscope },
          { key: 'patients', label: 'Patients', icon: Users },
          { key: 'billing', label: 'Financials & Billing', icon: Receipt },
          { key: 'departments', label: 'Departments', icon: Building2 },
        ];

      case 'DOCTOR':
        return [
          { key: 'dashboard', label: 'Clinical Queue', icon: LayoutDashboard },
          { key: 'appointments', label: 'My Consultations', icon: Calendar },
          { key: 'patients', label: 'Assigned Patients', icon: Users },
          { key: 'prescriptions', label: 'Prescriptions (℞)', icon: FileText },
        ];

      case 'PATIENT':
        return [
          { key: 'dashboard', label: 'Health Summary', icon: LayoutDashboard },
          { key: 'appointments', label: 'My Consultations', icon: Calendar },
          { key: 'prescriptions', label: 'My Prescriptions', icon: FileText },
          { key: 'billing', label: 'Invoices & Receipts', icon: Receipt },
        ];

      case 'RECEPTIONIST':
        return [
          { key: 'dashboard', label: 'Intake Dashboard', icon: LayoutDashboard },
          { key: 'appointments', label: 'Appointments', icon: Calendar },
          { key: 'patients', label: 'Patient Directory', icon: Users },
          { key: 'billing', label: 'Cashier & Invoicing', icon: Receipt },
        ];

      case 'HR':
        return [
          { key: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { key: 'doctors', label: 'Staff Roster', icon: UserCheck },
          { key: 'departments', label: 'Departments', icon: Building2 },
        ];

      default:
        return [{ key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800/80 transition-all duration-200 ease-in-out lg:static ${
          isCollapsed ? 'w-16' : 'w-60'
        } ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Navigation Items List */}
        <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelectNav(item.key);
                  if (isOpenMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Sidebar Controls */}
        <div className="p-2.5 border-t border-slate-800/80 bg-slate-950 shrink-0 space-y-1">
          {/* Collapse Toggle for Desktop */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden lg:flex items-center gap-2 w-full p-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[11px] font-medium">Collapse Menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
