from django.db import models
from django.conf import settings
import random

def generate_patient_id():
    return f"PAT-{random.randint(1000, 9999)}"

class PatientProfile(models.Model):
    BLOOD_GROUPS = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-')
    ]

    GENDERS = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='patient_profile')
    patient_id = models.CharField(max_length=20, unique=True, default=generate_patient_id)
    gender = models.CharField(max_length=10, choices=GENDERS, default='M')
    date_of_birth = models.DateField(null=True, blank=True)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS, default='O+')
    emergency_contact = models.CharField(max_length=150, blank=True, null=True, help_text="Name and Phone number")
    medical_history_summary = models.TextField(blank=True, null=True, help_text="Allergies, chronic conditions, etc.")
    registration_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-registration_date']

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.patient_id})"

    @property
    def full_name(self):
        return self.user.get_full_name() or self.user.username

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
