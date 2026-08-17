import React from 'react';
import { ShieldCheck, Activity, CheckCircle2, Sparkles } from 'lucide-react';
import { ShieldHeartbeatIcon } from '../common/BrandLogo';

interface AuthLayoutProps {
  children: React.ReactNode;
  subtitle?: string;
  stepContext?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  subtitle = 'Enterprise Clinical Cloud',
  stepContext,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 font-sans">
      <div className="flex-1 grid lg:grid-cols-12 min-h-screen">
        {/* LEFT SIDE: Brand & Clinical Platform Showcase (Visible on >=1024px, stacked/hidden on mobile) */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-slate-900 flex-col justify-between p-10 xl:p-12 relative overflow-hidden border-r border-slate-800">
          {/* Subtle ambient lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Wordmark */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-900/40 shrink-0">
              <ShieldHeartbeatIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl text-white tracking-tight block">
                HEALTHHUB
              </span>
              <span className="text-xs text-teal-400 font-mono uppercase tracking-wider block">
                {subtitle}
              </span>
            </div>
          </div>

          {/* Center Brand Pitch */}
          <div className="relative z-10 my-auto max-w-lg space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Connected Healthcare</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Unified Hospital Operations, Patient Care, and Clinical Precision.
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed">
              HealthHub platform powers real-time outpatient appointments, encrypted digital prescriptions (℞),
              departmental scheduling, and instant billing for modern medical centers.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-teal-400 mb-1 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>HIPAA & RBAC Secure</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Strict role-governed data protection for patients and providers.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-sky-400 mb-1 text-xs font-bold">
                  <Activity className="w-4 h-4" />
                  <span>Sub-second Latency</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Real-time queue tracking, vitals charting, and automated invoicing.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Trust & Compliance Credentials */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-6">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                99.99% Clinical Uptime
              </span>
              <span>&bull;</span>
              <span>256-bit AES Encryption</span>
            </div>
            <span>v3.2 Healthcare Cloud</span>
          </div>
        </div>

        {/* RIGHT SIDE: Interactive Auth Terminal */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-10 bg-white text-slate-800 overflow-y-auto">
          {/* Top Mobile Brand (visible only below lg) */}
          <div className="flex lg:hidden items-center justify-between pb-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <ShieldHeartbeatIcon className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-900 text-xl tracking-tight leading-none">HEALTHHUB</span>
            </div>
            {stepContext ? (
              <span className="text-[11px] bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded border border-teal-100">
                {stepContext}
              </span>
            ) : (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
                Clinical Portal
              </span>
            )}
          </div>

          {/* Center Form Container */}
          <div className="my-auto max-w-md w-full mx-auto py-6 sm:py-8">
            {children}
          </div>

          {/* Bottom Legal / Help footer */}
          <div className="pt-6 text-center text-xs text-slate-400 border-t border-slate-100">
            &copy; 2026 HealthHub Healthcare & Research Hospital. Protected by RBAC & HIPAA policies.
          </div>
        </div>
      </div>
    </div>
  );
};
