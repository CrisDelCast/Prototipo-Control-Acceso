from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db import IntegrityError

from .models import Visitor
from .serializers import VisitorSerializer, UserRegisterSerializer


class VisitorViewSet(viewsets.ModelViewSet):
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'full_name',
        'document_type',
        'document_number',
        'apartment',
        'visitor_type',
    ]
    ordering_fields = ['created_at']


class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password'],
            )
        except IntegrityError:
            return Response({'detail': 'El usuario ya existe'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Usuario creado'}, status=status.HTTP_201_CREATED)
