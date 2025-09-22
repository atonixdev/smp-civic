"""
URL configuration for SMP Civic encryption services
"""

from django.urls import path
from . import views

app_name = 'encryption'

urlpatterns = [
    # Key management
    path('keys/', views.KeyManagementView.as_view(), name='key-management'),
    path('keys/public/', views.get_public_keys, name='public-keys'),
    path('status/', views.encryption_status, name='encryption-status'),
    
    # Content encryption
    path('content/encrypt/', views.EncryptContentView.as_view(), name='encrypt-content'),
    path('content/decrypt/', views.DecryptContentView.as_view(), name='decrypt-content'),
    
    # Secure messaging
    path('messages/', views.SecureMessagingView.as_view(), name='secure-messaging'),
]