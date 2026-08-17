from django.urls import path
from . import views

urlpatterns = [
    path('', views.doctor_list_public_view, name='doctor_list'),
    path('<int:pk>/', views.doctor_detail_view, name='doctor_detail'),
    path('dashboard/', views.doctor_dashboard_view, name='doctor_dashboard'),
    path('profile/edit/', views.doctor_my_profile_update_view, name='doctor_profile_edit'),
    path('my-patients/', views.doctor_assigned_patients_view, name='doctor_assigned_patients'),
    
    # Admin Doctor Management
    path('manage/list/', views.admin_doctor_list_view, name='doctor_list_admin'),
    path('manage/create/', views.admin_doctor_create_view, name='doctor_create_admin'),
    path('manage/<int:pk>/delete/', views.admin_doctor_delete_view, name='doctor_delete_admin'),
]
