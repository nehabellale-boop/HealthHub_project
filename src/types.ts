export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'RECEPTIONIST' | 'HR';

export interface UserAccount {
  username: string;
  role: Role;
  name: string;
  title: string;
  email: string;
  avatarUrl?: string;
  department?: string;
  specialization?: string;
  patientId?: string;
  doctorId?: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  iconName: string;
  headDoctor: string;
  activeDoctorsCount: number;
  totalAppointments: number;
}

export interface Doctor {
  id: number;
  doctorId: string;
  name: string;
  departmentId: number;
  departmentName: string;
  specialization: string;
  qualification: string;
  consultationFee: number;
  experienceYears: number;
  availableDays: string;
  availableTime: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
  email: string;
  phone: string;
  bio: string;
  rating?: number;
  roomNumber?: string;
}

export interface Patient {
  id: number;
  patientId: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  allergies?: string;
  insuranceProvider?: string;
  insuranceId?: string;
}

export interface PrescriptionData {
  diagnosis: string;
  medicines: string;
  dosage: string;
  followUp: string;
  notes?: string;
  prescribedAt?: string;
}

export interface Appointment {
  id: number;
  appointmentId: string;
  patientId: number;
  patientName: string;
  patientGender?: string;
  doctorId: number;
  doctorName: string;
  departmentName: string;
  date: string;
  timeSlot: string;
  symptoms: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  prescription?: PrescriptionData;
  vitals?: {
    bloodPressure?: string;
    pulseRate?: string;
    temperature?: string;
    weight?: string;
  };
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  appointmentId: number;
  patientName: string;
  doctorName: string;
  departmentName?: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID';
  paymentMode: 'CASH' | 'CARD' | 'ONLINE' | 'INSURANCE';
  date: string;
  lastReminderSent?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'appointment' | 'billing' | 'system' | 'clinical';
}
