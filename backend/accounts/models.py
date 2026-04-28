from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import secrets 
# Módulo para generar OTPs seguras
import string


class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"OTP para {self.user.username}"

    @staticmethod
    def generate_otp():
        return ''.join(secrets.choice(string.digits) for _ in range(6))

    @classmethod
    def create_otp(cls, user):
        # invalidar OTPs anteriores, genera uno nuevo y lo guarda en la BD
        cls.objects.filter(user=user, is_used=False).update(is_used=True)

        otp = cls.generate_otp()
        expires_at = timezone.now() + timedelta(minutes=10)

        return cls.objects.create(
            user=user,
            otp=otp,
            expires_at=expires_at
        )

    def is_valid(self): # Verifica si el OTP es válido
        return not self.is_used and timezone.now() <= self.expires_at

    def mark_as_used(self): # Lo invalida después de usarlo
        self.is_used = True
        self.save()