"""
Core app URL configuration.
"""
from django.urls import path
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def core_status(request):
    """Simple core status endpoint."""
    return Response({
        "status": "ok",
        "app": "core",
        "message": "Core API is working"
    })

urlpatterns = [
    path('status/', core_status, name='core_status'),
]