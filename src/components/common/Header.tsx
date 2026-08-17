import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  LogOut,
  User as UserIcon,
  Settings,
  ChevronDown,
  Menu,
  X,
  Calendar,
  DollarSign,
  CheckCircle2,
  Shield,
  Hospital,
} from 'lucide-react';
import { ShieldHeartbeatIcon } from './BrandLogo';
import { UserAccount, NotificationItem } from '../../types';

interface HeaderProps {
  currentUser: UserAccount;
  onLogout: () => void;
  onOpenQuickBooking?: () => void;
  onToggleSidebar?: () => void;
  notifications?: NotificationItem[];
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenQuickBooking,
  onToggleSidebar,
  notifications = [],
  onOpenProfile,
  onOpenSettings,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleBadgeStyle: Record<string, { label: string; bg: string; text: string }> = {
    ADMIN: { label: 'Administrator', bg: 'bg-slate-100', text: 'text-slate-700' },
    DOCTOR: { label: 'Physician', bg: 'bg-teal-50', text: 'text-teal-700' },
    PATIENT: { label: 'Patient', bg: 'bg-sky-50', text: 'text-sky-700' },
    RECEPTIONIST: { label: 'Front Desk', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    HR: { label: 'Human Resources', bg: 'bg-purple-50', text: 'text-purple-700' },
  };

  const currentRoleInfo = roleBadgeStyle[currentUser.role] || {
    label: currentUser.role,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* LEFT: Mobile Menu Toggle + Hospital Logo & HealthHub Wordmark */}
      <div className="flex items-center gap-3 lg:gap-4 shrink-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Toggle Navigation"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <ShieldHeartbeatIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-slate-900 tracking-tight leading-none">
              HealthHub
            </span>
          </div>
        </div>
      </div>

      {/* CENTER: Minimal Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 lg:mx-8 hidden sm:block">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search patients, doctors, records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* RIGHT: In Order: (a) Book Appointment, (b) Notification Bell, (c) User Menu */}
      <div className="flex items-center gap-3 shrink-0">
        {/* a. Book Appointment Primary Button */}
        {onOpenQuickBooking && (
          <button
            type="button"
            onClick={onOpenQuickBooking}
            className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold tracking-wide transition-colors shadow-xs"
          >
            Book Appointment
          </button>
        )}

        {/* b. Subtler Notification Bell with Unread Count */}
        <div className="relative" ref={notifMenuRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-teal-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Notifications
                </span>
                <span className="text-[11px] text-teal-600 font-medium hover:underline cursor-pointer">
                  Mark all as read
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-slate-50 transition-colors flex gap-3 items-start ${
                        !n.read ? 'bg-teal-50/30' : ''
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 mb-0.5 truncate">{n.title}</p>
                        <p className="text-slate-600 text-[11px] leading-relaxed mb-1">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* c. User Menu: Avatar circle, Name, Role below name, Chevron */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 rounded-lg hover:bg-slate-100 transition-colors text-left group"
          >
            {/* Avatar Circle: Initial, Muted neutral background */}
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 border border-slate-200/90 font-semibold text-xs flex items-center justify-center shrink-0">
              {getInitials(currentUser.name)}
            </div>

            {/* Name + Small Gray Role Label Below */}
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-slate-800 group-hover:text-slate-900">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                {currentUser.title || currentRoleInfo.label}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 hidden sm:block" />
          </button>

          {/* User Dropdown: Profile, Settings, Log Out + subtle role badge */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                  <span
                    className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-md ${currentRoleInfo.bg} ${currentRoleInfo.text}`}
                  >
                    {currentRoleInfo.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onOpenProfile) onOpenProfile();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors font-medium"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onOpenSettings) onOpenSettings();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors font-medium"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
