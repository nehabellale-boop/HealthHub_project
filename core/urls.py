from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('about/', views.about_view, name='about'),
    path('contact/', views.contact_view, name='contact'),
    path('dashboard/admin/', views.admin_dashboard_view, name='admin_dashboard'),
    
    # Department Management
    path('departments/', views.department_list_view, name='department_list'),
    path('departments/create/', views.department_create_view, name='department_create'),
    path('departments/<int:pk>/edit/', views.department_update_view, name='department_update'),
    path('departments/<int:pk>/delete/', views.department_delete_view, name='department_delete'),
]
