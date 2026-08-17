import React, { useState } from 'react';
import { X, Code2, Copy, Check, FileCode } from 'lucide-react';

interface CodeInspectorModalProps {
  onClose: () => void;
}

export const CodeInspectorModal: React.FC<CodeInspectorModalProps> = ({ onClose }) => {
  const [activeFile, setActiveFile] = useState<'models.py' | 'views.py' | 'settings.py' | 'admin.py'>('models.py');
  const [copied, setCopied] = useState(false);

  const files: Record<string, { desc: string; code: string }> = {
    'models.py': {
      desc: 'Django ORM Models: AbstractUser Role RBAC, DoctorProfile, PatientProfile, Department, Appointment, Prescription, FeePayment',
      code: `from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        DOCTOR = 'DOCTOR', 'Doctor'
        PATIENT = 'PATIENT', 'Patient'
        RECEPTIONIST = 'RECEPTIONIST', 'Receptionist'
        HR = 'HR', 'HR Staff'
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PATIENT)

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    head_doctor = models.CharField(max_length=150)

class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    doctor_id = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name='doctors')
    specialization = models.CharField(max_length=100)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=120.00)
    status = models.CharField(max_length=20, default='ACTIVE')

class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    patient_id = models.CharField(max_length=20, unique=True)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10)
    blood_group = models.CharField(max_length=5)
    phone = models.CharField(max_length=20)

class Appointment(models.Model):
    appointment_id = models.CharField(max_length=30, unique=True)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    appointment_time = models.CharField(max_length=20)
    symptoms = models.TextField()
    status = models.CharField(max_length=20, default='CONFIRMED')

class Prescription(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='prescription')
    diagnosis = models.TextField()
    prescription_medicines = models.TextField()
    dosage_instructions = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)

class FeePayment(models.Model):
    invoice_number = models.CharField(max_length=30, unique=True)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='fee_payment')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    due_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, default='UNPAID')`,
    },
    'views.py': {
      desc: 'Django Class-Based Views & Security Decorators: RBAC Verification, Clinical Consultations, Rx Signatures',
      code: `from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from .models import Appointment, Prescription, FeePayment

def role_required(allowed_roles=[]):
    def decorator(view_func):
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('login')
            if request.user.role not in allowed_roles and not request.user.is_superuser:
                raise PermissionDenied("User role not authorized.")
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator

@role_required(allowed_roles=['DOCTOR'])
def doctor_sign_prescription_view(request, appointment_id):
    appointment = get_object_or_404(Appointment, pk=appointment_id)
    if appointment.doctor.user != request.user:
        raise PermissionDenied("Cannot modify other physicians' appointments.")

    if request.method == 'POST':
        form = PrescriptionForm(request.POST)
        if form.is_valid():
            rx = form.save(commit=False)
            rx.appointment = appointment
            rx.save()
            appointment.status = 'COMPLETED'
            appointment.save(update_fields=['status'])
            return redirect('doctor_dashboard')
    return render(request, 'appointments/prescription_pad.html', {'appointment': appointment})`,
    },
    'settings.py': {
      desc: 'Django 3.2+ Architecture Settings, SQLite3 Database Engine, Installed Apps & Auth Model',
      code: `INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Clinical Micro-apps
    'core',
    'accounts',
    'specialists',
    'patients',
    'appointments',
    'billing',
    'hr',
]

AUTH_USER_MODEL = 'accounts.User'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'dashboard_redirect'
HOSPITAL_NAME = 'HealthHub Healthcare & Research Hospital'`,
    },
    'admin.py': {
      desc: 'Django Admin Customization: Inline Invoices, Search Fields, Filter Specifications',
      code: `from django.contrib import admin
from .models import User, Department, DoctorProfile, PatientProfile, Appointment, Prescription, FeePayment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('appointment_id', 'patient', 'doctor', 'appointment_date', 'status')
    list_filter = ('status', 'appointment_date', 'doctor__department')
    search_fields = ('appointment_id', 'patient__user__first_name', 'doctor__user__first_name')

@admin.register(FeePayment)
class FeePaymentAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'appointment', 'total_amount', 'paid_amount', 'payment_status')
    list_filter = ('payment_status', 'payment_mode')`,
    },
  };

  const copyCode = () => {
    navigator.clipboard.writeText(files[activeFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1055] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-950 text-slate-100 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-800 animate-in fade-in my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Django Backend Architecture</h3>
              <p className="text-[11px] text-slate-400">Production MVT Schema, Models, and RBAC Decorators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center justify-between mt-4 mb-3">
          <div className="flex gap-1.5 overflow-x-auto">
            {Object.keys(files).map((fname) => (
              <button
                key={fname}
                onClick={() => setActiveFile(fname as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  activeFile === fname
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {fname}
              </button>
            ))}
          </div>
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-2 italic">{files[activeFile].desc}</p>

        {/* Code View */}
        <pre className="bg-slate-900/90 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 border border-slate-800/80 leading-relaxed">
          {files[activeFile].code}
        </pre>

        <div className="flex justify-end pt-4 border-t border-slate-800 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
