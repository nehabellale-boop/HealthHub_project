import React, { useState } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Receipt,
  UserPlus,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import { Appointment, Invoice, Patient, UserAccount } from '../../types';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';

interface ReceptionistDashboardProps {
  currentUser: UserAccount;
  activeNav: string;
  appointments: Appointment[];
  patients: Patient[];
  invoices: Invoice[];
  onOpenBookAppointment: () => void;
  onOpenRegisterPatient: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onSettleInvoice: (id: number) => void;
}

export const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({
  currentUser,
  activeNav,
  appointments,
  patients,
  invoices,
  onOpenBookAppointment,
  onOpenRegisterPatient,
  onViewInvoice,
  onSettleInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const todayAppointments = appointments.filter((a) => a.date === '2026-08-18' || a.status === 'CONFIRMED');
  const unpaidInvoices = invoices.filter((i) => i.status !== 'PAID');
  const totalDueAmount = invoices.reduce((acc, inv) => acc + inv.dueAmount, 0);

  return (
    <div className="space-y-6">
      {/* Front Desk Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Front Desk & Cashier Intake
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Reception Terminal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as {currentUser.name} &bull; Main Reception Desk & Patient Registration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRegisterPatient}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Patient Intake</span>
          </button>
          <button
            onClick={onOpenBookAppointment}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Appointment</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Check-in Queue"
          value={todayAppointments.length}
          icon={Calendar}
          accent="teal"
          subtitle="Confirmed outpatient slots"
        />
        <StatCard
          label="Total Registered Patients"
          value={patients.length}
          icon={Users}
          accent="sky"
          trend={{ value: '+4 added today', isPositive: true }}
        />
        <StatCard
          label="Pending Cashier Dues"
          value={`₹${totalDueAmount}.00`}
          icon={DollarSign}
          accent="amber"
          subtitle={`${unpaidInvoices.length} outstanding invoices`}
        />
        <StatCard
          label="Cashier Station Status"
          value="Desk 1 Active"
          icon={Receipt}
          accent="emerald"
          subtitle="Ready for cash & card intake"
        />
      </div>

      {/* VIEW: DASHBOARD */}
      {activeNav === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Today's Check-in Roster (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Arrival Roster & Outpatient Queue</h3>
                <p className="text-[11px] text-slate-400">Track patient check-in status and physician routing</p>
              </div>
            </div>

            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{apt.patientName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({apt.appointmentId})</span>
                      <StatusBadge status={apt.status} size="sm" />
                    </div>
                    <p className="text-slate-600">
                      Assigned to: <strong className="text-slate-800">{apt.doctorName}</strong> ({apt.departmentName}) &bull;{' '}
                      Slot: <strong>{apt.timeSlot}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">{apt.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cashier Quick Desk (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Fee Collection & Counter Settlement</h3>
              <p className="text-[11px] text-slate-400">Collect consultation fee at check-in</p>

              <div className="space-y-2.5">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900 block">{inv.patientName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{inv.invoiceNumber}</span>
                      </div>
                      <StatusBadge status={inv.status} size="sm" />
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                      <span className="font-semibold text-slate-800">₹{inv.totalAmount}.00</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          className="text-teal-600 font-medium hover:underline text-[11px]"
                        >
                          Receipt
                        </button>
                        {inv.dueAmount > 0 && (
                          <button
                            onClick={() => onSettleInvoice(inv.id)}
                            className="text-emerald-600 font-bold hover:underline text-[11px]"
                          >
                            Collect ₹{inv.dueAmount}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: APPOINTMENTS */}
      {activeNav === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Appointment Scheduling Roster</h2>
            <button
              onClick={onOpenBookAppointment}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold"
            >
              Book Consultation
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Doctor</th>
                  <th className="py-3 px-3">Date / Time</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-semibold">{apt.appointmentId}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{apt.patientName}</td>
                    <td className="py-3 px-3">{apt.doctorName}</td>
                    <td className="py-3 px-3">{apt.date} &bull; {apt.timeSlot}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={apt.status} />
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
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Patient Directory</h2>
            <button
              onClick={onOpenRegisterPatient}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold"
            >
              Intake Patient
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patients.map((pat) => (
              <div key={pat.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{pat.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{pat.patientId}</span>
                  </div>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {pat.bloodGroup}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-slate-600">
                  <div>Phone: <strong>{pat.phone}</strong></div>
                  <div>DOB: <strong>{pat.dob}</strong></div>
                  <div className="col-span-2">Insurance: <strong>{pat.insuranceProvider}</strong></div>
                  <div className="col-span-2">Emergency: <strong>{pat.emergencyContact}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: BILLING */}
      {activeNav === 'billing' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Cashier Counter & Invoicing</h2>
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">{inv.patientName}</span>
                    <span className="text-slate-400 font-mono text-[10px]">({inv.invoiceNumber})</span>
                    <StatusBadge status={inv.status} size="sm" />
                  </div>
                  <p className="text-slate-600">Doctor: {inv.doctorName} &bull; Total: ₹{inv.totalAmount}.00 &bull; Due: ₹{inv.dueAmount}.00</p>
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
                      Collect Due (₹{inv.dueAmount})
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
