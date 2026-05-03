from rest_framework import serializers
from django.contrib.auth.models import User

class RegisterSerializer(serializers.ModelSerializer):

    full_name = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'full_name']
        extra_kwargs = {
            'password': {'write_only': True},
            'full_name': {'write_only': False},
        }

    def validate_full_name(self, value):
        parts = value.strip().split()
        if len(parts) < 2:
            raise serializers.ValidationError(
                'Ingresá tu nombre completo.'
            )
        return value.strip()

    def create(self, validated_data):
        full_name = validated_data.pop('full_name')

        parts = full_name.strip().split()
        first_name = parts[0]
        last_name = ' '.join(parts[1:])

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
        )
        return user