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

from rest_framework.permissions import IsAuthenticated 

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
            refresh['username'] = user.username 
            # Inyecta el username directamente en el token JWT

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

        otp_obj = PasswordResetOTP.create_otp(user) 

        print(f"OTP para {user.username}: {otp_obj.otp}")

        return Response({
            'message': 'OTP enviado (ver consola)'
        })
    
class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        try:
            user = User.objects.get(email=email) 
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            otp_obj = PasswordResetOTP.objects.filter(user=user, otp=otp).latest('created_at') 
        except PasswordResetOTP.DoesNotExist:
            return Response(
                {'error': 'OTP inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if otp_obj.is_valid(): 
            return Response({'message': 'OTP verificado exitosamente'})
        else:
            return Response(
                {'error': 'OTP expirado o ya usado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
class ResetPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email') 
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            otp_obj = PasswordResetOTP.objects.filter(user=user, otp=otp, is_used=False).latest('created_at') 
        except PasswordResetOTP.DoesNotExist:
            return Response(
                {'error': 'OTP inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not otp_obj.is_valid():
            return Response(
                {'error': 'OTP expirado o ya usado'},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        try:
            validate_password(new_password, user) 
        except ValidationError as e:
            return Response(
                {'error': str(e[0])},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password) # hashea la nueva contraseña
        user.save()
        otp_obj.mark_as_used()

        return Response({'message': 'Contraseña actualizada exitosamente'})
    
class ProfileView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        user = request.user 
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'date_joined': str(user.date_joined.date()),
        })