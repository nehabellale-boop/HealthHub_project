from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_patient_view, name='register'),
    path('login/', views.login_hub_view, name='login'),
    path('login/admin/', views.admin_login_view, name='admin_login'),
    path('login/doctor/', views.doctor_login_view, name='doctor_login'),
    path('login/patient/', views.patient_login_view, name='patient_login'),
    path('login/receptionist/', views.receptionist_login_view, name='receptionist_login'),
    path('login/hr/', views.hr_login_view, name='hr_login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard_redirect_view, name='dashboard_redirect'),
    path('profile/', views.profile_view, name='profile'),
]

