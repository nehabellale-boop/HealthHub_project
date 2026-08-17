from django.urls import path
from . import views

urlpatterns = [
    path('', views.appointment_list_view, name='appointment_list'),
    path('book/', views.book_appointment_patient_view, name='book_appointment_patient'),
    path('schedule-staff/', views.book_appointment_staff_view, name='book_appointment_staff'),
    path('<int:pk>/', views.appointment_detail_view, name='appointment_detail'),
    path('<int:pk>/cancel/', views.cancel_appointment_view, name='cancel_appointment'),
    path('<int:pk>/status/', views.update_appointment_status_view, name='update_appointment_status'),
    
    # Prescriptions
    path('<int:appointment_id>/prescribe/', views.create_or_edit_prescription_view, name='create_prescription'),
    path('prescription/<int:pk>/', views.prescription_detail_view, name='prescription_detail'),
]
