import React from 'react';
import { X, Settings, Shield, Bell, Lock, Globe, Server, Check } from 'lucide-react';
import { ShieldHeartbeatIcon } from '../common/BrandLogo';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Application Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Notifications Setting */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Clinical Sound & Alerts</p>
                <p className="text-slate-500 text-[11px]">Real-time audio notification on new appointments</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded bg-teal-100/80 text-teal-800 text-[10px] font-bold">
              ENABLED
            </span>
          </div>

          {/* Security & HIPAA Setting */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">HIPAA Audit Trails</p>
                <p className="text-slate-500 text-[11px]">256-bit encryption for patient record requests</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
              COMPLIANT
            </span>
          </div>

          {/* System & Version Information */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              System Version & Build
            </p>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <ShieldHeartbeatIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-xl text-slate-900 tracking-tight leading-none">HealthHub</p>
                  <p className="text-[11px] text-slate-500 mt-1">Healthcare Platform &bull; Release Build: v3.2.4-prod</p>
                </div>
              </div>
              <span className="text-[11px] text-teal-700 font-medium bg-teal-50 px-2 py-1 rounded border border-teal-200/60 shrink-0">
                Up to Date
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
