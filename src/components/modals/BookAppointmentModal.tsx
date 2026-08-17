import React, { useState } from 'react';
import { X, Calendar, Clock, Stethoscope, User, AlertCircle } from 'lucide-react';
import { Doctor, UserAccount } from '../../types';

interface BookAppointmentModalProps {
  doctors: Doctor[];
  currentUser: UserAccount;
  onClose: () => void;
  onBook: (data: {
    doctorId: number;
    date: string;
    timeSlot: string;
    symptoms: string;
    patientName?: string;
  }) => void;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  doctors,
  currentUser,
  onClose,
  onBook,
}) => {
  const [doctorId, setDoctorId] = useState<number>(doctors[0]?.id || 1);
  const [date, setDate] = useState<string>('2026-08-20');
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM');
  const [symptoms, setSymptoms] = useState<string>('');
  const [walkinPatientName, setWalkinPatientName] = useState<string>('');

  const selectedDoc = doctors.find((d) => d.id === doctorId) || doctors[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook({
      doctorId,
      date,
      timeSlot,
      symptoms: symptoms || 'Outpatient Consultation & Health Evaluation',
      patientName:
        currentUser.role === 'PATIENT'
          ? currentUser.name
          : walkinPatientName || 'Walk-in Registered Patient',
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1055] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Schedule Clinical Consultation</h3>
              <p className="text-[11px] text-slate-400">Book specialist appointment with instant slot reservation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Patient name if booked by staff */}
          {currentUser.role !== 'PATIENT' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Name / Identifier *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe or Sarah Jenkins"
                value={walkinPatientName}
                onChange={(e) => setWalkinPatientName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          )}

          {/* Select Doctor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Specialist / Physician *
            </label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} &bull; {d.departmentName} (₹{d.consultationFee}) &bull; {d.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* Specialist Summary Card */}
          {selectedDoc && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Department</span>
                <span className="font-semibold text-slate-800">{selectedDoc.departmentName}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Available</span>
                <span className="font-semibold text-slate-800">{selectedDoc.availableDays}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-medium">Consultation Fee</span>
                <span className="font-bold text-teal-700">₹{selectedDoc.consultationFee}.00</span>
              </div>
            </div>
          )}

          {/* Date and Time Slot */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consultation Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Time Slot *
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                <option value="09:00 AM">09:00 AM - 09:30 AM</option>
                <option value="09:30 AM">09:30 AM - 10:00 AM</option>
                <option value="10:00 AM">10:00 AM - 10:30 AM</option>
                <option value="11:30 AM">11:30 AM - 12:00 PM</option>
                <option value="02:00 PM">02:00 PM - 02:30 PM</option>
                <option value="03:30 PM">03:30 PM - 04:00 PM</option>
              </select>
            </div>
          </div>

          {/* Chief Complaint / Symptoms */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chief Symptoms / Reason for Visit *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe symptoms, duration, medical history, or primary concerns..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 placeholder-slate-400"
            />
          </div>

          {/* Footer buttons */}
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
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              Confirm & Generate Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
