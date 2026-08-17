import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Appointment } from '../../types';

interface PrescriptionModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSave: (prescription: {
    diagnosis: string;
    medicines: string;
    dosage: string;
    followUp: string;
    notes?: string;
  }) => void;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  appointment,
  onClose,
  onSave,
}) => {
  const [diagnosis, setDiagnosis] = useState(
    appointment.prescription?.diagnosis || 'Acute Outpatient Assessment'
  );
  const [medicines, setMedicines] = useState(
    appointment.prescription?.medicines ||
      '1. Amoxicillin 500mg (Oral) - 1 capsule TID after meals for 7 days\n2. Paracetamol 650mg (Oral) - 1 tablet SOS for fever/pain\n3. Vitamin C + Zinc - 1 tablet daily morning'
  );
  const [dosage, setDosage] = useState(
    appointment.prescription?.dosage ||
      'Drink plenty of fluids. Rest for 3 days. Take all antibiotics on full stomach.'
  );
  const [followUp, setFollowUp] = useState(
    appointment.prescription?.followUp || '2026-09-01'
  );
  const [notes, setNotes] = useState(
    appointment.prescription?.notes ||
      'Patient advised to monitor temperature twice daily and report immediately if persistent.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ diagnosis, medicines, dosage, followUp, notes });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1055] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Write Electronic Prescription (℞)</h3>
              <p className="text-[11px] text-slate-400">
                Patient: <strong className="text-slate-700">{appointment.patientName}</strong> &bull;{' '}
                Ref: {appointment.appointmentId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Diagnosis */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Diagnosis *
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          {/* Prescribed Medicines */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prescribed Medications & Formulations (One per line) *
            </label>
            <textarea
              rows={4}
              required
              value={medicines}
              onChange={(e) => setMedicines(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 leading-relaxed"
            />
          </div>

          {/* Dosage & Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dosage & Administration Instructions
              </label>
              <textarea
                rows={2}
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Follow-up Consultation Date
              </label>
              <input
                type="date"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 mb-2"
              />
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Clinical Advice
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Diet, restrictions, precautions"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Digitally Sign & Complete</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
