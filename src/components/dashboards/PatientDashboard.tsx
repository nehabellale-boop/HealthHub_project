import React, { useState } from 'react';
import {
  Calendar,
  FileText,
  Receipt,
  HeartPulse,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  DollarSign,
} from 'lucide-react';
import { Appointment, Invoice, UserAccount } from '../../types';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';

interface PatientDashboardProps {
  currentUser: UserAccount;
  activeNav: string;
  appointments: Appointment[];
  invoices: Invoice[];
  onOpenBookAppointment: () => void;
  onViewPrescription: (appointment: Appointment) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onSettleInvoice: (id: number) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  currentUser,
  activeNav,
  appointments,
  invoices,
  onOpenBookAppointment,
  onViewPrescription,
  onViewInvoice,
  onSettleInvoice,
}) => {
  // Filter for this patient
  const myAppointments = appointments.filter(
    (a) => a.patientName.toLowerCase() === currentUser.name.toLowerCase()
  );
  const myInvoices = invoices.filter(
    (i) => i.patientName.toLowerCase() === currentUser.name.toLowerCase()
  );

  const upcomingApt = myAppointments.find((a) => a.status === 'CONFIRMED' || a.status === 'PENDING');
  const totalDue = myInvoices.reduce((sum, i) => sum + i.dueAmount, 0);
  const activePrescriptions = myAppointments.filter((a) => a.prescription);

  return (
    <div className="space-y-6">
      {/* Patient Welcome Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Welcome, {currentUser.name}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                Verified Patient
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              HealthHub Patient ID: <strong className="text-slate-800">{currentUser.patientId || 'PAT-8801'}</strong> &bull; Blood Group: O+
            </p>
          </div>
        </div>

        <button
          onClick={onOpenBookAppointment}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Book Specialist Consult</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Consultations"
          value={myAppointments.length}
          icon={Calendar}
          accent="teal"
        />
        <StatCard
          label="Active Prescriptions (℞)"
          value={activePrescriptions.length}
          icon={FileText}
          accent="sky"
          subtitle="Signed electronic charts"
        />
        <StatCard
          label="Outstanding Due Balance"
          value={`₹${totalDue}.00`}
          icon={DollarSign}
          accent="amber"
          subtitle={totalDue === 0 ? 'All invoices settled' : 'Payment required'}
        />
        <StatCard
          label="Next Hospital Visit"
          value={upcomingApt ? upcomingApt.date : 'None scheduled'}
          icon={Clock}
          accent="slate"
          subtitle={upcomingApt ? `${upcomingApt.timeSlot} (${upcomingApt.doctorName})` : 'Book anytime'}
        />
      </div>

      {/* VIEW: DASHBOARD */}
      {activeNav === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Health Summary (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Upcoming Appointment Highlight Card */}
            {upcomingApt && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-teal-300 uppercase tracking-wider block mb-1">
                    Upcoming Scheduled Consultation
                  </span>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {upcomingApt.doctorName} &bull; {upcomingApt.departmentName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                    <span>Date: <strong className="text-white">{upcomingApt.date}</strong></span>
                    <span>Time: <strong className="text-white">{upcomingApt.timeSlot}</strong></span>
                    <span>Status: <strong className="text-teal-400">{upcomingApt.status}</strong></span>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="inline-block px-3 py-1.5 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-200 text-xs font-semibold">
                    Confirmed Slot
                  </span>
                </div>
              </div>
            )}

            {/* My Consultations List */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Consultation History</h3>
                  <p className="text-[11px] text-slate-400">Past diagnoses, physician visits, and notes</p>
                </div>
              </div>

              <div className="space-y-3">
                {myAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm">{apt.doctorName}</span>
                        <span className="text-[11px] text-slate-500">({apt.departmentName})</span>
                        <StatusBadge status={apt.status} size="sm" />
                      </div>
                      <p className="text-slate-600">
                        Date: <strong>{apt.date}</strong> at <strong>{apt.timeSlot}</strong> &bull; Reason:{' '}
                        {apt.symptoms}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {apt.prescription && (
                        <button
                          onClick={() => onViewPrescription(apt)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Rx</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Quick Invoices & Insurance (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">My Invoices & Receipts</h3>
              <div className="space-y-2.5">
                {myInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900 block">{inv.invoiceNumber}</span>
                        <span className="text-[11px] text-slate-500">{inv.date}</span>
                      </div>
                      <StatusBadge status={inv.status} size="sm" />
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                      <span className="font-bold text-slate-900 text-sm">₹{inv.totalAmount}.00</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          className="text-teal-600 hover:underline font-semibold"
                        >
                          Receipt
                        </button>
                        {inv.dueAmount > 0 && (
                          <button
                            onClick={() => onSettleInvoice(inv.id)}
                            className="text-emerald-600 hover:underline font-bold"
                          >
                            Pay Due (₹{inv.dueAmount})
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 text-xs text-slate-600 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Insurance & Vitals Profile</h3>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span>Coverage:</span>
                  <strong className="text-slate-800">BlueCross Health Direct</strong>
                </div>
                <div className="flex justify-between">
                  <span>Policy ID:</span>
                  <strong className="font-mono text-slate-800">BC-99283-X</strong>
                </div>
                <div className="flex justify-between">
                  <span>Registered Allergies:</span>
                  <strong className="text-rose-600">Penicillin, Shellfish</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: APPOINTMENTS */}
      {activeNav === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">All Scheduled Consultations</h2>
            <button
              onClick={onOpenBookAppointment}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold"
            >
              Book New
            </button>
          </div>
          <div className="space-y-3">
            {myAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">{apt.doctorName}</span>
                    <span className="text-slate-500">({apt.departmentName})</span>
                    <StatusBadge status={apt.status} size="sm" />
                  </div>
                  <p className="text-slate-600">Date: {apt.date} ({apt.timeSlot}) &bull; Symptoms: {apt.symptoms}</p>
                </div>
                {apt.prescription && (
                  <button
                    onClick={() => onViewPrescription(apt)}
                    className="text-teal-600 font-semibold hover:underline"
                  >
                    View Prescription (℞)
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: PRESCRIPTIONS */}
      {activeNav === 'prescriptions' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <h2 className="text-base font-bold text-slate-900">My Electronic Prescriptions (℞)</h2>
          <div className="space-y-3">
            {activePrescriptions.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">{apt.doctorName}</span>
                    <span className="text-[10px] text-teal-700 font-mono bg-teal-50 px-2 py-0.5 rounded">
                      RX-{apt.appointmentId}
                    </span>
                  </div>
                  <p className="text-slate-700 font-semibold">Diagnosis: {apt.prescription?.diagnosis}</p>
                  <p className="text-slate-500 text-[11px]">Prescribed on: {apt.date} &bull; Next Follow-up: {apt.prescription?.followUp}</p>
                </div>
                <button
                  onClick={() => onViewPrescription(apt)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  View & Print (℞)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: BILLING */}
      {activeNav === 'billing' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Invoices & Financial Receipts</h2>
          <div className="space-y-3">
            {myInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">{inv.invoiceNumber}</span>
                    <StatusBadge status={inv.status} size="sm" />
                  </div>
                  <p className="text-slate-600">Physician: {inv.doctorName} &bull; Date: {inv.date}</p>
                  <p className="text-slate-900 font-bold mt-1">Total: ₹{inv.totalAmount}.00 &bull; Paid: ₹{inv.paidAmount}.00</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewInvoice(inv)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                  >
                    View Receipt
                  </button>
                  {inv.dueAmount > 0 && (
                    <button
                      onClick={() => onSettleInvoice(inv.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                    >
                      Settle Balance (₹{inv.dueAmount})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
