from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import User
from .forms import PatientRegistrationForm, LoginForm, UserProfileUpdateForm

ROLE_PORTAL_CONFIG = {
    'admin': {
        'key': 'admin',
        'role_code': User.Role.ADMIN,
        'title': 'Hospital Administrator Portal',
        'subtitle': 'Restricted access for Chief Medical Officers, IT administrators, and Hospital Superintendents.',
        'badge': 'Hospital Administration',
        'badge_class': 'bg-dark',
        'icon': 'bi-shield-lock-fill',
        'theme_color': '#1e293b',
        'default_username': 'admin',
        'default_pass': 'admin123',
        'redirect_url': 'admin_dashboard',
        'allowed_roles': [User.Role.ADMIN],
        'allow_superuser': True,
        'denial_message': 'Access Denied: Your account does not possess Hospital Administrator credentials.',
    },
    'doctor': {
        'key': 'doctor',
        'role_code': User.Role.DOCTOR,
        'title': 'Physician & Clinical Portal',
        'subtitle': 'Secure authentication for registered doctors, consultants, and surgeons.',
        'badge': 'Medical Doctors & Consultants',
        'badge_class': 'bg-success',
        'icon': 'bi-hospital',
        'theme_color': '#0f766e',
        'default_username': 'dr_vance',
        'default_pass': 'doctor123',
        'redirect_url': 'doctor_dashboard',
        'allowed_roles': [User.Role.DOCTOR],
        'allow_superuser': False,
        'denial_message': 'Access Denied: This portal is exclusively for registered Medical Doctors.',
    },
    'patient': {
        'key': 'patient',
        'role_code': User.Role.PATIENT,
        'title': 'Patient Health Portal',
        'subtitle': 'Access your medical history, book doctor visits, view prescriptions, and pay bills.',
        'badge': 'Patient Health Records',
        'badge_class': 'bg-primary',
        'icon': 'bi-heart-pulse-fill',
        'theme_color': '#0284c7',
        'default_username': 'john_doe',
        'default_pass': 'patient123',
        'redirect_url': 'patient_dashboard',
        'allowed_roles': [User.Role.PATIENT],
        'allow_superuser': False,
        'denial_message': 'Access Denied: This portal is reserved for Patient accounts.',
        'has_register': True,
    },
    'receptionist': {
        'key': 'receptionist',
        'role_code': User.Role.RECEPTIONIST,
        'title': 'Front Desk & Billing Portal',
        'subtitle': 'Walk-in registration, doctor scheduling, cashier operations, and invoice management.',
        'badge': 'Reception & Billing Staff',
        'badge_class': 'bg-warning text-dark',
        'icon': 'bi-person-badge-fill',
        'theme_color': '#d97706',
        'default_username': 'receptionist',
        'default_pass': 'staff123',
        'redirect_url': 'receptionist_dashboard',
        'allowed_roles': [User.Role.RECEPTIONIST, User.Role.ADMIN],
        'allow_superuser': True,
        'denial_message': 'Access Denied: This portal is reserved for Front Desk and Billing staff.',
    },
    'hr': {
        'key': 'hr',
        'role_code': User.Role.HR,
        'title': 'Human Resources & Staffing Portal',
        'subtitle': 'Medical staffing onboarding, practitioner directories, shifts, and department allocations.',
        'badge': 'HR & Staffing Operations',
        'badge_class': 'bg-info text-dark',
        'icon': 'bi-people-fill',
        'theme_color': '#7c3aed',
        'default_username': 'hr_staff',
        'default_pass': 'staff123',
        'redirect_url': 'hr_dashboard',
        'allowed_roles': [User.Role.HR, User.Role.ADMIN],
        'allow_superuser': True,
        'denial_message': 'Access Denied: This portal is reserved for Human Resources staff.',
    },
}

def register_patient_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard_redirect')
    
    if request.method == 'POST':
        form = PatientRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, f"Welcome {user.get_full_name()}! Your patient account has been created. Please sign in.")
            return redirect('patient_login')
        else:
            messages.error(request, "Please correct the errors in the registration form below.")
    else:
        form = PatientRegistrationForm()
    
    return render(request, 'accounts/register.html', {'form': form})

def handle_role_authentication(request, role_key):
    config = ROLE_PORTAL_CONFIG.get(role_key)
    if not config:
        return redirect('login')

    if request.user.is_authenticated:
        # Check if already authenticated user has clearance
        if request.user.is_superuser or request.user.role in config['allowed_roles']:
            return redirect(config['redirect_url'])
        else:
            return redirect('dashboard_redirect')

    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            # Role validation check
            is_authorized = False
            if config['allow_superuser'] and user.is_superuser:
                is_authorized = True
            elif user.role in config['allowed_roles']:
                is_authorized = True

            if is_authorized:
                login(request, user)
                messages.success(request, f"Welcome to the {config['title']}, {user.get_full_name() or user.username}!")
                return redirect(config['redirect_url'])
            else:
                messages.error(request, config['denial_message'])
        else:
            messages.error(request, "Invalid username or password. Please verify credentials.")
    else:
        form = LoginForm()

    return render(request, 'accounts/role_login.html', {
        'form': form,
        'config': config,
        'all_roles': ROLE_PORTAL_CONFIG,
    })

def login_hub_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard_redirect')
    return render(request, 'accounts/login_hub.html', {
        'roles': ROLE_PORTAL_CONFIG
    })

def admin_login_view(request):
    return handle_role_authentication(request, 'admin')

def doctor_login_view(request):
    return handle_role_authentication(request, 'doctor')

def patient_login_view(request):
    return handle_role_authentication(request, 'patient')

def receptionist_login_view(request):
    return handle_role_authentication(request, 'receptionist')

def hr_login_view(request):
    return handle_role_authentication(request, 'hr')

def login_view(request):
    # If general login requested, default to role hub or standard authentication
    return login_hub_view(request)

@login_required
def logout_view(request):
    logout(request)
    messages.info(request, "You have been securely signed out of the hospital system.")
    return redirect('login')

@login_required
def dashboard_redirect_view(request):
    user = request.user
    if user.is_superuser or user.role == User.Role.ADMIN:
        return redirect('admin_dashboard')
    elif user.role == User.Role.DOCTOR:
        return redirect('doctor_dashboard')
    elif user.role == User.Role.PATIENT:
        return redirect('patient_dashboard')
    elif user.role == User.Role.RECEPTIONIST:
        return redirect('receptionist_dashboard')
    elif user.role == User.Role.HR:
        return redirect('hr_dashboard')
    return redirect('home')

@login_required
def profile_view(request):
    user = request.user
    if request.method == 'POST':
        form = UserProfileUpdateForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, "Your profile has been updated successfully.")
            return redirect('profile')
    else:
        form = UserProfileUpdateForm(instance=user)
    
    return render(request, 'accounts/profile.html', {'form': form, 'user_obj': user})

