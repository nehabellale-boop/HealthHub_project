from django.contrib import admin
from .models import PatientProfile

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('patient_id', 'full_name', 'gender', 'blood_group', 'phone_number', 'registration_date')
    search_fields = ('patient_id', 'user__first_name', 'user__last_name', 'user__phone_number', 'user__email')
    list_filter = ('blood_group', 'gender')
