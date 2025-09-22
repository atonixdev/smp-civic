"""
URL configuration for smp_civic project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

# Admin site customization
admin.site.site_header = "SMP Civic Administration"
admin.site.site_title = "SMP Civic Admin Portal"
admin.site.index_title = "Welcome to SMP Civic Administration"

def health_check(request):
    """Simple health check endpoint."""
    return JsonResponse({"status": "healthy", "service": "smp-civic"})

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # Health check endpoint
    path('health/', health_check, name='health'),
    
    # API endpoints
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/core/', include('apps.core.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)