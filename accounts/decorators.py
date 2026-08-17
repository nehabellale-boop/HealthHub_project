from functools import wraps
from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect
from django.contrib import messages
from accounts.models import User

def role_required(allowed_roles):
    """
    Decorator for views that checks whether a user has a specific role.
    Redirects unauthenticated users to login, and raises PermissionDenied (403)
    if user does not have permission.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('login')
            if request.user.is_superuser or request.user.role == User.Role.ADMIN:
                return view_func(request, *args, **kwargs)
            if request.user.role in allowed_roles:
                return view_func(request, *args, **kwargs)
            messages.error(request, "You do not have permission to access this portal page.")
            raise PermissionDenied
        return _wrapped_view
    return decorator

def admin_required(view_func):
    return role_required([User.Role.ADMIN])(view_func)

def doctor_required(view_func):
    return role_required([User.Role.DOCTOR])(view_func)

def patient_required(view_func):
    return role_required([User.Role.PATIENT])(view_func)

def receptionist_required(view_func):
    return role_required([User.Role.RECEPTIONIST, User.Role.ADMIN])(view_func)

def hr_required(view_func):
    return role_required([User.Role.HR, User.Role.ADMIN])(view_func)
