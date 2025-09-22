"""
Authentication app URL configuration.
"""
from django.urls import path
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def auth_status(request):
    """Simple auth status endpoint."""
    return Response({
        "status": "ok",
        "app": "authentication",
        "message": "Authentication API is working"
    })

urlpatterns = [
    path('status/', auth_status, name='auth_status'),
]