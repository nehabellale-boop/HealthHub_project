from django import forms
from .models import FeePayment
from appointments.models import Appointment

class FeePaymentForm(forms.ModelForm):
    class Meta:
        model = FeePayment
        fields = ['appointment', 'total_amount', 'paid_amount', 'payment_method', 'notes']
        widgets = {
            'appointment': forms.Select(attrs={'class': 'form-select'}),
            'total_amount': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'paid_amount': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'payment_method': forms.Select(attrs={'class': 'form-select'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Optional invoice notes...'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # If creating new payment, exclude appointments that already have fee payment
        if not self.instance.pk:
            self.fields['appointment'].queryset = Appointment.objects.filter(fee_payment__isnull=True).select_related('patient', 'doctor')
        else:
            self.fields['appointment'].queryset = Appointment.objects.filter(pk=self.instance.appointment.pk)
