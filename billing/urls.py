from django.urls import path
from . import views

urlpatterns = [
    path('receptionist/dashboard/', views.receptionist_dashboard_view, name='receptionist_dashboard'),
    path('payments/', views.payment_list_view, name='payment_list'),
    path('payments/create/', views.payment_create_view, name='payment_create'),
    path('payments/<int:pk>/edit/', views.payment_update_view, name='payment_update'),
    path('invoices/<int:pk>/', views.invoice_detail_view, name='invoice_detail'),
    path('outstanding/', views.outstanding_fees_view, name='outstanding_fees'),
    path('reminders/<int:pk>/send/', views.send_single_reminder_view, name='send_fee_reminder_single'),
]
