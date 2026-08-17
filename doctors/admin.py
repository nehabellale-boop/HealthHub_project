from django.contrib import admin
from .models import DoctorProfile

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('doctor_id', 'full_name', 'department', 'specialization', 'employment_status', 'availability_status', 'consultation_fee')
    list_filter = ('department', 'employment_status', 'availability_status')
    search_fields = ('doctor_id', 'user__first_name', 'user__last_name', 'specialization', 'user__email')
