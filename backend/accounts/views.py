from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework import generics
from django.contrib.auth.models import User
from .serializers import RegisterSerializer
from .models import PasswordResetOTP 

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username
            })
        else:
            return Response(
                {'error': 'Credenciales inválidas'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
class RequestOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

        otp_obj = PasswordResetOTP.create_otp(user) # Crea un nuevo OTP para el usuario (y marca como usados los anteriores)

        # simulamos envío de email
        print(f"OTP para {user.username}: {otp_obj.otp}")

        return Response({
            'message': 'OTP enviado (ver consola)'
        })
    
class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        try:
            user = User.objects.get(email=email) # Busca el usuario por email
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            otp_obj = PasswordResetOTP.objects.filter(user=user, otp=otp).latest('created_at') # Busca el OTP más reciente para ese usuario
        except PasswordResetOTP.DoesNotExist:
            return Response(
                {'error': 'OTP inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if otp_obj.is_valid(): # Valida el OTP
            return Response({'message': 'OTP verificado exitosamente'})
        else:
            return Response(
                {'error': 'OTP expirado o ya usado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
class ResetPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email') # recibe lo que manda el frontend: email, otp y nueva contraseña
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')

        # Busca y valida el OTP, si es correcto actualiza la contraseña del usuario
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Busca el OTP válido 
        try:
            otp_obj = PasswordResetOTP.objects.filter(user=user, otp=otp, is_used=False).latest('created_at') # Busca el OTP más reciente que coincida 
        except PasswordResetOTP.DoesNotExist:
            return Response(
                {'error': 'OTP inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verifica expiración y uso del OTP
        if not otp_obj.is_valid():
            return Response(
                {'error': 'OTP expirado o ya usado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Actualiza contraseña 
        try:
            validate_password(new_password, user) # Valida la nueva contraseña según validadores de Django settings.py
        except ValidationError as e:
            return Response(
                {'error': str(e[0])},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password) # hashea la nueva contraseña
        user.save()

        # Marca el OTP como usado para evitar reutilización
        otp_obj.mark_as_used()

        return Response({'message': 'Contraseña actualizada exitosamente'})