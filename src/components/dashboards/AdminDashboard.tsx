import React, { useState } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  Building2,
  Stethoscope,
  TrendingUp,
  Search,
  Filter,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  Department,
  Doctor,
  Patient,
  Appointment,
  Invoice,
  UserAccount,
} from '../../types';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';

interface AdminDashboardProps {
  currentUser: UserAccount;
  activeNav: string;
  departments: Department[];
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  invoices: Invoice[];
  onOpenBookAppointment: () => void;
  onOpenRegisterPatient: () => void;
  onOpenRegisterDoctor: () => void;
  onViewPrescription: (appointment: Appointment) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onCancelAppointment: (id: number) => void;
  onSettleInvoice: (id: number) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  activeNav,
  departments,
  doctors,
  patients,
  appointments,
  invoices,
  onOpenBookAppointment,
  onOpenRegisterPatient,
  onOpenRegisterDoctor,
  onViewPrescription,
  onViewInvoice,
  onCancelAppointment,
  onSettleInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Compute key enterprise stats
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const totalReceivables = invoices.reduce((acc, inv) => acc + inv.dueAmount, 0);
  const activeDoctorsCount = doctors.filter((d) => d.status === 'ACTIVE').length;
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED').length;

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.appointmentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Executive Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Hospital Operations Overview
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, {currentUser.name}. Master administration & multi-department telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRegisterPatient}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Intake Patient</span>
          </button>
          <button
            onClick={onOpenBookAppointment}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Consult</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Consultations"
          value={appointments.length}
          icon={Calendar}
          accent="teal"
          trend={{ value: '+14.2%', isPositive: true, period: 'vs last month' }}
        />
        <StatCard
          label="Active Specialists"
          value={activeDoctorsCount}
          icon={Stethoscope}
          accent="sky"
          subtitle={`${departments.length} Clinical Departments`}
        />
        <StatCard
          label="Registered Patients"
          value={patients.length}
          icon={Users}
          accent="slate"
          trend={{ value: '+9.8%', isPositive: true, period: 'intake growth' }}
        />
        <StatCard
          label="Revenue Collected"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          accent="emerald"
          trend={{ value: `₹${totalReceivables} pending`, isNeutral: true }}
        />
      </div>

      {/* MAIN VIEW CONTENT BASED ON activeNav */}
      {activeNav === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Appointments Table (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Real-time Outpatient Queue</h3>
                <p className="text-[11px] text-slate-400">Scheduled clinical sessions across all hospital departments</p>
              </div>
              <span className="text-xs text-teal-600 font-semibold cursor-pointer hover:underline">
                View All ({appointments.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 px-2">Patient</th>
                    <th className="pb-3 px-2">Physician / Dept</th>
                    <th className="pb-3 px-2">Slot</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.slice(0, 5).map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-semibold text-slate-900">{apt.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{apt.appointmentId}</div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-slate-800 font-medium">{apt.doctorName}</div>
                        <div className="text-[11px] text-slate-400">{apt.departmentName}</div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-slate-700">{apt.date}</div>
                        <div className="text-[11px] text-slate-400">{apt.timeSlot}</div>
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={apt.status} />
                      </td>
                      <td className="py-3 px-2 text-right">
                        {apt.prescription ? (
                          <button
                            onClick={() => onViewPrescription(apt)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Rx</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Scheduled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side Summary: Departmental Breakdown & Quick Actions (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Department Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Clinical Departments</h3>
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{dept.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {dept.activeDoctorsCount} Specialists &bull; {dept.headDoctor}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                      {dept.totalAppointments} visits
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoicing Summary */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Recent Invoices</h3>
              <div className="space-y-2.5">
                {invoices.slice(0, 3).map((inv) => (
                  <div
                    key={inv.id}
                    className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{inv.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inv.invoiceNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">₹{inv.totalAmount}.00</div>
                      <StatusBadge status={inv.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPOINTMENTS TAB */}
      {activeNav === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Appointments Management</h2>
              <p className="text-xs text-slate-500">Filter and control hospital-wide outpatient schedules</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patient, doc, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Appointment ID</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Doctor / Department</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Symptoms</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                      {apt.appointmentId}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{apt.patientName}</td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{apt.doctorName}</div>
                      <div className="text-[11px] text-slate-400">{apt.departmentName}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>{apt.date}</div>
                      <div className="text-[11px] text-slate-400">{apt.timeSlot}</div>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-slate-600">{apt.symptoms}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      {apt.prescription && (
                        <button
                          onClick={() => onViewPrescription(apt)}
                          className="text-teal-600 hover:text-teal-700 font-semibold text-[11px]"
                        >
                          View Rx
                        </button>
                      )}
                      {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                        <button
                          onClick={() => onCancelAppointment(apt.id)}
                          className="text-rose-600 hover:text-rose-700 font-semibold text-[11px]"
                        >
                          Cancel
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

      {/* DOCTORS TAB */}
      {activeNav === 'doctors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Medical Specialists & Physicians</h2>
              <p className="text-xs text-slate-500">Board-certified clinical roster</p>
            </div>
            <button
              onClick={onOpenRegisterDoctor}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Onboard Doctor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                      <p className="text-xs text-teal-600 font-medium">{doc.specialization}</p>
                    </div>
                    <StatusBadge status={doc.status} size="sm" />
                  </div>

                  <p className="text-xs text-slate-500 mb-3">{doc.qualification}</p>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="font-semibold text-slate-800">{doc.departmentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fee per visit:</span>
                      <span className="font-bold text-teal-700">₹{doc.consultationFee}.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Schedule:</span>
                      <span className="font-medium text-slate-700">{doc.availableDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Suite:</span>
                      <span className="font-mono text-slate-700">{doc.roomNumber || 'Room 101'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-400 font-mono text-[11px]">{doc.doctorId}</span>
                  <span className="text-amber-600 font-bold">★ {doc.rating || '4.9'} / 5.0</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PATIENTS TAB */}
      {activeNav === 'patients' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Patient Electronic Health Registry</h2>
              <p className="text-xs text-slate-500">Secure record management and emergency telemetry</p>
            </div>
            <button
              onClick={onOpenRegisterPatient}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Intake New Patient</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Patient ID</th>
                  <th className="py-3 px-3">Full Name</th>
                  <th className="py-3 px-3">Gender / Blood</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Allergies</th>
                  <th className="py-3 px-3">Insurance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900">{pat.patientId}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{pat.name}</td>
                    <td className="py-3 px-3">
                      <span className="capitalize">{pat.gender.toLowerCase()}</span> &bull;{' '}
                      <span className="font-bold text-rose-600">{pat.bloodGroup}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div>{pat.phone}</div>
                      <div className="text-[11px] text-slate-400">{pat.email}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{pat.allergies || 'None'}</td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800">{pat.insuranceProvider || 'Direct Cash'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BILLING TAB */}
      {activeNav === 'billing' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Financial Ledger & Invoices</h2>
              <p className="text-xs text-slate-500">Accounts receivable, payments, and billing audit</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Invoice #</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Doctor / Dept</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Paid</th>
                  <th className="py-3 px-3">Due</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{inv.patientName}</td>
                    <td className="py-3 px-3 text-slate-700">{inv.doctorName}</td>
                    <td className="py-3 px-3 text-slate-500">{inv.date}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">₹{inv.totalAmount}.00</td>
                    <td className="py-3 px-3 text-emerald-600 font-medium">₹{inv.paidAmount}.00</td>
                    <td className="py-3 px-3 font-bold text-rose-600">₹{inv.dueAmount}.00</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="text-teal-600 hover:text-teal-700 font-semibold text-[11px]"
                      >
                        Receipt
                      </button>
                      {inv.dueAmount > 0 && (
                        <button
                          onClick={() => onSettleInvoice(inv.id)}
                          className="text-emerald-600 hover:text-emerald-700 font-semibold text-[11px]"
                        >
                          Settle
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

      {/* DEPARTMENTS TAB */}
      {activeNav === 'departments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hospital Clinical Departments</h2>
              <p className="text-xs text-slate-500">Service centers, ward capacity, and division directors</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{dept.name}</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">{dept.description}</p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Head of Department:</span>
                    <span className="font-semibold text-slate-800">{dept.headDoctor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Staff:</span>
                    <span className="font-medium text-slate-700">{dept.activeDoctorsCount} Specialists</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Completed Sessions:</span>
                    <span className="font-bold text-teal-700">{dept.totalAppointments} Visits</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
