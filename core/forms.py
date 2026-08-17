from django import forms
from .models import Department

class DepartmentForm(forms.ModelForm):
    class Meta:
        model = Department
        fields = ['name', 'head_of_department', 'icon', 'description']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Cardiology, Neurology'}),
            'head_of_department': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Dr. Full Name'}),
            'icon': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'bi-heart-pulse'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Department overview...'}),
        }
