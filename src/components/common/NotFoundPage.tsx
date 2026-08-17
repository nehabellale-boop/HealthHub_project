import React from 'react';
import { FileQuestion, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onReturnToDashboard: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onReturnToDashboard }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
          <FileQuestion className="w-7 h-7" />
        </div>

        <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          HTTP 404 &bull; Page Not Found
        </span>

        <h1 className="text-xl font-bold text-slate-900 mt-4 mb-2">
          Clinical Resource Not Found
        </h1>

        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          The requested record, patient chart, or route does not exist or has been archived.
        </p>

        <button
          onClick={onReturnToDashboard}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
