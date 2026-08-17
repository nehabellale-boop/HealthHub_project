from django.db import models
from django.conf import settings
from django.utils import timezone
from patients.models import PatientProfile
from appointments.models import Appointment
import random

def generate_invoice_number():
    year = timezone.localdate().year
    num = random.randint(10000, 99999)
    return f"INV-{year}-{num}"

class FeePayment(models.Model):
    class PaymentStatus(models.TextChoices):
        PAID = 'PAID', 'Paid'
        PARTIALLY_PAID = 'PARTIALLY_PAID', 'Partially Paid'
        UNPAID = 'UNPAID', 'Unpaid'

    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', 'Cash'
        CARD = 'CARD', 'Credit / Debit Card'
        UPI = 'UPI', 'UPI / Digital Wallet'
        INSURANCE = 'INSURANCE', 'Health Insurance'
        OTHER = 'OTHER', 'Other'

    invoice_number = models.CharField(max_length=30, unique=True, default=generate_invoice_number)
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='fee_payments')
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='fee_payment')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    due_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CASH)
    payment_date = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='recorded_payments')
    notes = models.TextField(blank=True, null=True, help_text="Additional billing notes or discount details")
    last_reminder_sent = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-payment_date']

    def calculate_due_and_status(self):
        self.due_amount = max(self.total_amount - self.paid_amount, 0)
        if self.paid_amount >= self.total_amount and self.total_amount > 0:
            self.payment_status = self.PaymentStatus.PAID
        elif self.paid_amount > 0 and self.paid_amount < self.total_amount:
            self.payment_status = self.PaymentStatus.PARTIALLY_PAID
        else:
            self.payment_status = self.PaymentStatus.UNPAID

    def save(self, *args, **kwargs):
        if not self.total_amount and self.appointment and self.appointment.doctor:
            self.total_amount = self.appointment.doctor.consultation_fee
        self.calculate_due_and_status()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice_number} - {self.patient.full_name} (${self.paid_amount}/${self.total_amount})"
