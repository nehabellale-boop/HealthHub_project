from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db.models import Q
from accounts.models import User
from accounts.decorators import doctor_required, patient_required
from .models import Appointment, Prescription
from .forms import PatientAppointmentBookingForm, StaffAppointmentBookingForm, PrescriptionForm
from doctors.models import DoctorProfile
from patients.models import PatientProfile

@login_required
def appointment_list_view(request):
    user = request.user
    query = request.GET.get('q', '')
    status_filter = request.GET.get('status', '')
    date_filter = request.GET.get('date', '')

    if user.role == User.Role.PATIENT:
        appointments = Appointment.objects.filter(patient=user.patient_profile)
    elif user.role == User.Role.DOCTOR:
        appointments = Appointment.objects.filter(doctor=user.doctor_profile)
    elif user.role in [User.Role.ADMIN, User.Role.RECEPTIONIST, User.Role.HR] or user.is_superuser:
        appointments = Appointment.objects.all()
    else:
        appointments = Appointment.objects.none()

    appointments = appointments.select_related('patient', 'patient__user', 'doctor', 'doctor__user', 'department')

    if query:
        appointments = appointments.filter(
            Q(appointment_id__icontains=query) |
            Q(patient__user__first_name__icontains=query) |
            Q(patient__user__last_name__icontains=query) |
            Q(doctor__user__first_name__icontains=query) |
            Q(doctor__user__last_name__icontains=query) |
            Q(department__name__icontains=query)
        )
    if status_filter:
        appointments = appointments.filter(status=status_filter)
    if date_filter:
        appointments = appointments.filter(appointment_date=date_filter)

    return render(request, 'appointments/appointment_list.html', {
        'appointments': appointments,
        'query': query,
        'status_filter': status_filter,
        'date_filter': date_filter,
        'status_choices': Appointment.Status.choices,
    })

@login_required
def appointment_detail_view(request, pk):
    appointment = get_object_or_404(
        Appointment.objects.select_related('patient', 'patient__user', 'doctor', 'doctor__user', 'department'),
        pk=pk
    )
    user = request.user

    # Object-level access control
    if user.role == User.Role.PATIENT and appointment.patient != user.patient_profile:
        messages.error(request, "Permission denied: You can only view your own appointments.")
        return redirect('patient_dashboard')
    if user.role == User.Role.DOCTOR and appointment.doctor != user.doctor_profile:
        messages.error(request, "Permission denied: You can only view appointments assigned to you.")
        return redirect('doctor_dashboard')

    prescription = getattr(appointment, 'prescription', None)
    payment = getattr(appointment, 'fee_payment', None)

    return render(request, 'appointments/appointment_detail.html', {
        'appointment': appointment,
        'prescription': prescription,
        'payment': payment,
    })

@patient_required
def book_appointment_patient_view(request):
    patient = request.user.patient_profile
    initial_doctor_id = request.GET.get('doctor')
    initial_data = {}
    if initial_doctor_id:
        try:
            doc = DoctorProfile.objects.get(pk=initial_doctor_id)
            initial_data['doctor'] = doc
            initial_data['department'] = doc.department
        except DoctorProfile.DoesNotExist:
            pass

    if request.method == 'POST':
        form = PatientAppointmentBookingForm(request.POST)
        if form.is_valid():
            appointment = form.save(commit=False)
            appointment.patient = patient
            appointment.status = Appointment.Status.PENDING
            try:
                appointment.save()
                messages.success(request, f"Appointment booked successfully! Reference ID: {appointment.appointment_id}. Awaiting hospital confirmation.")
                return redirect('appointment_detail', pk=appointment.pk)
            except ValidationError as e:
                if hasattr(e, 'message_dict'):
                    for field, errs in e.message_dict.items():
                        for err in errs:
                            form.add_error(field if field != '__all__' else None, err)
                else:
                    messages.error(request, str(e))
        else:
            messages.error(request, "Please fix the errors below.")
    else:
        form = PatientAppointmentBookingForm(initial=initial_data)

    return render(request, 'appointments/book_appointment.html', {
        'form': form,
        'title': 'Book a Doctor Consultation'
    })

@login_required
def book_appointment_staff_view(request):
    user = request.user
    if not (user.is_superuser or user.role in [User.Role.ADMIN, User.Role.RECEPTIONIST]):
        messages.error(request, "Access restricted to Receptionist and Admin.")
        return redirect('dashboard_redirect')

    if request.method == 'POST':
        form = StaffAppointmentBookingForm(request.POST)
        if form.is_valid():
            appointment = form.save(commit=False)
            try:
                appointment.save()
                messages.success(request, f"Appointment {appointment.appointment_id} scheduled for {appointment.patient.full_name} with {appointment.doctor.full_name}.")
                return redirect('appointment_detail', pk=appointment.pk)
            except ValidationError as e:
                if hasattr(e, 'message_dict'):
                    for field, errs in e.message_dict.items():
                        for err in errs:
                            form.add_error(field if field != '__all__' else None, err)
                else:
                    messages.error(request, str(e))
        else:
            messages.error(request, "Please correct the form errors.")
    else:
        form = StaffAppointmentBookingForm()

    return render(request, 'appointments/book_appointment_staff.html', {'form': form})

@login_required
def cancel_appointment_view(request, pk):
    appointment = get_object_or_404(Appointment, pk=pk)
    user = request.user

    # Object-level check: Patient can cancel only own upcoming appointments
    if user.role == User.Role.PATIENT:
        if appointment.patient != user.patient_profile:
            messages.error(request, "Access denied: You cannot cancel another patient's appointment.")
            return redirect('patient_dashboard')
        if appointment.status in [Appointment.Status.COMPLETED, Appointment.Status.CANCELLED]:
            messages.error(request, "Cannot cancel an appointment that has already been completed or cancelled.")
            return redirect('appointment_detail', pk=pk)

    elif user.role == User.Role.DOCTOR:
        if appointment.doctor != user.doctor_profile:
            messages.error(request, "Access denied.")
            return redirect('doctor_dashboard')

    elif not (user.is_superuser or user.role in [User.Role.ADMIN, User.Role.RECEPTIONIST]):
        messages.error(request, "You do not have permission to cancel appointments.")
        return redirect('home')

    if request.method == 'POST':
        appointment.status = Appointment.Status.CANCELLED
        appointment.save(update_fields=['status'])
        messages.success(request, f"Appointment {appointment.appointment_id} has been cancelled.")
        return redirect('appointment_detail', pk=pk)

    return render(request, 'appointments/confirm_cancel.html', {'appointment': appointment})

@login_required
def update_appointment_status_view(request, pk):
    appointment = get_object_or_404(Appointment, pk=pk)
    user = request.user

    if user.role == User.Role.DOCTOR:
        if appointment.doctor != user.doctor_profile:
            messages.error(request, "Access denied: You can only manage your own assigned appointments.")
            return redirect('doctor_dashboard')
    elif not (user.is_superuser or user.role in [User.Role.ADMIN, User.Role.RECEPTIONIST]):
        messages.error(request, "Permission denied.")
        return redirect('home')

    new_status = request.POST.get('status')
    if new_status in [choice[0] for choice in Appointment.Status.choices]:
        appointment.status = new_status
        appointment.save(update_fields=['status'])
        messages.success(request, f"Appointment status updated to {appointment.get_status_display()}.")
    else:
        messages.error(request, "Invalid status choice.")

    return redirect('appointment_detail', pk=pk)

# Prescription Views
@doctor_required
def create_or_edit_prescription_view(request, appointment_id):
    appointment = get_object_or_404(Appointment, pk=appointment_id)
    doctor = request.user.doctor_profile

    # Strict Doctor check
    if appointment.doctor != doctor:
        messages.error(request, "Permission denied: Only the assigned doctor can add or edit prescriptions.")
        return redirect('doctor_dashboard')

    prescription, created = Prescription.objects.get_or_create(
        appointment=appointment,
        defaults={'doctor': doctor, 'patient': appointment.patient, 'diagnosis': '', 'prescription_medicines': ''}
    )

    if request.method == 'POST':
        form = PrescriptionForm(request.POST, instance=prescription)
        if form.is_valid():
            p = form.save(commit=False)
            p.doctor = doctor
            p.patient = appointment.patient
            p.save()
            # Mark appointment as completed
            appointment.status = Appointment.Status.COMPLETED
            appointment.save(update_fields=['status'])
            messages.success(request, "Prescription saved and consultation marked as Completed!")
            return redirect('prescription_detail', pk=p.pk)
        else:
            messages.error(request, "Please fix prescription form errors.")
    else:
        form = PrescriptionForm(instance=prescription)

    return render(request, 'appointments/prescription_form.html', {
        'form': form,
        'appointment': appointment,
        'prescription': prescription,
    })

@login_required
def prescription_detail_view(request, pk):
    prescription = get_object_or_404(
        Prescription.objects.select_related('appointment', 'doctor', 'doctor__user', 'doctor__department', 'patient', 'patient__user'),
        pk=pk
    )
    user = request.user

    # Object-level check: Patient can only view their own prescription
    if user.role == User.Role.PATIENT and prescription.patient != user.patient_profile:
        messages.error(request, "Access denied: You cannot view another patient's prescription.")
        return redirect('patient_dashboard')

    # Doctor can view assigned or admin/receptionist
    if user.role == User.Role.DOCTOR and prescription.doctor != user.doctor_profile:
        messages.error(request, "Access denied.")
        return redirect('doctor_dashboard')

    return render(request, 'appointments/prescription_detail.html', {
        'prescription': prescription,
    })
