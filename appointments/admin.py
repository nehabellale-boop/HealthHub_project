from django.contrib import admin
from .models import Appointment, Prescription

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('appointment_id', 'patient', 'doctor', 'appointment_date', 'appointment_time', 'status')
    list_filter = ('status', 'appointment_date', 'department')
    search_fields = ('appointment_id', 'patient__user__first_name', 'patient__user__last_name', 'doctor__user__first_name')

@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'appointment', 'created_at', 'follow_up_date')
    search_fields = ('patient__user__first_name', 'doctor__user__first_name', 'diagnosis')
