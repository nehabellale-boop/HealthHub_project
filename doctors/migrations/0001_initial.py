from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import doctors.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('core', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='DoctorProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('doctor_id', models.CharField(default=doctors.models.generate_doctor_id, max_length=20, unique=True)),
                ('specialization', models.CharField(max_length=150)),
                ('qualification', models.CharField(help_text='e.g. MBBS, MD, MS, FRCS', max_length=150)),
                ('experience_years', models.PositiveIntegerField(default=1, help_text='Years of clinical experience')),
                ('joining_date', models.DateField(blank=True, null=True)),
                ('employment_status', models.CharField(choices=[('ACTIVE', 'Active'), ('ON_LEAVE', 'On Leave'), ('RESIGNED', 'Resigned'), ('INACTIVE', 'Inactive')], default='ACTIVE', max_length=20)),
                ('consultation_fee', models.DecimalField(decimal_places=2, default=50.0, max_digits=10)),
                ('availability_status', models.CharField(choices=[('AVAILABLE', 'Available'), ('BUSY', 'In Consultation'), ('OFF_DUTY', 'Off Duty')], default='AVAILABLE', max_length=20)),
                ('gender', models.CharField(choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], default='M', max_length=10)),
                ('date_of_birth', models.DateField(blank=True, null=True)),
                ('bio', models.TextField(blank=True, null=True)),
                ('department', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='doctors', to='core.department')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='doctor_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['user__first_name', 'user__last_name'],
            },
        ),
    ]
