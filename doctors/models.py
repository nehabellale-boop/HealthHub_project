from django.db import models
from django.conf import settings
from core.models import Department
import random

def generate_doctor_id():
    return f"DOC-{random.randint(1000, 9999)}"

class DoctorProfile(models.Model):
    class EmploymentStatus(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        ON_LEAVE = 'ON_LEAVE', 'On Leave'
        RESIGNED = 'RESIGNED', 'Resigned'
        INACTIVE = 'INACTIVE', 'Inactive'

    class AvailabilityStatus(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        BUSY = 'BUSY', 'In Consultation'
        OFF_DUTY = 'OFF_DUTY', 'Off Duty'

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_profile')
    doctor_id = models.CharField(max_length=20, unique=True, default=generate_doctor_id)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='doctors')
    specialization = models.CharField(max_length=150)
    qualification = models.CharField(max_length=150, help_text="e.g. MBBS, MD, MS, FRCS")
    experience_years = models.PositiveIntegerField(default=1, help_text="Years of clinical experience")
    joining_date = models.DateField(null=True, blank=True)
    employment_status = models.CharField(
        max_length=20,
        choices=EmploymentStatus.choices,
        default=EmploymentStatus.ACTIVE
    )
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    availability_status = models.CharField(
        max_length=20,
        choices=AvailabilityStatus.choices,
        default=AvailabilityStatus.AVAILABLE
    )
    gender = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], default='M')
    date_of_birth = models.DateField(null=True, blank=True)
    bio = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['user__first_name', 'user__last_name']

    def __str__(self):
        return f"Dr. {self.user.get_full_name() or self.user.username} ({self.specialization})"

    @property
    def full_name(self):
        return f"Dr. {self.user.get_full_name() or self.user.username}"

    @property
    def email(self):
        return self.user.email

    @property
    def phone_number(self):
        return self.user.phone_number

    @property
    def address(self):
        return self.user.address

    @property
    def profile_image(self):
        return self.user.profile_image
