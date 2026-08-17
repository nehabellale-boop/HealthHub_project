from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from billing.models import FeePayment

class Command(BaseCommand):
    help = 'Identifies patients with Unpaid or Partially Paid fees and dispatches email payment reminders.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Scanning database for outstanding fee records..."))

        outstanding_records = FeePayment.objects.filter(
            payment_status__in=[FeePayment.PaymentStatus.UNPAID, FeePayment.PaymentStatus.PARTIALLY_PAID]
        ).select_related('patient', 'patient__user', 'appointment', 'appointment__doctor')

        count = outstanding_records.count()
        if count == 0:
            self.stdout.write(self.style.SUCCESS("No outstanding fee records found. All invoices are settled!"))
            return

        sent_count = 0
        skipped_count = 0

        for payment in outstanding_records:
            patient_email = payment.patient.user.email
            if not patient_email:
                self.stdout.write(self.style.WARNING(f"Skipping {payment.patient.full_name} ({payment.invoice_number}) - No email address on file."))
                skipped_count += 1
                continue

            subject = f"Friendly Reminder: Outstanding Medical Invoice {payment.invoice_number}"
            body = (
                f"Dear {payment.patient.full_name},\n\n"
                f"We hope this email finds you in good health.\n\n"
                f"This is a gentle reminder from {settings.HOSPITAL_NAME} regarding your outstanding medical consultation balance.\n\n"
                f"-----------------------------------------\n"
                f"Invoice Number : {payment.invoice_number}\n"
                f"Appointment Ref: {payment.appointment.appointment_id}\n"
                f"Consulting Doc : {payment.appointment.doctor.full_name}\n"
                f"Total Amount   : ${payment.total_amount:.2f}\n"
                f"Amount Paid    : ${payment.paid_amount:.2f}\n"
                f"Outstanding Due: ${payment.due_amount:.2f}\n"
                f"-----------------------------------------\n\n"
                f"Please settle this payment at your earliest convenience via the hospital online portal or at our billing desk.\n\n"
                f"Thank you,\n"
                f"Billing & Accounts Department\n"
                f"{settings.HOSPITAL_NAME}"
            )

            try:
                send_mail(
                    subject=subject,
                    message=body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[patient_email],
                    fail_silently=False
                )
                payment.last_reminder_sent = timezone.now()
                payment.save(update_fields=['last_reminder_sent'])
                self.stdout.write(self.style.SUCCESS(f"✓ Sent reminder for invoice {payment.invoice_number} to {patient_email}"))
                sent_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"✗ Failed sending to {patient_email}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"\nCompleted: {sent_count} reminders dispatched, {skipped_count} skipped."))
