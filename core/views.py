from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.db.models import Sum, Count, Q
from accounts.decorators import admin_required
from accounts.models import User
from .models import Department
from .forms import DepartmentForm

def home_view(request):
    departments = Department.objects.all()[:6]
    return render(request, 'core/home.html', {
        'departments': departments,
    })

def about_view(request):
    return render(request, 'core/about.html')

def contact_view(request):
    if request.method == 'POST':
        messages.success(request, "Thank you for reaching out! Our hospital help desk has received your message.")
        return redirect('contact')
    return render(request, 'core/contact.html')

@admin_required
def admin_dashboard_view(request):
    from doctors.models import DoctorProfile
    from patients.models import PatientProfile
    from appointments.models import Appointment
    from billing.models import FeePayment

    today = timezone.localdate()

    total_patients = PatientProfile.objects.count()
    total_doctors = DoctorProfile.objects.count()
    total_appointments = Appointment.objects.count()
    pending_appointments = Appointment.objects.filter(status=Appointment.Status.PENDING).count()
    today_appointments = Appointment.objects.filter(appointment_date=today).count()
    
    # Financials
    total_revenue = FeePayment.objects.aggregate(total=Sum('paid_amount'))['total'] or 0
    total_due = FeePayment.objects.aggregate(total=Sum('due_amount'))['total'] or 0

    recent_appointments = Appointment.objects.select_related('patient', 'doctor', 'doctor__department').order_by('-created_at')[:8]
    recent_patients = PatientProfile.objects.select_related('user').order_by('-registration_date')[:5]
    recent_payments = FeePayment.objects.select_related('patient__user', 'appointment').order_by('-payment_date')[:5]

    context = {
        'total_patients': total_patients,
        'total_doctors': total_doctors,
        'total_appointments': total_appointments,
        'pending_appointments': pending_appointments,
        'today_appointments': today_appointments,
        'total_revenue': total_revenue,
        'total_due': total_due,
        'recent_appointments': recent_appointments,
        'recent_patients': recent_patients,
        'recent_payments': recent_payments,
    }
    return render(request, 'core/admin_dashboard.html', context)

# Department Management
@admin_required
def department_list_view(request):
    query = request.GET.get('q', '')
    if query:
        departments = Department.objects.filter(Q(name__icontains=query) | Q(description__icontains=query))
    else:
        departments = Department.objects.all()
    return render(request, 'core/departments/list.html', {'departments': departments, 'query': query})

@admin_required
def department_create_view(request):
    if request.method == 'POST':
        form = DepartmentForm(request.POST)
        if form.is_valid():
            dept = form.save()
            messages.success(request, f"Department '{dept.name}' created successfully.")
            return redirect('department_list')
    else:
        form = DepartmentForm()
    return render(request, 'core/departments/form.html', {'form': form, 'title': 'Add New Department'})

@admin_required
def department_update_view(request, pk):
    dept = get_object_or_404(Department, pk=pk)
    if request.method == 'POST':
        form = DepartmentForm(request.POST, instance=dept)
        if form.is_valid():
            form.save()
            messages.success(request, f"Department '{dept.name}' updated successfully.")
            return redirect('department_list')
    else:
        form = DepartmentForm(instance=dept)
    return render(request, 'core/departments/form.html', {'form': form, 'title': f'Edit Department - {dept.name}'})

@admin_required
def department_delete_view(request, pk):
    dept = get_object_or_404(Department, pk=pk)
    if request.method == 'POST':
        name = dept.name
        dept.delete()
        messages.success(request, f"Department '{name}' has been deleted.")
        return redirect('department_list')
    return render(request, 'core/departments/confirm_delete.html', {'department': dept})

def custom_permission_denied_view(request, exception=None):
    return render(request, 'errors/403.html', status=403)

def custom_page_not_found_view(request, exception=None):
    return render(request, 'errors/404.html', status=404)
