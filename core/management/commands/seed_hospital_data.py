from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from core.models import Department
from doctors.models import DoctorProfile
from patients.models import PatientProfile
from appointments.models import Appointment, Prescription
from billing.models import FeePayment

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with initial sample hospital departments, staff, patients, appointments, and billing data.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding hospital management system data...")

        # 1. Superuser / Admin
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@medicare.hospital',
                'first_name': 'Hospital',
                'last_name': 'Administrator',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'phone_number': '+1-555-0100',
                'address': 'Main Hospital Admin Suite 401'
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created admin user (admin / admin123)"))

        # 2. Receptionist
        rec_user, created = User.objects.get_or_create(
            username='receptionist',
            defaults={
                'email': 'frontdesk@medicare.hospital',
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'role': User.Role.RECEPTIONIST,
                'phone_number': '+1-555-0102',
                'address': 'Ground Floor Reception'
            }
        )
        if created:
            rec_user.set_password('staff123')
            rec_user.save()
            self.stdout.write(self.style.SUCCESS("Created receptionist (receptionist / staff123)"))

        # 3. HR Staff
        hr_user, created = User.objects.get_or_create(
            username='hr_staff',
            defaults={
                'email': 'hr@medicare.hospital',
                'first_name': 'Michael',
                'last_name': 'Chang',
                'role': User.Role.HR,
                'phone_number': '+1-555-0104',
                'address': 'HR Operations Wing B'
            }
        )
        if created:
            hr_user.set_password('staff123')
            hr_user.save()
            self.stdout.write(self.style.SUCCESS("Created HR staff (hr_staff / staff123)"))

        # 4. Departments
        depts_data = [
            {'name': 'Cardiology', 'icon': 'bi-heart-pulse', 'desc': 'Comprehensive heart and cardiovascular disease treatment and interventions.', 'head': 'Dr. Marcus Vance'},
            {'name': 'Neurology', 'icon': 'bi-activity', 'desc': 'Specialized care for neurological disorders, stroke, and brain injuries.', 'head': 'Dr. Elena Rostova'},
            {'name': 'Orthopedics', 'icon': 'bi-bandaid', 'desc': 'Musculoskeletal injuries, joint replacements, and sports medicine.', 'head': 'Dr. James Thorne'},
            {'name': 'Pediatrics', 'icon': 'bi-emoji-smile', 'desc': 'Dedicated healthcare and wellness for infants, children, and adolescents.', 'head': 'Dr. Priya Sharma'},
            {'name': 'Dermatology', 'icon': 'bi-shield-plus', 'desc': 'Advanced medical and cosmetic skin, hair, and nail health.', 'head': 'Dr. Alan Walker'},
            {'name': 'General Medicine', 'icon': 'bi-clipboard2-pulse', 'desc': 'Primary diagnosis, preventive medicine, and acute illness management.', 'head': 'Dr. Lisa Monroe'},
        ]

        dept_objs = {}
        for d in depts_data:
            obj, _ = Department.objects.get_or_create(
                name=d['name'],
                defaults={'icon': d['icon'], 'description': d['desc'], 'head_of_department': d['head']}
            )
            dept_objs[d['name']] = obj

        self.stdout.write(self.style.SUCCESS(f"Configured {len(dept_objs)} departments."))

        # 5. Doctors
        doctors_data = [
            {
                'username': 'dr_vance', 'first_name': 'Marcus', 'last_name': 'Vance',
                'dept': 'Cardiology', 'spec': 'Interventional Cardiology', 'qual': 'MD, FACC, FSCAI',
                'exp': 14, 'fee': 120.00, 'phone': '+1-555-0111', 'email': 'marcus.vance@medicare.hospital'
            },
            {
                'username': 'dr_sharma', 'first_name': 'Priya', 'last_name': 'Sharma',
                'dept': 'Pediatrics', 'spec': 'Neonatal & Pediatric Care', 'qual': 'MD (Pediatrics), FAAP',
                'exp': 10, 'fee': 85.00, 'phone': '+1-555-0112', 'email': 'priya.sharma@medicare.hospital'
            },
            {
                'username': 'dr_thorne', 'first_name': 'James', 'last_name': 'Thorne',
                'dept': 'Orthopedics', 'spec': 'Joint Reconstruction & Sports Medicine', 'qual': 'MS (Ortho), FRCS',
                'exp': 16, 'fee': 140.00, 'phone': '+1-555-0113', 'email': 'james.thorne@medicare.hospital'
            }
        ]

        doc_profiles = []
        for doc in doctors_data:
            u, created = User.objects.get_or_create(
                username=doc['username'],
                defaults={
                    'first_name': doc['first_name'],
                    'last_name': doc['last_name'],
                    'email': doc['email'],
                    'role': User.Role.DOCTOR,
                    'phone_number': doc['phone'],
                    'address': 'Staff Physician Quarters, 3rd Floor'
                }
            )
            if created:
                u.set_password('doctor123')
                u.save()

            dp, _ = DoctorProfile.objects.get_or_create(
                user=u,
                defaults={
                    'department': dept_objs[doc['dept']],
                    'specialization': doc['spec'],
                    'qualification': doc['qual'],
                    'experience_years': doc['exp'],
                    'consultation_fee': doc['fee'],
                    'joining_date': timezone.localdate() - timedelta(days=365 * 3),
                    'employment_status': DoctorProfile.EmploymentStatus.ACTIVE,
                    'availability_status': DoctorProfile.AvailabilityStatus.AVAILABLE,
                    'bio': f"Experienced specialist in {doc['spec']} with over {doc['exp']} years of clinical leadership."
                }
            )
            doc_profiles.append(dp)

        self.stdout.write(self.style.SUCCESS(f"Configured {len(doc_profiles)} doctor profiles."))

        # 6. Patients
        patients_data = [
            {'username': 'john_doe', 'first': 'John', 'last': 'Doe', 'bg': 'O+', 'gender': 'M', 'email': 'john.doe@example.com', 'phone': '+1-555-0201'},
            {'username': 'emma_watson', 'first': 'Emma', 'last': 'Watson', 'bg': 'A+', 'gender': 'F', 'email': 'emma.watson@example.com', 'phone': '+1-555-0202'},
            {'username': 'robert_kim', 'first': 'Robert', 'last': 'Kim', 'bg': 'B-', 'gender': 'M', 'email': 'robert.kim@example.com', 'phone': '+1-555-0203'}
        ]

        patient_profiles = []
        for p in patients_data:
            u, created = User.objects.get_or_create(
                username=p['username'],
                defaults={
                    'first_name': p['first'],
                    'last_name': p['last'],
                    'email': p['email'],
                    'role': User.Role.PATIENT,
                    'phone_number': p['phone'],
                    'address': '742 Evergreen Terrace, Springfield'
                }
            )
            if created:
                u.set_password('patient123')
                u.save()

            pp, _ = PatientProfile.objects.get_or_create(
                user=u,
                defaults={
                    'gender': p['gender'],
                    'blood_group': p['bg'],
                    'emergency_contact': f"Next of Kin ({p['phone']})",
                    'medical_history_summary': 'No known major drug allergies. Seasonal allergic rhinitis.'
                }
            )
            patient_profiles.append(pp)

        self.stdout.write(self.style.SUCCESS(f"Configured {len(patient_profiles)} patient profiles."))

        # 7. Sample Appointments & Invoices
        today = timezone.localdate()
        if doc_profiles and patient_profiles:
            # Completed Appointment with Prescription and Paid Invoice
            apt1, created1 = Appointment.objects.get_or_create(
                patient=patient_profiles[0],
                doctor=doc_profiles[0],
                appointment_date=today,
                appointment_time='10:00',
                defaults={
                    'department': doc_profiles[0].department,
                    'symptoms': 'Recurrent palpitation after light workouts.',
                    'status': Appointment.Status.COMPLETED
                }
            )
            if created1:
                Prescription.objects.get_or_create(
                    appointment=apt1,
                    doctor=doc_profiles[0],
                    patient=patient_profiles[0],
                    defaults={
                        'diagnosis': 'Mild supraventricular tachycardia, sinus rhythm normal.',
                        'prescription_medicines': '1. Tab Metoprolol 25mg - Once daily morning\n2. Tab Aspirin 75mg - Once daily post dinner',
                        'dosage_instructions': 'Take after meals with plenty of water. Monitor resting pulse daily.',
                        'treatment_notes': 'Perform resting ECG follow up in 2 weeks.',
                        'follow_up_date': today + timedelta(days=14)
                    }
                )
                FeePayment.objects.get_or_create(
                    appointment=apt1,
                    patient=patient_profiles[0],
                    defaults={
                        'total_amount': doc_profiles[0].consultation_fee,
                        'paid_amount': doc_profiles[0].consultation_fee,
                        'due_amount': 0.00,
                        'payment_status': FeePayment.PaymentStatus.PAID,
                        'payment_method': FeePayment.PaymentMethod.CARD,
                        'created_by': rec_user
                    }
                )

            # Confirmed Upcoming Appointment with Unpaid Invoice
            apt2, created2 = Appointment.objects.get_or_create(
                patient=patient_profiles[1],
                doctor=doc_profiles[1],
                appointment_date=today + timedelta(days=1),
                appointment_time='11:00',
                defaults={
                    'department': doc_profiles[1].department,
                    'symptoms': 'Annual pediatric routine health examination and immunization check.',
                    'status': Appointment.Status.CONFIRMED
                }
            )
            if created2:
                FeePayment.objects.get_or_create(
                    appointment=apt2,
                    patient=patient_profiles[1],
                    defaults={
                        'total_amount': doc_profiles[1].consultation_fee,
                        'paid_amount': 0.00,
                        'due_amount': doc_profiles[1].consultation_fee,
                        'payment_status': FeePayment.PaymentStatus.UNPAID,
                        'payment_method': FeePayment.PaymentMethod.CASH,
                        'created_by': rec_user
                    }
                )

        self.stdout.write(self.style.SUCCESS("✓ Successfully seeded database with demo data!"))
