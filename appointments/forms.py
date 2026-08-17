from django import forms
from django.utils import timezone
from .models import Appointment, Prescription
from doctors.models import DoctorProfile
from patients.models import PatientProfile
from core.models import Department

class PatientAppointmentBookingForm(forms.ModelForm):
    department = forms.ModelChoiceField(
        queryset=Department.objects.all(),
        widget=forms.Select(attrs={'class': 'form-select', 'id': 'id_department'}),
        required=True
    )
    doctor = forms.ModelChoiceField(
        queryset=DoctorProfile.objects.filter(employment_status=DoctorProfile.EmploymentStatus.ACTIVE),
        widget=forms.Select(attrs={'class': 'form-select', 'id': 'id_doctor'}),
        required=True
    )
    appointment_date = forms.DateField(
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date', 'min': timezone.localdate().isoformat()}),
        required=True
    )
    appointment_time = forms.ChoiceField(
        choices=Appointment.TIME_SLOTS,
        widget=forms.Select(attrs={'class': 'form-select'}),
        required=True
    )
    symptoms = forms.CharField(
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Describe your symptoms, main complaint, or reason for appointment...'}),
        required=True
    )

    class Meta:
        model = Appointment
        fields = ['department', 'doctor', 'appointment_date', 'appointment_time', 'symptoms']

class StaffAppointmentBookingForm(forms.ModelForm):
    patient = forms.ModelChoiceField(
        queryset=PatientProfile.objects.all(),
        widget=forms.Select(attrs={'class': 'form-select'}),
        required=True
    )
    department = forms.ModelChoiceField(
        queryset=Department.objects.all(),
        widget=forms.Select(attrs={'class': 'form-select'}),
        required=True
    )
    doctor = forms.ModelChoiceField(
        queryset=DoctorProfile.objects.filter(employment_status=DoctorProfile.EmploymentStatus.ACTIVE),
        widget=forms.Select(attrs={'class': 'form-select'}),
        required=True
    )
    appointment_date = forms.DateField(
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
        required=True
    )
    appointment_time = forms.ChoiceField(
        choices=Appointment.TIME_SLOTS,
        widget=forms.Select(attrs={'class': 'form-select'}),
        required=True
    )
    status = forms.ChoiceField(
        choices=Appointment.Status.choices,
        widget=forms.Select(attrs={'class': 'form-select'}),
        initial=Appointment.Status.CONFIRMED
    )
    symptoms = forms.CharField(
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Patient symptoms or consultation reason...'}),
        required=True
    )

    class Meta:
        model = Appointment
        fields = ['patient', 'department', 'doctor', 'appointment_date', 'appointment_time', 'status', 'symptoms']

class PrescriptionForm(forms.ModelForm):
    class Meta:
        model = Prescription
        fields = ['diagnosis', 'prescription_medicines', 'dosage_instructions', 'treatment_notes', 'follow_up_date']
        widgets = {
            'diagnosis': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Clinical diagnosis (e.g. Acute Pharyngitis, Type II Diabetes mellitus)'}),
            'prescription_medicines': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': '1. Amoxicillin 500mg - 1 capsule TID for 7 days\n2. Paracetamol 650mg - 1 tab SOS'}),
            'dosage_instructions': forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Take with warm water after meals. Maintain adequate hydration.'}),
            'treatment_notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Patient vitals BP: 120/80, SpO2: 99%, recommended complete rest.'}),
            'follow_up_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
        }
