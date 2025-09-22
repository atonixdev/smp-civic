"""
Django views for SMP Civic encryption services
"""

import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .core import encryption_manager, POST_QUANTUM_AVAILABLE
from .models import (
    EncryptionKeyPair, EncryptedContent, SecureMessage, 
    AuditLog, SecureVault, VaultAccess
)

User = get_user_model()


class KeyManagementView(APIView):
    """Manage user encryption keys"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user's encryption keys"""
        keys = EncryptionKeyPair.objects.filter(
            user=request.user, 
            is_active=True
        ).values('key_type', 'public_key', 'key_fingerprint', 'created_at', 'expires_at')
        
        return Response({
            'status': 'success',
            'keys': list(keys)
        })
    
    def post(self, request):
        """Generate new encryption key pair"""
        key_type = request.data.get('key_type', 'rsa')
        password = request.data.get('password')
        
        if not password:
            return Response({
                'status': 'error',
                'message': 'Password required for key encryption'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                # Deactivate existing keys of the same type
                EncryptionKeyPair.objects.filter(
                    user=request.user,
                    key_type=key_type,
                    is_active=True
                ).update(is_active=False)
                
                # Generate new key pair
                if key_type == 'rsa':
                    private_key, public_key = encryption_manager.generate_rsa_keypair()
                elif key_type == 'e2ee':
                    private_key, public_key = encryption_manager.generate_e2ee_keypair()
                elif key_type == 'post_quantum':
                    result = encryption_manager.generate_pq_keypair()
                    if not result:
                        return Response({
                            'status': 'error',
                            'message': 'Post-quantum cryptography not available'
                        }, status=status.HTTP_501_NOT_IMPLEMENTED)
                    private_key, public_key = result
                else:
                    return Response({
                        'status': 'error',
                        'message': 'Invalid key type'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Encrypt private key with user password
                key_for_encryption, salt = encryption_manager.derive_key_from_password(password)
                encrypted_private = encryption_manager.encrypt_symmetric(private_key, key_for_encryption)
                encrypted_private['salt'] = salt.hex()
                
                # Create fingerprint
                fingerprint = encryption_manager.hash_data(public_key)
                
                # Save key pair
                key_pair = EncryptionKeyPair.objects.create(
                    user=request.user,
                    key_type=key_type,
                    public_key=public_key.decode('ascii') if isinstance(public_key, bytes) else public_key,
                    private_key_encrypted=json.dumps(encrypted_private),
                    key_fingerprint=fingerprint
                )
                
                # Create audit log
                AuditLog.objects.create(
                    log_id=str(uuid.uuid4()),
                    action='key_generated',
                    user=request.user,
                    resource_type='encryption_key',
                    resource_id=key_pair.key_fingerprint,
                    metadata={'key_type': key_type}
                )
                
                return Response({
                    'status': 'success',
                    'message': f'{key_type.upper()} key pair generated successfully',
                    'key_fingerprint': fingerprint,
                    'public_key': key_pair.public_key
                })
                
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Key generation failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request):
        """Revoke encryption key"""
        key_fingerprint = request.data.get('key_fingerprint')
        
        if not key_fingerprint:
            return Response({
                'status': 'error',
                'message': 'Key fingerprint required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            key_pair = EncryptionKeyPair.objects.get(
                user=request.user,
                key_fingerprint=key_fingerprint,
                is_active=True
            )
            
            key_pair.is_active = False
            key_pair.revoked_at = datetime.now(timezone.utc)
            key_pair.save()
            
            # Create audit log
            AuditLog.objects.create(
                log_id=str(uuid.uuid4()),
                action='key_revoked',
                user=request.user,
                resource_type='encryption_key',
                resource_id=key_fingerprint,
                metadata={'key_type': key_pair.key_type}
            )
            
            return Response({
                'status': 'success',
                'message': 'Key revoked successfully'
            })
            
        except EncryptionKeyPair.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Key not found'
            }, status=status.HTTP_404_NOT_FOUND)


class EncryptContentView(APIView):
    """Encrypt and store content"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Encrypt content"""
        content = request.data.get('content')
        content_type = request.data.get('content_type', 'document')
        encryption_method = request.data.get('encryption_method', 'aes-256-gcm')
        recipients = request.data.get('recipients', [])
        
        if not content:
            return Response({
                'status': 'error',
                'message': 'Content required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            content_id = str(uuid.uuid4())
            
            if encryption_method == 'aes-256-gcm':
                # Symmetric encryption
                key = encryption_manager.generate_symmetric_key()
                encrypted_data = encryption_manager.encrypt_symmetric(content, key)
                
                # Store key encrypted with user's RSA key
                user_rsa_key = EncryptionKeyPair.objects.get(
                    user=request.user,
                    key_type='rsa',
                    is_active=True
                )
                encrypted_key = encryption_manager.encrypt_asymmetric(
                    key, user_rsa_key.public_key.encode()
                )
                encrypted_data['encrypted_key'] = encrypted_key
                
            elif encryption_method == 'rsa-4096-oaep+aes':
                # Asymmetric encryption
                user_rsa_key = EncryptionKeyPair.objects.get(
                    user=request.user,
                    key_type='rsa',
                    is_active=True
                )
                encrypted_data = encryption_manager.encrypt_asymmetric(
                    content, user_rsa_key.public_key.encode()
                )
            
            # Create content hash
            content_hash = encryption_manager.hash_data(content, 'SHA512')
            
            # Store encrypted content
            encrypted_content = EncryptedContent.objects.create(
                content_id=content_id,
                content_type=content_type,
                owner=request.user,
                algorithm=encryption_method,
                encrypted_data=json.dumps(encrypted_data) if isinstance(encrypted_data, dict) else encrypted_data,
                content_hash=content_hash,
                file_size=len(content.encode('utf-8'))
            )
            
            # Grant access to recipients
            for recipient_id in recipients:
                try:
                    recipient_user = User.objects.get(id=recipient_id)
                    encrypted_content.authorized_users.add(
                        recipient_user,
                        through_defaults={'access_level': 'read', 'granted_by': request.user}
                    )
                except User.DoesNotExist:
                    pass
            
            # Create audit log
            AuditLog.objects.create(
                log_id=str(uuid.uuid4()),
                action='content_encrypted',
                user=request.user,
                resource_type='encrypted_content',
                resource_id=content_id,
                metadata={
                    'content_type': content_type,
                    'encryption_method': encryption_method,
                    'recipients_count': len(recipients)
                }
            )
            
            return Response({
                'status': 'success',
                'message': 'Content encrypted successfully',
                'content_id': content_id,
                'content_hash': content_hash
            })
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Encryption failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DecryptContentView(APIView):
    """Decrypt content"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Decrypt content"""
        content_id = request.data.get('content_id')
        password = request.data.get('password')
        
        if not content_id or not password:
            return Response({
                'status': 'error',
                'message': 'Content ID and password required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get encrypted content
            encrypted_content = EncryptedContent.objects.get(content_id=content_id)
            
            # Check access permissions
            if encrypted_content.owner != request.user and not encrypted_content.authorized_users.filter(id=request.user.id).exists():
                return Response({
                    'status': 'error',
                    'message': 'Access denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get user's private key
            user_key = EncryptionKeyPair.objects.get(
                user=request.user,
                key_type='rsa',
                is_active=True
            )
            
            # Decrypt private key with password
            encrypted_private_data = json.loads(user_key.private_key_encrypted)
            salt = bytes.fromhex(encrypted_private_data['salt'])
            key_for_decryption, _ = encryption_manager.derive_key_from_password(password, salt)
            
            private_key = encryption_manager.decrypt_symmetric(encrypted_private_data, key_for_decryption)
            
            # Decrypt content
            encrypted_data = json.loads(encrypted_content.encrypted_data)
            
            if encrypted_content.algorithm == 'aes-256-gcm':
                # Decrypt symmetric key first
                symmetric_key = encryption_manager.decrypt_asymmetric(
                    encrypted_data['encrypted_key'], private_key
                )
                decrypted_content = encryption_manager.decrypt_symmetric(encrypted_data, symmetric_key)
            else:
                decrypted_content = encryption_manager.decrypt_asymmetric(
                    encrypted_content.encrypted_data, private_key
                )
            
            # Update access tracking
            encrypted_content.last_accessed = datetime.now(timezone.utc)
            encrypted_content.access_count += 1
            encrypted_content.save()
            
            # Create audit log
            AuditLog.objects.create(
                log_id=str(uuid.uuid4()),
                action='content_decrypted',
                user=request.user,
                resource_type='encrypted_content',
                resource_id=content_id,
                metadata={'algorithm': encrypted_content.algorithm}
            )
            
            return Response({
                'status': 'success',
                'content': decrypted_content.decode('utf-8'),
                'content_type': encrypted_content.content_type,
                'content_hash': encrypted_content.content_hash
            })
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Decryption failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SecureMessagingView(APIView):
    """End-to-end encrypted messaging"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user's encrypted messages"""
        messages = SecureMessage.objects.filter(
            recipient=request.user
        ).select_related('sender').order_by('-sent_at')
        
        message_list = []
        for msg in messages:
            message_list.append({
                'message_id': msg.message_id,
                'sender': msg.sender.username,
                'sent_at': msg.sent_at.isoformat(),
                'delivered_at': msg.delivered_at.isoformat() if msg.delivered_at else None,
                'read_at': msg.read_at.isoformat() if msg.read_at else None,
                'is_ephemeral': msg.is_ephemeral
            })
        
        return Response({
            'status': 'success',
            'messages': message_list
        })
    
    def post(self, request):
        """Send encrypted message"""
        recipient_username = request.data.get('recipient')
        message_content = request.data.get('message')
        subject = request.data.get('subject', '')
        is_ephemeral = request.data.get('is_ephemeral', False)
        
        if not recipient_username or not message_content:
            return Response({
                'status': 'error',
                'message': 'Recipient and message content required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            recipient = User.objects.get(username=recipient_username)
            
            # Get sender's E2EE private key
            sender_key = EncryptionKeyPair.objects.get(
                user=request.user,
                key_type='e2ee',
                is_active=True
            )
            
            # Get recipient's E2EE public key
            recipient_key = EncryptionKeyPair.objects.get(
                user=recipient,
                key_type='e2ee',
                is_active=True
            )
            
            # Decrypt sender's private key (simplified - would need password)
            sender_private_key = sender_key.private_key_encrypted.encode()  # Placeholder
            
            # Encrypt message
            encrypted_message = encryption_manager.encrypt_e2ee(
                message_content,
                recipient_key.public_key.encode(),
                sender_private_key
            )
            
            # Encrypt subject if provided
            encrypted_subject = ''
            if subject:
                encrypted_subject = encryption_manager.encrypt_e2ee(
                    subject,
                    recipient_key.public_key.encode(),
                    sender_private_key
                )
            
            # Create secure message
            message_id = str(uuid.uuid4())
            secure_message = SecureMessage.objects.create(
                message_id=message_id,
                sender=request.user,
                recipient=recipient,
                encrypted_content=encrypted_message,
                encrypted_subject=encrypted_subject,
                sender_public_key_fingerprint=sender_key.key_fingerprint,
                recipient_public_key_fingerprint=recipient_key.key_fingerprint,
                is_ephemeral=is_ephemeral
            )
            
            # Create audit log
            AuditLog.objects.create(
                log_id=str(uuid.uuid4()),
                action='message_sent',
                user=request.user,
                resource_type='secure_message',
                resource_id=message_id,
                metadata={
                    'recipient': recipient.username,
                    'is_ephemeral': is_ephemeral
                }
            )
            
            return Response({
                'status': 'success',
                'message': 'Message sent successfully',
                'message_id': message_id
            })
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Message sending failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_public_keys(request):
    """Get public keys for other users"""
    username = request.GET.get('username')
    key_type = request.GET.get('key_type', 'rsa')
    
    if not username:
        return Response({
            'status': 'error',
            'message': 'Username required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(username=username)
        key_pair = EncryptionKeyPair.objects.get(
            user=user,
            key_type=key_type,
            is_active=True
        )
        
        return Response({
            'status': 'success',
            'username': username,
            'key_type': key_type,
            'public_key': key_pair.public_key,
            'key_fingerprint': key_pair.key_fingerprint
        })
        
    except (User.DoesNotExist, EncryptionKeyPair.DoesNotExist):
        return Response({
            'status': 'error',
            'message': 'User or key not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def encryption_status(request):
    """Get encryption status and capabilities"""
    user_keys = EncryptionKeyPair.objects.filter(
        user=request.user,
        is_active=True
    ).values('key_type', 'created_at', 'expires_at')
    
    return Response({
        'status': 'success',
        'user_keys': list(user_keys),
        'post_quantum_available': POST_QUANTUM_AVAILABLE,
        'supported_algorithms': {
            'symmetric': ['AES-256-GCM'],
            'asymmetric': ['RSA-4096-OAEP'],
            'e2ee': ['Curve25519'],
            'post_quantum': ['Kyber1024', 'Dilithium5'] if encryption_manager.POST_QUANTUM_AVAILABLE else []
        }
    })