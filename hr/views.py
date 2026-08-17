from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q, Count
from accounts.models import User
from accounts.decorators import hr_required
from doctors.models import DoctorProfile
from core.models import Department
from .forms import DoctorEmploymentForm
from doctors.forms import DoctorCreationForm

@hr_required
def hr_dashboard_view(request):
    total_doctors = DoctorProfile.objects.count()
    active_doctors = DoctorProfile.objects.filter(employment_status=DoctorProfile.EmploymentStatus.ACTIVE).count()
    on_leave_doctors = DoctorProfile.objects.filter(employment_status=DoctorProfile.EmploymentStatus.ON_LEAVE).count()
    inactive_doctors = DoctorProfile.objects.filter(employment_status__in=[DoctorProfile.EmploymentStatus.INACTIVE, DoctorProfile.EmploymentStatus.RESIGNED]).count()

    recent_doctors = DoctorProfile.objects.select_related('user', 'department').order_by('-id')[:8]
    departments = Department.objects.annotate(doc_count=Count('doctors')).all()

    context = {
        'total_doctors': total_doctors,
        'active_doctors': active_doctors,
        'on_leave_doctors': on_leave_doctors,
        'inactive_doctors': inactive_doctors,
        'recent_doctors': recent_doctors,
        'departments': departments,
    }
    return render(request, 'hr/dashboard.html', context)

@hr_required
def hr_doctor_list_view(request):
    query = request.GET.get('q', '')
    status_filter = request.GET.get('status', '')
    dept_filter = request.GET.get('department', '')

    doctors = DoctorProfile.objects.select_related('user', 'department').all()

    if query:
        doctors = doctors.filter(
            Q(user__first_name__icontains=query) |
            Q(user__last_name__icontains=query) |
            Q(doctor_id__icontains=query) |
            Q(specialization__icontains=query)
        )
    if status_filter:
        doctors = doctors.filter(employment_status=status_filter)
    if dept_filter:
        doctors = doctors.filter(department_id=dept_filter)

    departments = Department.objects.all()

    return render(request, 'hr/doctor_list.html', {
        'doctors': doctors,
        'query': query,
        'status_filter': status_filter,
        'dept_filter': dept_filter,
        'departments': departments,
        'status_choices': DoctorProfile.EmploymentStatus.choices,
    })

@hr_required
def hr_doctor_create_view(request):
    if request.method == 'POST':
        form = DoctorCreationForm(request.POST)
        if form.is_valid():
            doctor = form.save()
            messages.success(request, f"Doctor {doctor.full_name} registered successfully with ID {doctor.doctor_id}.")
            return redirect('hr_doctor_list')
    else:
        form = DoctorCreationForm()
    return render(request, 'hr/doctor_form.html', {'form': form, 'title': 'HR Onboarding: Register New Doctor'})

@hr_required
def hr_doctor_edit_view(request, pk):
    doctor = get_object_or_404(DoctorProfile, pk=pk)
    if request.method == 'POST':
        form = DoctorEmploymentForm(request.POST, instance=doctor)
        if form.is_valid():
            form.save()
            messages.success(request, f"Employment records for {doctor.full_name} have been updated.")
            return redirect('hr_doctor_list')
    else:
        form = DoctorEmploymentForm(instance=doctor)
    return render(request, 'hr/doctor_form.html', {'form': form, 'title': f'Manage Employment - {doctor.full_name}'})

@hr_required
def hr_doctor_status_toggle_view(request, pk):
    doctor = get_object_or_404(DoctorProfile, pk=pk)
    new_status = request.POST.get('status')
    if new_status in [choice[0] for choice in DoctorProfile.EmploymentStatus.choices]:
        doctor.employment_status = new_status
        doctor.save(update_fields=['employment_status'])
        messages.success(request, f"Status for {doctor.full_name} updated to {doctor.get_employment_status_display()}.")
    else:
        messages.error(request, "Invalid status choice.")
    return redirect('hr_doctor_list')
