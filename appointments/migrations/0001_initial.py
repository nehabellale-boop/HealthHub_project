from django.db import migrations, models
import django.db.models.deletion
import appointments.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('core', '0001_initial'),
        ('doctors', '0001_initial'),
        ('patients', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Appointment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('appointment_id', models.CharField(default=appointments.models.generate_appointment_id, max_length=20, unique=True)),
                ('appointment_date', models.DateField()),
                ('appointment_time', models.CharField(choices=[('09:00', '09:00 AM'), ('09:30', '09:30 AM'), ('10:00', '10:00 AM'), ('10:30', '10:30 AM'), ('11:00', '11:00 AM'), ('11:30', '11:30 AM'), ('12:00', '12:00 PM'), ('14:00', '02:00 PM'), ('14:30', '02:30 PM'), ('15:00', '03:00 PM'), ('15:30', '03:30 PM'), ('16:00', '04:00 PM'), ('16:30', '04:30 PM'), ('17:00', '05:00 PM')], max_length=10)),
                ('symptoms', models.TextField(help_text='Reason for visit or symptoms described by patient')),
                ('status', models.CharField(choices=[('PENDING', 'Pending Approval'), ('CONFIRMED', 'Confirmed'), ('COMPLETED', 'Completed'), ('CANCELLED', 'Cancelled')], default='PENDING', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='appointments', to='core.department')),
                ('doctor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='appointments', to='doctors.doctorprofile')),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='appointments', to='patients.patientprofile')),
            ],
            options={
                'ordering': ['appointment_date', 'appointment_time'],
            },
        ),
        migrations.CreateModel(
            name='Prescription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('diagnosis', models.TextField(help_text='Primary clinical diagnosis and findings')),
                ('prescription_medicines', models.TextField(help_text='Prescribed drugs, dosage, frequency, and duration')),
                ('dosage_instructions', models.TextField(blank=True, help_text='Special instructions (e.g. after meals, avoid driving)', null=True)),
                ('treatment_notes', models.TextField(blank=True, help_text='Doctor internal clinical observations & treatment plan', null=True)),
                ('follow_up_date', models.DateField(blank=True, help_text='Suggested follow-up consultation date', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('appointment', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='prescription', to='appointments.appointment')),
                ('doctor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='prescriptions', to='doctors.doctorprofile')),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='prescriptions', to='patients.patientprofile')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='appointment',
            constraint=models.UniqueConstraint(condition=models.Q(('status', 'CANCELLED'), _negated=True), fields=('doctor', 'appointment_date', 'appointment_time'), name='unique_doctor_appointment_slot'),
        ),
    ]
