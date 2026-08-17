from django.contrib import admin
from .models import FeePayment

@admin.register(FeePayment)
class FeePaymentAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'patient', 'appointment', 'total_amount', 'paid_amount', 'due_amount', 'payment_status', 'payment_date')
    list_filter = ('payment_status', 'payment_method', 'payment_date')
    search_fields = ('invoice_number', 'patient__user__first_name', 'patient__user__last_name', 'appointment__appointment_id')
