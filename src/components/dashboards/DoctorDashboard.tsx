import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  Activity,
  HeartPulse,
  Plus,
  Search,
  Stethoscope,
} from 'lucide-react';
import { Appointment, Doctor, Patient, UserAccount } from '../../types';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';

interface DoctorDashboardProps {
  currentUser: UserAccount;
  activeNav: string;
  doctorProfile?: Doctor;
  appointments: Appointment[];
  patients: Patient[];
  onOpenWritePrescription: (appointment: Appointment) => void;
  onViewPrescription: (appointment: Appointment) => void;
  onOpenQuickBooking: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  currentUser,
  activeNav,
  doctorProfile,
  appointments,
  patients,
  onOpenWritePrescription,
  onViewPrescription,
  onOpenQuickBooking,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter appointments specifically assigned to this doctor (or default to doctor name)
  const doctorAppointments = appointments.filter(
    (a) =>
      a.doctorId === doctorProfile?.id ||
      a.doctorName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[1] || '')
  );

  const pendingCount = doctorAppointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  ).length;
  const completedCount = doctorAppointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Doctor Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {currentUser.name}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Active On Duty
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.title || 'Senior Consultant'} &bull; Suite 302 &bull; Cardiology Wing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQuickBooking}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Walk-in Consult</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Assigned Consults"
          value={doctorAppointments.length}
          icon={Calendar}
          accent="teal"
        />
        <StatCard
          label="Pending Diagnoses / Queue"
          value={pendingCount}
          icon={Clock}
          accent="amber"
          subtitle="Waiting in Outpatient Lounge"
        />
        <StatCard
          label="Completed Consultations"
          value={completedCount}
          icon={CheckCircle2}
          accent="emerald"
          trend={{ value: '100% Rx Signed', isPositive: true }}
        />
        <StatCard
          label="Clinical Rating"
          value="4.9 / 5.0"
          icon={HeartPulse}
          accent="sky"
          subtitle="Based on 128 verified reviews"
        />
      </div>

      {/* VIEW: DASHBOARD */}
      {activeNav === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Outpatient Queue Table */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Today's Patient Schedule</h3>
                <p className="text-[11px] text-slate-400">
                  Manage triage, examine vitals, and issue electronic Rx
                </p>
              </div>
              <span className="text-xs text-teal-600 font-semibold">
                {pendingCount} Awaiting Diagnosis
              </span>
            </div>

            <div className="space-y-3">
              {doctorAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{apt.patientName}</span>
                      <StatusBadge status={apt.status} size="sm" />
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({apt.appointmentId})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-snug">
                      <strong className="text-slate-700">Complaint:</strong> {apt.symptoms}
                    </p>

                    {apt.vitals && (
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span>
                          BP: <strong className="text-slate-700">{apt.vitals.bloodPressure}</strong>
                        </span>
                        <span>
                          Pulse: <strong className="text-slate-700">{apt.vitals.pulseRate}</strong>
                        </span>
                        <span>
                          Temp: <strong className="text-slate-700">{apt.vitals.temperature}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {apt.prescription ? (
                      <button
                        onClick={() => onViewPrescription(apt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-semibold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Rx (℞)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenWritePrescription(apt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Sign Prescription (℞)</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Clinic Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Consulting Suite Details</h3>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Room / Ward:</span>
                  <strong className="text-slate-800">Suite 302 (Cardiology)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Duty Hours:</span>
                  <strong className="text-slate-800">09:00 AM - 02:00 PM</strong>
                </div>
                <div className="flex justify-between">
                  <span>Consultation Fee:</span>
                  <strong className="text-teal-700 font-bold">₹150.00</strong>
                </div>
                <div className="flex justify-between">
                  <span>Electronic Prescriptions:</span>
                  <strong className="text-emerald-700">Digital PKI Active</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: APPOINTMENTS */}
      {activeNav === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Assigned Patient Consultations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Ref ID</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Scheduled Date</th>
                  <th className="py-3 px-3">Symptoms</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Prescription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctorAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                      {apt.appointmentId}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{apt.patientName}</td>
                    <td className="py-3 px-3">
                      <div>{apt.date}</div>
                      <div className="text-[11px] text-slate-400">{apt.timeSlot}</div>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-slate-600">{apt.symptoms}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      {apt.prescription ? (
                        <button
                          onClick={() => onViewPrescription(apt)}
                          className="text-teal-600 font-semibold hover:underline"
                        >
                          View Rx
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenWritePrescription(apt)}
                          className="text-slate-900 font-bold hover:underline"
                        >
                          Sign Rx
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: PATIENTS */}
      {activeNav === 'patients' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Assigned Patient Records</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patients.map((pat) => (
              <div
                key={pat.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{pat.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{pat.patientId}</span>
                  </div>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Blood Group: {pat.bloodGroup}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                  <div>
                    DOB: <strong>{pat.dob}</strong>
                  </div>
                  <div>
                    Phone: <strong>{pat.phone}</strong>
                  </div>
                  <div className="col-span-2">
                    Allergies: <strong className="text-rose-700">{pat.allergies}</strong>
                  </div>
                  <div className="col-span-2">
                    Emergency: <strong>{pat.emergencyContact}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: PRESCRIPTIONS */}
      {activeNav === 'prescriptions' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Signed Electronic Prescriptions (℞)</h2>
          <div className="space-y-3">
            {doctorAppointments
              .filter((a) => a.prescription)
              .map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{apt.patientName}</span>
                      <span className="text-[10px] text-teal-700 font-mono bg-teal-50 px-2 py-0.5 rounded">
                        RX-{apt.appointmentId}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">
                      Diagnosis:{' '}
                      <strong className="text-slate-800">{apt.prescription?.diagnosis}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Prescribed on: {apt.prescription?.prescribedAt || apt.date} &bull; Follow-up:{' '}
                      {apt.prescription?.followUp}
                    </p>
                  </div>

                  <button
                    onClick={() => onViewPrescription(apt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    <span>View & Print Rx</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
