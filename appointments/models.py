from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from core.models import Department
from doctors.models import DoctorProfile
from patients.models import PatientProfile
import random

def generate_appointment_id():
    return f"APT-{random.randint(10000, 99999)}"

class Appointment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Approval'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    TIME_SLOTS = [
        ('09:00', '09:00 AM'),
        ('09:30', '09:30 AM'),
        ('10:00', '10:00 AM'),
        ('10:30', '10:30 AM'),
        ('11:00', '11:00 AM'),
        ('11:30', '11:30 AM'),
        ('12:00', '12:00 PM'),
        ('14:00', '02:00 PM'),
        ('14:30', '02:30 PM'),
        ('15:00', '03:00 PM'),
        ('15:30', '03:30 PM'),
        ('16:00', '04:00 PM'),
        ('16:30', '04:30 PM'),
        ('17:00', '05:00 PM'),
    ]

    appointment_id = models.CharField(max_length=20, unique=True, default=generate_appointment_id)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='appointments')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    appointment_time = models.CharField(max_length=10, choices=TIME_SLOTS)
    symptoms = models.TextField(help_text="Reason for visit or symptoms described by patient")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['appointment_date', 'appointment_time']
        constraints = [
            models.UniqueConstraint(
                fields=['doctor', 'appointment_date', 'appointment_time'],
                condition=~models.Q(status='CANCELLED'),
                name='unique_doctor_appointment_slot'
            )
        ]

    def clean(self):
        super().clean()
        # Rule 1: No past date
        if self.appointment_date and self.appointment_date < timezone.localdate():
            raise ValidationError({'appointment_date': "Cannot schedule appointments in the past."})

        # Rule 2: Doctor conflict check
        if self.doctor_id and self.appointment_date and self.appointment_time:
            conflicts = Appointment.objects.filter(
                doctor=self.doctor,
                appointment_date=self.appointment_date,
                appointment_time=self.appointment_time
            ).exclude(status=self.Status.CANCELLED)

            if self.pk:
                conflicts = conflicts.exclude(pk=self.pk)

            if conflicts.exists():
                raise ValidationError(
                    f"Dr. {self.doctor.full_name} is already booked at {self.get_appointment_time_display()} on {self.appointment_date}. Please choose another time slot."
                )

        # Rule 3: Patient double booking
        if self.patient_id and self.doctor_id and self.appointment_date and self.appointment_time:
            pat_conflicts = Appointment.objects.filter(
                patient=self.patient,
                doctor=self.doctor,
                appointment_date=self.appointment_date,
                appointment_time=self.appointment_time
            ).exclude(status=self.Status.CANCELLED)

            if self.pk:
                pat_conflicts = pat_conflicts.exclude(pk=self.pk)

            if pat_conflicts.exists():
                raise ValidationError("You already have an appointment booked with this doctor at this exact time.")

    def save(self, *args, **kwargs):
        if not self.department_id and self.doctor_id and self.doctor.department_id:
            self.department = self.doctor.department
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.appointment_id} - {self.patient.full_name} with {self.doctor.full_name} on {self.appointment_date}"

class Prescription(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='prescription')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='prescriptions')
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='prescriptions')
    diagnosis = models.TextField(help_text="Primary clinical diagnosis and findings")
    prescription_medicines = models.TextField(help_text="Prescribed drugs, dosage, frequency, and duration")
    dosage_instructions = models.TextField(blank=True, null=True, help_text="Special instructions (e.g. after meals, avoid driving)")
    treatment_notes = models.TextField(blank=True, null=True, help_text="Doctor internal clinical observations & treatment plan")
    follow_up_date = models.DateField(blank=True, null=True, help_text="Suggested follow-up consultation date")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Prescription for {self.patient.full_name} by {self.doctor.full_name} ({self.created_at.strftime('%Y-%m-%d')})"
