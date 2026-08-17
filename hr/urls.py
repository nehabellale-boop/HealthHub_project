from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.hr_dashboard_view, name='hr_dashboard'),
    path('doctors/', views.hr_doctor_list_view, name='hr_doctor_list'),
    path('doctors/create/', views.hr_doctor_create_view, name='hr_doctor_create'),
    path('doctors/<int:pk>/edit/', views.hr_doctor_edit_view, name='hr_doctor_edit'),
    path('doctors/<int:pk>/status/', views.hr_doctor_status_toggle_view, name='hr_doctor_status_toggle'),
]
