import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, RefreshCw } from 'lucide-react';
import { Role } from '../../types';

interface ForbiddenPageProps {
  currentRole: Role;
  requestedPath: string;
  onReturnToDashboard: () => void;
}

export const ForbiddenPage: React.FC<ForbiddenPageProps> = ({
  currentRole,
  requestedPath,
  onReturnToDashboard,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <span className="text-[11px] font-bold tracking-wider uppercase text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
          HTTP 403 &bull; Access Forbidden
        </span>

        <h1 className="text-xl font-bold text-slate-900 mt-4 mb-2">
          Clinical Security Clearance Required
        </h1>

        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          Your account with role <strong className="text-slate-900">[{currentRole}]</strong> does not
          possess administrative clearance to access{' '}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-rose-700 text-[11px]">
            {requestedPath}
          </code>
          . All unauthorized attempts are logged for HIPAA compliance.
        </p>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1 mb-6">
          <div className="flex justify-between text-slate-500">
            <span>Current Role:</span>
            <span className="font-semibold text-slate-800">{currentRole}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Security Policy:</span>
            <span className="font-mono text-slate-800">RBAC_STRICT_ENFORCE</span>
          </div>
        </div>

        <button
          onClick={onReturnToDashboard}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Authorized Dashboard</span>
        </button>
      </div>
    </div>
  );
};
