from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.patient_dashboard_view, name='patient_dashboard'),
    path('profile/edit/', views.patient_my_profile_view, name='patient_my_profile'),
    path('', views.patient_list_view, name='patient_list'),
    path('create/', views.patient_create_by_staff_view, name='patient_create_staff'),
    path('<int:pk>/', views.patient_detail_view, name='patient_detail'),
    path('<int:pk>/delete/', views.patient_delete_view, name='patient_delete'),
]
