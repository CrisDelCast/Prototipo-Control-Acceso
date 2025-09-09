from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Visitor


class VisitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitor
        fields = [
            'id',
            'full_name',
            'document_type',
            'document_number',
            'apartment',
            'visitor_type',
            'always_allowed',
            'photo',
            'created_at',
        ]

    def validate(self, attrs):
        # Ensure unique combination of document_type + document_number
        document_type = attrs.get('document_type')
        document_number = attrs.get('document_number')
        instance_id = self.instance.id if self.instance else None
        if (
            document_type
            and document_number
            and Visitor.objects.exclude(id=instance_id)
            .filter(document_type=document_type, document_number=document_number)
            .exists()
        ):
            raise serializers.ValidationError(
                'Ya existe un visitante con ese tipo y número de documento.'
            )
        return attrs


class UserRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('El usuario ya existe')
        return value

