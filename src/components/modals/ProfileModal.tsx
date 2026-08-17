import React from 'react';
import { X, User, Mail, Shield, Building, Phone, Calendar, CheckCircle2 } from 'lucide-react';
import { UserAccount } from '../../types';

interface ProfileModalProps {
  currentUser: UserAccount;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ currentUser, onClose }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">User Profile</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Avatar & Core Identity */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 font-bold text-lg flex items-center justify-center shrink-0">
              {getInitials(currentUser.name)}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-base leading-tight truncate">
                {currentUser.name}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">{currentUser.title || currentUser.role}</p>
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                <Shield className="w-3 h-3 text-teal-600" />
                <span>{currentUser.role} Account</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
              </span>
              <span className="font-medium text-slate-800">{currentUser.email}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" /> Facility
              </span>
              <span className="font-medium text-slate-800">HealthHub Medical Center</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" /> Department
              </span>
              <span className="font-medium text-slate-800">
                {currentUser.department || 'General Practice'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Account Status
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-teal-700">
                Active &bull; Verified
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
