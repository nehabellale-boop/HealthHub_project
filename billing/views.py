from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.db.models import Sum, Q
from django.core.mail import send_mail
from django.conf import settings
from accounts.models import User
from accounts.decorators import receptionist_required
from .models import FeePayment
from .forms import FeePaymentForm
from appointments.models import Appointment
from patients.models import PatientProfile

@login_required
def receptionist_dashboard_view(request):
    user = request.user
    if not (user.is_superuser or user.role in [User.Role.ADMIN, User.Role.RECEPTIONIST]):
        messages.error(request, "Access restricted to Receptionists and Administrators.")
        return redirect('dashboard_redirect')

    today = timezone.localdate()
    today_appointments = Appointment.objects.filter(
        appointment_date=today
    ).select_related('patient', 'patient__user', 'doctor', 'doctor__user', 'department').order_by('appointment_time')

    new_registrations = PatientProfile.objects.filter(
        registration_date__date=today
    ).select_related('user').order_by('-registration_date')

    pending_payments = FeePayment.objects.filter(
        payment_status__in=[FeePayment.PaymentStatus.UNPAID, FeePayment.PaymentStatus.PARTIALLY_PAID]
    ).select_related('patient', 'patient__user', 'appointment').order_by('-payment_date')[:6]

    recent_payments = FeePayment.objects.filter(
        payment_status=FeePayment.PaymentStatus.PAID
    ).select_related('patient', 'patient__user', 'appointment').order_by('-payment_date')[:6]

    context = {
        'today_appointments': today_appointments,
        'new_registrations': new_registrations,
        'pending_payments': pending_payments,
        'recent_payments': recent_payments,
        'today': today,
    }
    return render(request, 'billing/receptionist_dashboard.html', context)

@login_required
def payment_list_view(request):
    user = request.user
    query = request.GET.get('q', '')
    status_filter = request.GET.get('status', '')

    if user.role == User.Role.PATIENT:
        payments = FeePayment.objects.filter(patient=user.patient_profile)
    elif user.role in [User.Role.ADMIN, User.Role.RECEPTIONIST, User.Role.HR] or user.is_superuser:
        payments = FeePayment.objects.all()
    else:
        payments = FeePayment.objects.none()

    payments = payments.select_related('patient', 'patient__user', 'appointment', 'appointment__doctor')

    if query:
        payments = payments.filter(
            Q(invoice_number__icontains=query) |
            Q(patient__user__first_name__icontains=query) |
            Q(patient__user__last_name__icontains=query) |
            Q(appointment__appointment_id__icontains=query)
        )
    if status_filter:
        payments = payments.filter(payment_status=status_filter)

    total_collected = payments.filter(payment_status=FeePayment.PaymentStatus.PAID).aggregate(Sum('paid_amount'))['paid_amount__sum'] or 0
    total_outstanding = payments.filter(payment_status__in=[FeePayment.PaymentStatus.UNPAID, FeePayment.PaymentStatus.PARTIALLY_PAID]).aggregate(Sum('due_amount'))['due_amount__sum'] or 0

    return render(request, 'billing/payment_list.html', {
        'payments': payments,
        'query': query,
        'status_filter': status_filter,
        'status_choices': FeePayment.PaymentStatus.choices,
        'total_collected': total_collected,
        'total_outstanding': total_outstanding,
    })

@login_required
def payment_create_view(request):
    user = request.user
    if not (user.is_superuser or user.role in [User.Role.ADMIN, User.Role.RECEPTIONIST]):
        messages.error(request, "Permission denied.")
        return redirect('dashboard_redirect')

    appointment_id = request.GET.get('appointment')
    initial_data = {}
    if appointment_id:
        try:
            appt = Appointment.objects.get(pk=appointment_id)
            initial_data['appointment'] = appt
            initial_data['total_amount'] = appt.doctor.consultation_fee
        except Appointment.DoesNotExist:
            pass

    if request.method == 'POST':
        form = FeePaymentForm(request.POST)
        if form.is_valid():
            payment = form.save(commit=False)
            payment.patient = payment.appointment.patient
            payment.created_by = user
            payment.save()
            messages.success(request, f"Invoice {payment.invoice_number} created successfully!")
            return redirect('invoice_detail', pk=payment.pk)
    else:
        form = FeePaymentForm(initial=initial_data)

    return render(request, 'billing/payment_form.html', {'form': form, 'title': 'Create New Invoice & Fee Record'})

@login_required
def payment_update_view(request, pk):
    user = request.user
    if not (user.is_superuser or user.role in [User.Role.ADMIN, User.Role.RECEPTIONIST]):
        messages.error(request, "Permission denied.")
        return redirect('dashboard_redirect')

    payment = get_object_or_404(FeePayment, pk=pk)
    if request.method == 'POST':
        form = FeePaymentForm(request.POST, instance=payment)
        if form.is_valid():
            payment = form.save()
            messages.success(request, f"Invoice {payment.invoice_number} updated successfully.")
            return redirect('invoice_detail', pk=payment.pk)
    else:
        form = FeePaymentForm(instance=payment)

    return render(request, 'billing/payment_form.html', {'form': form, 'title': f'Update Payment - {payment.invoice_number}'})

@login_required
def invoice_detail_view(request, pk):
    payment = get_object_or_404(
        FeePayment.objects.select_related('patient', 'patient__user', 'appointment', 'appointment__doctor', 'appointment__doctor__department', 'created_by'),
        pk=pk
    )
    user = request.user

    # Object-level check: Patient can only view their own invoice
    if user.role == User.Role.PATIENT and payment.patient != user.patient_profile:
        messages.error(request, "Access denied: You cannot view another patient's invoice.")
        return redirect('patient_dashboard')

    return render(request, 'billing/invoice_detail.html', {
        'payment': payment,
        'hospital_name': getattr(settings, 'HOSPITAL_NAME', 'St. Jude Healthcare & Research Hospital'),
    })

@login_required
def outstanding_fees_view(request):
    user = request.user
    if not (user.is_superuser or user.role in [User.Role.ADMIN, User.Role.RECEPTIONIST, User.Role.HR]):
        messages.error(request, "Access restricted to hospital staff.")
        return redirect('dashboard_redirect')

    unpaid_payments = FeePayment.objects.filter(
        payment_status__in=[FeePayment.PaymentStatus.UNPAID, FeePayment.PaymentStatus.PARTIALLY_PAID]
    ).select_related('patient', 'patient__user', 'appointment', 'appointment__doctor')

    total_due = unpaid_payments.aggregate(Sum('due_amount'))['due_amount__sum'] or 0

    return render(request, 'billing/outstanding_fees.html', {
        'unpaid_payments': unpaid_payments,
        'total_due': total_due,
    })

@login_required
def send_single_reminder_view(request, pk):
    user = request.user
    if not (user.is_superuser or user.role in [User.Role.ADMIN, User.Role.RECEPTIONIST]):
        messages.error(request, "Permission denied.")
        return redirect('outstanding_fees')

    payment = get_object_or_404(FeePayment, pk=pk)
    if payment.patient.user.email:
        subject = f"Friendly Reminder: Outstanding Medical Fee for Invoice {payment.invoice_number}"
        message = (
            f"Dear {payment.patient.full_name},\n\n"
            f"This is a gentle reminder from {settings.HOSPITAL_NAME} regarding invoice {payment.invoice_number}.\n\n"
            f"Appointment Date: {payment.appointment.appointment_date}\n"
            f"Consulting Doctor: {payment.appointment.doctor.full_name}\n"
            f"Total Amount: ${payment.total_amount}\n"
            f"Amount Paid: ${payment.paid_amount}\n"
            f"Outstanding Due: ${payment.due_amount}\n\n"
            f"Please settle the outstanding balance at our hospital reception desk or through our online patient portal.\n\n"
            f"Thank you for choosing {settings.HOSPITAL_NAME}.\n"
            f"Billing Department"
        )
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [payment.patient.user.email])
        payment.last_reminder_sent = timezone.now()
        payment.save(update_fields=['last_reminder_sent'])
        messages.success(request, f"Fee reminder email dispatched to {payment.patient.email} for invoice {payment.invoice_number}.")
    else:
        messages.warning(request, f"Patient {payment.patient.full_name} does not have a registered email address.")

    return redirect('outstanding_fees')
