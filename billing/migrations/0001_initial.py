from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import billing.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('appointments', '0001_initial'),
        ('patients', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='FeePayment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('invoice_number', models.CharField(default=billing.models.generate_invoice_number, max_length=30, unique=True)),
                ('total_amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('paid_amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('due_amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('payment_status', models.CharField(choices=[('PAID', 'Paid'), ('PARTIALLY_PAID', 'Partially Paid'), ('UNPAID', 'Unpaid')], default='UNPAID', max_length=20)),
                ('payment_method', models.CharField(choices=[('CASH', 'Cash'), ('CARD', 'Credit / Debit Card'), ('UPI', 'UPI / Digital Wallet'), ('INSURANCE', 'Health Insurance'), ('OTHER', 'Other')], default='CASH', max_length=20)),
                ('payment_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('notes', models.TextField(blank=True, help_text='Additional billing notes or discount details', null=True)),
                ('last_reminder_sent', models.DateTimeField(blank=True, null=True)),
                ('appointment', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='fee_payment', to='appointments.appointment')),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='recorded_payments', to=settings.AUTH_USER_MODEL)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='fee_payments', to='patients.patientprofile')),
            ],
            options={
                'ordering': ['-payment_date'],
            },
        ),
    ]
