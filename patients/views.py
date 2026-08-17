from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.db.models import Q
from accounts.decorators import patient_required, admin_required, receptionist_required
from accounts.models import User
from .models import PatientProfile
from .forms import PatientCreationByStaffForm, PatientProfileUpdateForm

@patient_required
def patient_dashboard_view(request):
    patient = getattr(request.user, 'patient_profile', None)
    if not patient:
        messages.error(request, "Patient profile not found.")
        return redirect('home')

    today = timezone.localdate()
    from appointments.models import Appointment, Prescription
    from billing.models import FeePayment

    upcoming_appointments = Appointment.objects.filter(
        patient=patient,
        appointment_date__gte=today,
        status__in=[Appointment.Status.PENDING, Appointment.Status.CONFIRMED]
    ).select_related('doctor', 'doctor__user', 'doctor__department').order_by('appointment_date', 'appointment_time')

    past_appointments = Appointment.objects.filter(
        patient=patient,
        appointment_date__lt=today
    ).select_related('doctor', 'doctor__user', 'doctor__department').order_by('-appointment_date')[:5]

    recent_prescriptions = Prescription.objects.filter(
        patient=patient
    ).select_related('doctor', 'doctor__user', 'appointment').order_by('-created_at')[:5]

    fee_payments = FeePayment.objects.filter(
        patient=patient
    ).select_related('appointment', 'appointment__doctor').order_by('-payment_date')[:5]

    context = {
        'patient': patient,
        'upcoming_appointments': upcoming_appointments,
        'past_appointments': past_appointments,
        'recent_prescriptions': recent_prescriptions,
        'fee_payments': fee_payments,
    }
    return render(request, 'patients/dashboard.html', context)

@patient_required
def patient_my_profile_view(request):
    patient = request.user.patient_profile
    if request.method == 'POST':
        form = PatientProfileUpdateForm(request.POST, request.FILES, instance=patient)
        if form.is_valid():
            form.save()
            messages.success(request, "Your medical profile has been updated.")
            return redirect('patient_my_profile')
    else:
        form = PatientProfileUpdateForm(instance=patient)
    return render(request, 'patients/profile_edit.html', {'form': form, 'patient': patient})

# Staff views (Receptionist / Admin)
@login_required
def patient_list_view(request):
    user = request.user
    if not (user.is_superuser or user.role in [User.Role.ADMIN, User.Role.RECEPTIONIST]):
        messages.error(request, "You do not have permission to view patient directory.")
        return redirect('dashboard_redirect')

    query = request.GET.get('q', '')
    patients = PatientProfile.objects.select_related('user').all()
    if query:
        patients = patients.filter(
            Q(user__first_name__icontains=query) |
            Q(user__last_name__icontains=query) |
            Q(patient_id__icontains=query) |
            Q(user__phone_number__icontains=query) |
            Q(user__email__icontains=query)
        )
    return render(request, 'patients/patient_list.html', {'patients': patients, 'query': query})

@login_required
def patient_detail_view(request, pk):
    user = request.user
    patient = get_object_or_404(PatientProfile.objects.select_related('user'), pk=pk)

    # Object-level check: Patients can only view themselves
    if user.role == User.Role.PATIENT and user.patient_profile.id != patient.id:
        messages.error(request, "Access denied: You cannot view another patient's medical records.")
        return redirect('patient_dashboard')

    from appointments.models import Appointment, Prescription
    from billing.models import FeePayment

    appointments = Appointment.objects.filter(patient=patient).select_related('doctor', 'doctor__user', 'doctor__department').order_by('-appointment_date')
    prescriptions = Prescription.objects.filter(patient=patient).select_related('doctor', 'doctor__user').order_by('-created_at')
    payments = FeePayment.objects.filter(patient=patient).select_related('appointment').order_by('-payment_date')

    return render(request, 'patients/patient_detail.html', {
        'patient': patient,
        'appointments': appointments,
        'prescriptions': prescriptions,
        'payments': payments,
    })

@login_required
def patient_create_by_staff_view(request):
    user = request.user
    if not (user.is_superuser or user.role in [User.Role.ADMIN, User.Role.RECEPTIONIST]):
        messages.error(request, "Access restricted to Receptionist and Admin.")
        return redirect('dashboard_redirect')

    if request.method == 'POST':
        form = PatientCreationByStaffForm(request.POST)
        if form.is_valid():
            patient = form.save()
            messages.success(request, f"Patient {patient.full_name} registered successfully with ID {patient.patient_id}.")
            return redirect('patient_detail', pk=patient.pk)
    else:
        form = PatientCreationByStaffForm()
    return render(request, 'patients/patient_form.html', {'form': form, 'title': 'Register New Patient'})

@admin_required
def patient_delete_view(request, pk):
    patient = get_object_or_404(PatientProfile, pk=pk)
    if request.method == 'POST':
        name = patient.full_name
        user = patient.user
        patient.delete()
        user.delete()
        messages.success(request, f"Patient record for {name} has been removed.")
        return redirect('patient_list')
    return render(request, 'patients/confirm_delete.html', {'patient': patient})
