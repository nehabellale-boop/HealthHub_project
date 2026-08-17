import React, { useState } from 'react';
import {
  Department,
  Doctor,
  Patient,
  Appointment,
  Invoice,
  UserAccount,
  Role,
  NotificationItem,
} from './types';
import {
  mockUsers,
  initialDepartments,
  initialDoctors,
  initialPatients,
  initialAppointments,
  initialInvoices,
} from './data/mockData';

// UI Components
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ForbiddenPage } from './components/common/ForbiddenPage';
import { NotFoundPage } from './components/common/NotFoundPage';

// Dashboards
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { DoctorDashboard } from './components/dashboards/DoctorDashboard';
import { PatientDashboard } from './components/dashboards/PatientDashboard';
import { ReceptionistDashboard } from './components/dashboards/ReceptionistDashboard';

// Modals
import { BookAppointmentModal } from './components/modals/BookAppointmentModal';
import { PrescriptionModal } from './components/modals/PrescriptionModal';
import { ViewPrescriptionModal } from './components/modals/ViewPrescriptionModal';
import { ViewInvoiceModal } from './components/modals/ViewInvoiceModal';
import { RegisterPatientModal } from './components/modals/RegisterPatientModal';
import { RegisterDoctorModal } from './components/modals/RegisterDoctorModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { SettingsModal } from './components/modals/SettingsModal';

// Auth
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage, RegistrationFormData } from './components/auth/RegisterPage';
import { VerifyOtpPage } from './components/auth/VerifyOtpPage';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  // Session / Authentication state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(mockUsers.admin.user);
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | 'verify_otp'>('login');
  const [pendingRegistration, setPendingRegistration] = useState<RegistrationFormData | null>(null);
  const [authSuccessToast, setAuthSuccessToast] = useState<string | null>(null);
  const [registeredAccounts, setRegisteredAccounts] = useState<
    Record<string, { pass: string; user: UserAccount }>
  >(mockUsers);
  const [activeNav, setActiveNav] = useState<string>('dashboard');

  // Sidebar Layout state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Hospital Domain Data State
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

  // Active Interactive Modals
  const [activeModal, setActiveModal] = useState<
    | 'book_appointment'
    | 'register_patient'
    | 'register_doctor'
    | 'write_prescription'
    | 'view_prescription'
    | 'view_invoice'
    | 'profile'
    | 'settings'
    | null
  >(null);

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Notifications & Live Toasts
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'warning' } | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Consultation Confirmed',
      message: 'Sarah Jenkins scheduled with Dr. Marcus Vance for 09:30 AM.',
      time: '10 mins ago',
      read: false,
      type: 'appointment',
    },
    {
      id: 'notif-2',
      title: 'Payment Received',
      message: 'Invoice #INV-2026-001 settled in full (₹150.00).',
      time: '1 hour ago',
      read: false,
      type: 'billing',
    },
    {
      id: 'notif-3',
      title: 'Digital Rx Signed',
      message: 'Dr. Michael Chen signed electronic prescription for David Miller.',
      time: '3 hours ago',
      read: true,
      type: 'clinical',
    },
  ]);

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Auth Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setActiveNav('dashboard');
    triggerToast(`Welcome back, ${user.name}! Authenticated into clinical workspace.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveNav('dashboard');
    triggerToast('Logged out of clinical workstation.', 'info');
  };

  // Clinical Booking & Invoicing
  const handleBookAppointment = (data: {
    doctorId: number;
    date: string;
    timeSlot: string;
    symptoms: string;
    patientName?: string;
  }) => {
    const doc = doctors.find((d) => d.id === data.doctorId) || doctors[0];
    const newAppointmentId = `APT-2026-${900 + appointments.length + 1}`;

    const pName = data.patientName || (currentUser?.role === 'PATIENT' ? currentUser.name : 'Walk-in Patient');
    const existingPatient = patients.find(
      (p) => p.name.toLowerCase() === pName.toLowerCase()
    );

    const newAppointment: Appointment = {
      id: appointments.length + 1,
      appointmentId: newAppointmentId,
      patientId: existingPatient ? existingPatient.id : patients.length + 1,
      patientName: pName,
      patientGender: existingPatient ? existingPatient.gender : 'OTHER',
      doctorId: doc.id,
      doctorName: doc.name,
      departmentName: doc.departmentName,
      date: data.date,
      timeSlot: data.timeSlot,
      symptoms: data.symptoms,
      status: 'CONFIRMED',
      vitals: {
        bloodPressure: '120/80 mmHg',
        pulseRate: '72 bpm',
        temperature: '98.6 °F',
        weight: '70 kg',
      },
    };

    const newInvoice: Invoice = {
      id: invoices.length + 1,
      invoiceNumber: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
      appointmentId: newAppointment.id,
      patientName: pName,
      doctorName: doc.name,
      departmentName: doc.departmentName,
      totalAmount: doc.consultationFee,
      paidAmount: 0,
      dueAmount: doc.consultationFee,
      status: 'UNPAID',
      paymentMode: 'CASH',
      date: data.date,
    };

    setAppointments([newAppointment, ...appointments]);
    setInvoices([newInvoice, ...invoices]);
    setActiveModal(null);

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Consultation Scheduled',
      message: `${newAppointment.patientName} scheduled with ${doc.name} for ${data.timeSlot} on ${data.date}.`,
      time: 'Just now',
      read: false,
      type: 'appointment',
    };
    setNotifications([newNotif, ...notifications]);

    triggerToast(
      `Appointment ${newAppointment.appointmentId} booked with ${doc.name}. Invoice ${newInvoice.invoiceNumber} generated.`
    );
  };

  // Register Patient
  const handleRegisterPatient = (patientData: Omit<Patient, 'id' | 'patientId'>) => {
    const newPatient: Patient = {
      id: patients.length + 1,
      patientId: `PAT-${8800 + patients.length + 1}`,
      ...patientData,
    };

    setPatients([newPatient, ...patients]);
    setActiveModal(null);
    triggerToast(
      `Patient ${newPatient.name} enrolled with record ID ${newPatient.patientId}.`
    );
  };

  // Register Doctor
  const handleRegisterDoctor = (doctorData: Omit<Doctor, 'id' | 'doctorId' | 'status'>) => {
    const newDoctor: Doctor = {
      id: doctors.length + 1,
      doctorId: `DOC-${1000 + doctors.length + 1}`,
      status: 'ACTIVE',
      ...doctorData,
    };

    setDoctors([newDoctor, ...doctors]);
    setActiveModal(null);
    triggerToast(
      `Dr. ${newDoctor.name} appointed to ${newDoctor.departmentName} department.`
    );
  };

  // Electronic Prescription (℞)
  const handleSavePrescription = (prescriptionData: {
    diagnosis: string;
    medicines: string;
    dosage: string;
    followUp: string;
    notes?: string;
  }) => {
    if (!selectedAppointment) return;

    const nowStr = new Date().toLocaleString();
    setAppointments(
      appointments.map((a) =>
        a.id === selectedAppointment.id
          ? {
              ...a,
              status: 'COMPLETED',
              prescription: {
                ...prescriptionData,
                prescribedAt: nowStr,
              },
            }
          : a
      )
    );

    setActiveModal(null);
    setSelectedAppointment(null);
    triggerToast(
      `Electronic prescription (℞) digitally signed for ${selectedAppointment.patientName}.`
    );
  };

  // Cancel Appointment
  const handleCancelAppointment = (id: number) => {
    setAppointments(
      appointments.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' } : a))
    );
    triggerToast('Appointment status marked as CANCELLED.', 'warning');
  };

  // Settle Invoice
  const handleSettleInvoice = (invoiceId: number) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              paidAmount: inv.totalAmount,
              dueAmount: 0,
              status: 'PAID',
              paymentMode: 'CARD',
            }
          : inv
      )
    );
    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice({
        ...selectedInvoice,
        paidAmount: selectedInvoice.totalAmount,
        dueAmount: 0,
        status: 'PAID',
        paymentMode: 'CARD',
      });
    }
    triggerToast('Invoice balance settled in full. Official receipt updated.');
  };

  // Handle Completed Registration after OTP Verification
  const handleRegistrationComplete = () => {
    if (!pendingRegistration) {
      setAuthScreen('login');
      return;
    }

    const newPatientId = `PAT-${8800 + patients.length + 1}`;
    const newPatient: Patient = {
      id: patients.length + 1,
      patientId: newPatientId,
      name: pendingRegistration.fullName,
      email: pendingRegistration.email,
      phone: pendingRegistration.phone,
      dob: pendingRegistration.dob,
      gender:
        pendingRegistration.gender === 'FEMALE'
          ? 'FEMALE'
          : pendingRegistration.gender === 'OTHER'
          ? 'OTHER'
          : 'MALE',
      bloodGroup: pendingRegistration.bloodGroup,
      address: pendingRegistration.address || 'Address on file',
      emergencyContact: pendingRegistration.phone,
    };

    setPatients([newPatient, ...patients]);

    const usernameKey = pendingRegistration.email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');

    setRegisteredAccounts((prev) => ({
      ...prev,
      [usernameKey]: {
        pass: pendingRegistration.password,
        user: {
          username: usernameKey,
          role: 'PATIENT',
          name: pendingRegistration.fullName,
          title: 'Verified Patient',
          email: pendingRegistration.email,
          patientId: newPatientId,
        },
      },
    }));

    setAuthSuccessToast('Account created successfully. Please sign in.');
    setAuthScreen('login');
  };

  // If user is not logged in, render Authentication Screens (Login, Register, Verify OTP)
  if (!currentUser) {
    if (authScreen === 'register') {
      return (
        <RegisterPage
          initialData={pendingRegistration || undefined}
          onProceedToOtp={(data) => {
            setPendingRegistration(data);
            setAuthScreen('verify_otp');
          }}
          onNavigateToLogin={() => setAuthScreen('login')}
        />
      );
    }

    if (authScreen === 'verify_otp') {
      return (
        <VerifyOtpPage
          email={pendingRegistration?.email || 'patient@example.com'}
          onChangeEmail={() => setAuthScreen('register')}
          onVerificationSuccess={handleRegistrationComplete}
        />
      );
    }

    return (
      <LoginPage
        onAuthenticate={handleLogin}
        onNavigateToRegister={() => {
          setAuthSuccessToast(null);
          setAuthScreen('register');
        }}
        mockAccounts={registeredAccounts}
        successMessage={authSuccessToast}
      />
    );
  }

  // Render the appropriate role dashboard based on currentUser.role
  const renderDashboardContent = () => {
    switch (currentUser.role) {
      case 'ADMIN':
        return (
          <AdminDashboard
            currentUser={currentUser}
            activeNav={activeNav}
            departments={departments}
            doctors={doctors}
            patients={patients}
            appointments={appointments}
            invoices={invoices}
            onOpenBookAppointment={() => setActiveModal('book_appointment')}
            onOpenRegisterPatient={() => setActiveModal('register_patient')}
            onOpenRegisterDoctor={() => setActiveModal('register_doctor')}
            onViewPrescription={(apt) => {
              setSelectedAppointment(apt);
              setActiveModal('view_prescription');
            }}
            onViewInvoice={(inv) => {
              setSelectedInvoice(inv);
              setActiveModal('view_invoice');
            }}
            onCancelAppointment={handleCancelAppointment}
            onSettleInvoice={handleSettleInvoice}
          />
        );

      case 'HR':
        return (
          <AdminDashboard
            currentUser={currentUser}
            activeNav={activeNav}
            departments={departments}
            doctors={doctors}
            patients={patients}
            appointments={appointments}
            invoices={invoices}
            onOpenBookAppointment={() => setActiveModal('book_appointment')}
            onOpenRegisterPatient={() => setActiveModal('register_patient')}
            onOpenRegisterDoctor={() => setActiveModal('register_doctor')}
            onViewPrescription={(apt) => {
              setSelectedAppointment(apt);
              setActiveModal('view_prescription');
            }}
            onViewInvoice={(inv) => {
              setSelectedInvoice(inv);
              setActiveModal('view_invoice');
            }}
            onCancelAppointment={handleCancelAppointment}
            onSettleInvoice={handleSettleInvoice}
          />
        );

      case 'DOCTOR': {
        const doctorProfile = doctors.find(
          (d) =>
            d.doctorId === currentUser.doctorId ||
            d.name.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[1] || '')
        );
        return (
          <DoctorDashboard
            currentUser={currentUser}
            activeNav={activeNav}
            doctorProfile={doctorProfile}
            appointments={appointments}
            patients={patients}
            onOpenWritePrescription={(apt) => {
              setSelectedAppointment(apt);
              setActiveModal('write_prescription');
            }}
            onViewPrescription={(apt) => {
              setSelectedAppointment(apt);
              setActiveModal('view_prescription');
            }}
            onOpenQuickBooking={() => setActiveModal('book_appointment')}
          />
        );
      }

      case 'PATIENT':
        return (
          <PatientDashboard
            currentUser={currentUser}
            activeNav={activeNav}
            appointments={appointments}
            invoices={invoices}
            onOpenBookAppointment={() => setActiveModal('book_appointment')}
            onViewPrescription={(apt) => {
              setSelectedAppointment(apt);
              setActiveModal('view_prescription');
            }}
            onViewInvoice={(inv) => {
              setSelectedInvoice(inv);
              setActiveModal('view_invoice');
            }}
            onSettleInvoice={handleSettleInvoice}
          />
        );

      case 'RECEPTIONIST':
        return (
          <ReceptionistDashboard
            currentUser={currentUser}
            activeNav={activeNav}
            appointments={appointments}
            patients={patients}
            invoices={invoices}
            onOpenBookAppointment={() => setActiveModal('book_appointment')}
            onOpenRegisterPatient={() => setActiveModal('register_patient')}
            onViewInvoice={(inv) => {
              setSelectedInvoice(inv);
              setActiveModal('view_invoice');
            }}
            onSettleInvoice={handleSettleInvoice}
          />
        );

      default:
        return (
          <NotFoundPage onReturnToDashboard={() => setActiveNav('dashboard')} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans antialiased">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[1070] bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="font-medium text-xs text-slate-200">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white ml-2 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navigation Bar: Single clean bar (white, 64px height, subtle border) */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenQuickBooking={() => setActiveModal('book_appointment')}
        onToggleSidebar={() => setIsMobileSidebarOpen(true)}
        notifications={notifications}
        onOpenProfile={() => setActiveModal('profile')}
        onOpenSettings={() => setActiveModal('settings')}
      />

      {/* Main Workspace Layout (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar
          currentRole={currentUser.role}
          currentUser={currentUser}
          activeNav={activeNav}
          onSelectNav={(navKey) => setActiveNav(navKey)}
          onLogout={handleLogout}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right Content Canvas */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderDashboardContent()}
          </main>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Schedule Appointment Modal */}
      {activeModal === 'book_appointment' && (
        <BookAppointmentModal
          doctors={doctors}
          currentUser={currentUser}
          onClose={() => setActiveModal(null)}
          onBook={handleBookAppointment}
        />
      )}

      {/* 2. Write Electronic Prescription Modal */}
      {activeModal === 'write_prescription' && selectedAppointment && (
        <PrescriptionModal
          appointment={selectedAppointment}
          onClose={() => {
            setActiveModal(null);
            setSelectedAppointment(null);
          }}
          onSave={handleSavePrescription}
        />
      )}

      {/* 3. View Prescription Details Modal */}
      {activeModal === 'view_prescription' && selectedAppointment && (
        <ViewPrescriptionModal
          appointment={selectedAppointment}
          onClose={() => {
            setActiveModal(null);
            setSelectedAppointment(null);
          }}
        />
      )}

      {/* 4. View Tax Invoice Modal */}
      {activeModal === 'view_invoice' && selectedInvoice && (
        <ViewInvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setActiveModal(null);
            setSelectedInvoice(null);
          }}
          onSettlePayment={handleSettleInvoice}
        />
      )}

      {/* 5. Register Patient Modal */}
      {activeModal === 'register_patient' && (
        <RegisterPatientModal
          onClose={() => setActiveModal(null)}
          onRegister={handleRegisterPatient}
        />
      )}

      {/* 6. Register Doctor Modal */}
      {activeModal === 'register_doctor' && (
        <RegisterDoctorModal
          departments={departments}
          onClose={() => setActiveModal(null)}
          onRegister={handleRegisterDoctor}
        />
      )}

      {/* 7. Profile Modal */}
      {activeModal === 'profile' && (
        <ProfileModal
          currentUser={currentUser}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* 8. Settings Modal */}
      {activeModal === 'settings' && (
        <SettingsModal
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
