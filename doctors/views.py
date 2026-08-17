from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.db.models import Q, Sum
from accounts.decorators import doctor_required, admin_required
from .models import DoctorProfile
from .forms import DoctorCreationForm, DoctorProfileUpdateForm
from core.models import Department

def doctor_list_public_view(request):
    dept_id = request.GET.get('department')
    query = request.GET.get('q', '')
    
    doctors = DoctorProfile.objects.filter(employment_status=DoctorProfile.EmploymentStatus.ACTIVE).select_related('user', 'department')
    
    if dept_id:
        doctors = doctors.filter(department_id=dept_id)
    if query:
        doctors = doctors.filter(
            Q(user__first_name__icontains=query) |
            Q(user__last_name__icontains=query) |
            Q(specialization__icontains=query) |
            Q(qualification__icontains=query)
        )
        
    departments = Department.objects.all()
    return render(request, 'doctors/doctor_list.html', {
        'doctors': doctors,
        'departments': departments,
        'selected_dept': dept_id,
        'query': query,
    })

def doctor_detail_view(request, pk):
    doctor = get_object_or_404(DoctorProfile.objects.select_related('user', 'department'), pk=pk)
    return render(request, 'doctors/doctor_detail.html', {'doctor': doctor})

@doctor_required
def doctor_dashboard_view(request):
    doctor = getattr(request.user, 'doctor_profile', None)
    if not doctor:
        messages.error(request, "Doctor profile not found for your user account.")
        return redirect('home')

    today = timezone.localdate()
    
    # Appointments assigned to this doctor ONLY
    from appointments.models import Appointment
    from billing.models import FeePayment

    today_appointments = Appointment.objects.filter(
        doctor=doctor, appointment_date=today
    ).select_related('patient', 'patient__user').order_by('appointment_time')

    pending_appointments = Appointment.objects.filter(
        doctor=doctor, status=Appointment.Status.PENDING
    ).select_related('patient', 'patient__user').order_by('appointment_date', 'appointment_time')

    completed_appointments = Appointment.objects.filter(
        doctor=doctor, status=Appointment.Status.COMPLETED
    ).count()

    upcoming_appointments = Appointment.objects.filter(
        doctor=doctor, appointment_date__gt=today
    ).select_related('patient', 'patient__user').order_by('appointment_date', 'appointment_time')[:5]

    # Consultation & Payment Summary for this doctor
    total_consultations = Appointment.objects.filter(doctor=doctor, status=Appointment.Status.COMPLETED).count()
    doctor_payments = FeePayment.objects.filter(appointment__doctor=doctor).aggregate(total=Sum('paid_amount'))['total'] or 0

    context = {
        'doctor': doctor,
        'today_appointments': today_appointments,
        'pending_appointments': pending_appointments,
        'completed_count': completed_appointments,
        'upcoming_appointments': upcoming_appointments,
        'total_consultations': total_consultations,
        'total_earnings_recorded': doctor_payments,
        'today': today,
    }
    return render(request, 'doctors/dashboard.html', context)

@doctor_required
def doctor_my_profile_update_view(request):
    doctor = request.user.doctor_profile
    if request.method == 'POST':
        form = DoctorProfileUpdateForm(request.POST, request.FILES, instance=doctor)
        if form.is_valid():
            form.save()
            messages.success(request, "Your doctor profile details have been successfully updated.")
            return redirect('doctor_dashboard')
    else:
        form = DoctorProfileUpdateForm(instance=doctor)
    return render(request, 'doctors/profile_edit.html', {'form': form, 'doctor': doctor})

@doctor_required
def doctor_assigned_patients_view(request):
    doctor = request.user.doctor_profile
    from appointments.models import Appointment
    # Unique patients assigned to this doctor
    appointments = Appointment.objects.filter(doctor=doctor).select_related('patient', 'patient__user').order_by('-appointment_date')
    
    seen_patients = {}
    for appt in appointments:
        if appt.patient.id not in seen_patients:
            seen_patients[appt.patient.id] = {
                'patient': appt.patient,
                'last_visit': appt.appointment_date,
                'last_status': appt.get_status_display(),
                'appointment_id': appt.id
            }

    return render(request, 'doctors/assigned_patients.html', {
        'patient_records': seen_patients.values(),
        'doctor': doctor
    })

# Admin Doctor Management
@admin_required
def admin_doctor_create_view(request):
    if request.method == 'POST':
        form = DoctorCreationForm(request.POST)
        if form.is_valid():
            doctor = form.save()
            messages.success(request, f"Doctor record for Dr. {doctor.user.get_full_name()} created successfully.")
            return redirect('doctor_list_admin')
    else:
        form = DoctorCreationForm()
    return render(request, 'doctors/admin_doctor_form.html', {'form': form, 'title': 'Register New Doctor'})

@admin_required
def admin_doctor_list_view(request):
    query = request.GET.get('q', '')
    doctors = DoctorProfile.objects.select_related('user', 'department').all()
    if query:
        doctors = doctors.filter(
            Q(user__first_name__icontains=query) |
            Q(user__last_name__icontains=query) |
            Q(doctor_id__icontains=query) |
            Q(specialization__icontains=query)
        )
    return render(request, 'doctors/admin_doctor_list.html', {'doctors': doctors, 'query': query})

@admin_required
def admin_doctor_delete_view(request, pk):
    doctor = get_object_or_404(DoctorProfile, pk=pk)
    if request.method == 'POST':
        name = doctor.full_name
        user = doctor.user
        doctor.delete()
        user.delete()
        messages.success(request, f"Doctor record for {name} has been permanently deleted.")
        return redirect('doctor_list_admin')
    return render(request, 'doctors/confirm_delete.html', {'doctor': doctor})
