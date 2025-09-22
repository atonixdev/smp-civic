"""
Django models for SMP Civic encryption system
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import json

User = get_user_model()


class EncryptionKeyPair(models.Model):
    """Store user encryption key pairs"""
    
    KEY_TYPES = [
        ('rsa', 'RSA Asymmetric'),
        ('e2ee', 'End-to-End Encryption'),
        ('post_quantum', 'Post-Quantum'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='encryption_keys')
    key_type = models.CharField(max_length=20, choices=KEY_TYPES)
    public_key = models.TextField(help_text="Base64 encoded public key")
    private_key_encrypted = models.TextField(help_text="Encrypted private key (user password protected)")
    key_fingerprint = models.CharField(max_length=64, unique=True, help_text="SHA256 fingerprint of public key")
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True, help_text="Key expiration date")
    is_active = models.BooleanField(default=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'key_type', 'is_active']
        indexes = [
            models.Index(fields=['user', 'key_type']),
            models.Index(fields=['key_fingerprint']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.get_key_type_display()}"


class EncryptedContent(models.Model):
    """Store encrypted content with metadata"""
    
    CONTENT_TYPES = [
        ('document', 'Document'),
        ('message', 'Message'),
        ('file', 'File'),
        ('metadata', 'Metadata'),
    ]
    
    ENCRYPTION_ALGORITHMS = [
        ('aes-256-gcm', 'AES-256-GCM'),
        ('rsa-4096-oaep+aes', 'RSA-4096-OAEP+AES-256'),
        ('curve25519+aes', 'Curve25519+AES-256'),
        ('kyber1024+aes', 'Kyber1024+AES-256'),
    ]
    
    content_id = models.CharField(max_length=64, unique=True, help_text="Unique content identifier")
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='encrypted_content')
    
    # Encryption details
    algorithm = models.CharField(max_length=50, choices=ENCRYPTION_ALGORITHMS)
    encrypted_data = models.TextField(help_text="Base64 encoded encrypted content")
    encryption_metadata = models.JSONField(default=dict, help_text="Nonces, tags, etc.")
    
    # Access control
    authorized_users = models.ManyToManyField(User, through='ContentAccess', related_name='accessible_content')
    
    # Audit trail
    created_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(null=True, blank=True)
    access_count = models.PositiveIntegerField(default=0)
    
    # File integrity
    content_hash = models.CharField(max_length=128, help_text="SHA512 hash of original content")
    file_size = models.PositiveIntegerField(help_text="Size in bytes")
    
    class Meta:
        indexes = [
            models.Index(fields=['owner', 'content_type']),
            models.Index(fields=['content_id']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.content_type}: {self.content_id}"


class ContentAccess(models.Model):
    """Track access permissions for encrypted content"""
    
    ACCESS_LEVELS = [
        ('read', 'Read Only'),
        ('write', 'Read/Write'),
        ('admin', 'Full Control'),
    ]
    
    content = models.ForeignKey(EncryptedContent, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    access_level = models.CharField(max_length=10, choices=ACCESS_LEVELS)
    granted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='granted_access')
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['content', 'user']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['content', 'access_level']),
        ]


class SecureMessage(models.Model):
    """End-to-end encrypted messaging"""
    
    message_id = models.CharField(max_length=64, unique=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    
    # Encryption details
    encrypted_content = models.TextField(help_text="E2EE encrypted message")
    sender_public_key_fingerprint = models.CharField(max_length=64)
    recipient_public_key_fingerprint = models.CharField(max_length=64)
    
    # Message metadata (encrypted)
    encrypted_subject = models.TextField(blank=True)
    encrypted_metadata = models.JSONField(default=dict)
    
    # Timestamps
    sent_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Security features
    is_ephemeral = models.BooleanField(default=False, help_text="Auto-delete after reading")
    delete_after_hours = models.PositiveIntegerField(null=True, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['sender', 'sent_at']),
            models.Index(fields=['recipient', 'sent_at']),
            models.Index(fields=['message_id']),
        ]
    
    def __str__(self):
        return f"Message from {self.sender.username} to {self.recipient.username}"


class AuditLog(models.Model):
    """Tamper-proof audit logging"""
    
    ACTION_TYPES = [
        ('key_generated', 'Key Generated'),
        ('key_revoked', 'Key Revoked'),
        ('content_encrypted', 'Content Encrypted'),
        ('content_decrypted', 'Content Decrypted'),
        ('content_shared', 'Content Shared'),
        ('message_sent', 'Message Sent'),
        ('message_read', 'Message Read'),
        ('access_granted', 'Access Granted'),
        ('access_revoked', 'Access Revoked'),
    ]
    
    log_id = models.CharField(max_length=64, unique=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    action = models.CharField(max_length=30, choices=ACTION_TYPES)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='audit_logs')
    
    # Log details
    resource_type = models.CharField(max_length=50)
    resource_id = models.CharField(max_length=64)
    metadata = models.JSONField(default=dict)
    
    # Tamper protection
    content_hash = models.CharField(max_length=128, help_text="SHA512 hash of log entry")
    signature = models.CharField(max_length=128, help_text="Cryptographic signature")
    
    # Network info
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['resource_type', 'resource_id']),
        ]
    
    def __str__(self):
        return f"{self.action} by {self.user.username} at {self.timestamp}"


class SecureVault(models.Model):
    """Encrypted file vault for journalists"""
    
    vault_id = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vaults')
    
    # Vault encryption
    vault_key_encrypted = models.TextField(help_text="Encrypted vault master key")
    encryption_algorithm = models.CharField(max_length=50, default='aes-256-gcm')
    
    # Access control
    collaborators = models.ManyToManyField(User, through='VaultAccess', related_name='accessible_vaults')
    
    # Vault settings
    is_shared = models.BooleanField(default=False)
    auto_backup = models.BooleanField(default=True)
    retention_days = models.PositiveIntegerField(default=365, help_text="Data retention in days")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['owner', 'created_at']),
            models.Index(fields=['vault_id']),
        ]
    
    def __str__(self):
        return f"Vault: {self.name} (Owner: {self.owner.username})"


class VaultAccess(models.Model):
    """Access control for secure vaults"""
    
    ACCESS_LEVELS = [
        ('viewer', 'View Only'),
        ('contributor', 'View/Upload'),
        ('editor', 'View/Upload/Delete'),
        ('admin', 'Full Control'),
    ]
    
    vault = models.ForeignKey(SecureVault, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    access_level = models.CharField(max_length=20, choices=ACCESS_LEVELS)
    granted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vault_access_granted')
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['vault', 'user']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['vault', 'access_level']),
        ]