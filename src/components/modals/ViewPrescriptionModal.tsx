import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import { ShieldHeartbeatIcon } from '../common/BrandLogo';
import { Appointment } from '../../types';

interface ViewPrescriptionModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export const ViewPrescriptionModal: React.FC<ViewPrescriptionModalProps> = ({
  appointment,
  onClose,
}) => {
  const rx = appointment.prescription;
  if (!rx) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1055] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 animate-in fade-in my-auto">
        {/* Prescription Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <ShieldHeartbeatIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                HEALTHHUB HEALTHCARE & RESEARCH HOSPITAL
              </h2>
              <p className="text-xs text-slate-500">
                742 Evergreen Healthcare Ave &bull; Dept of Clinical Medicine &bull; Tel: +1 (800) 555-911
              </p>
              <span className="inline-block mt-1 text-[10px] font-mono text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                Official Electronic Prescription ID: RX-{appointment.appointmentId}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors d-print-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Doctor and Patient Meta Row */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-6 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Consulting Physician
            </span>
            <div className="font-bold text-slate-900 text-sm">{appointment.doctorName}</div>
            <div className="text-slate-500">{appointment.departmentName} Specialist</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Patient Information
            </span>
            <div className="font-bold text-slate-900 text-sm">{appointment.patientName}</div>
            <div className="text-slate-500">Date of Visit: {appointment.date} ({appointment.timeSlot})</div>
          </div>
        </div>

        {/* Vitals Summary if available */}
        {appointment.vitals && (
          <div className="grid grid-cols-4 gap-2 mb-6 p-3 rounded-xl bg-teal-50/50 border border-teal-100 text-xs">
            <div>
              <span className="text-[10px] text-teal-600 block">Blood Pressure</span>
              <span className="font-bold text-slate-800">{appointment.vitals.bloodPressure || '120/80'}</span>
            </div>
            <div>
              <span className="text-[10px] text-teal-600 block">Pulse Rate</span>
              <span className="font-bold text-slate-800">{appointment.vitals.pulseRate || '72 bpm'}</span>
            </div>
            <div>
              <span className="text-[10px] text-teal-600 block">Temperature</span>
              <span className="font-bold text-slate-800">{appointment.vitals.temperature || '98.6 °F'}</span>
            </div>
            <div>
              <span className="text-[10px] text-teal-600 block">Weight</span>
              <span className="font-bold text-slate-800">{appointment.vitals.weight || '65 kg'}</span>
            </div>
          </div>
        )}

        {/* Clinical Diagnosis */}
        <div className="mb-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Clinical Diagnosis
          </span>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900">
            {rx.diagnosis}
          </div>
        </div>

        {/* Prescription Rx Symbol & Medications */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-serif font-black text-teal-600 leading-none">℞</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Medications & Dosing Schedule
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-800 whitespace-pre-line leading-relaxed">
            {rx.medicines}
          </div>
        </div>

        {/* Instructions & Follow up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
          {rx.dosage && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-700 block mb-1">Dosage Instructions</span>
              <p className="text-slate-600 mb-0 leading-relaxed">{rx.dosage}</p>
            </div>
          )}
          {rx.followUp && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-700 block mb-1">Recommended Follow-up</span>
              <p className="text-teal-700 font-semibold mb-0">{rx.followUp}</p>
              {rx.notes && <p className="text-[11px] text-slate-500 mt-1">{rx.notes}</p>}
            </div>
          )}
        </div>

        {/* Digital Signature & Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Digitally Verified by HealthHub PKI Certificate</span>
          </div>

          <div className="flex items-center gap-2 d-print-none">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Rx</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
