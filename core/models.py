from django.db import models

class Department(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, default='bi-heart-pulse', help_text='Bootstrap or Lucide icon name')
    head_of_department = models.CharField(max_length=150, blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def total_doctors(self):
        return self.doctors.count()
