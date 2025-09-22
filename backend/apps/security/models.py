"""
Security models for the SMP Civic platform.

Handles cryptography, audit trails, and security monitoring.
"""

import uuid
import json
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.core.models import TimestampedModel, SecurityLevel

User = get_user_model()


class EncryptionKey(TimestampedModel):
    """
    Model for managing encryption keys with post-quantum cryptography support.
    """
    key_id = models.CharField(max_length=100, unique=True)
    algorithm = models.CharField(
        max_length=50,
        choices=[
            ('kyber512', 'CRYSTALS-Kyber-512'),
            ('kyber768', 'CRYSTALS-Kyber-768'),
            ('kyber1024', 'CRYSTALS-Kyber-1024'),
            ('dilithium2', 'CRYSTALS-Dilithium2'),
            ('dilithium3', 'CRYSTALS-Dilithium3'),
            ('dilithium5', 'CRYSTALS-Dilithium5'),
            ('aes256', 'AES-256-GCM'),
            ('chacha20', 'ChaCha20-Poly1305'),
        ]
    )
    public_key = models.TextField()
    private_key_encrypted = models.TextField()
    key_purpose = models.CharField(
        max_length=50,
        choices=[
            ('document_encryption', 'Document Encryption'),
            ('communication', 'Communication'),
            ('digital_signature', 'Digital Signature'),
            ('key_exchange', 'Key Exchange'),
        ]
    )
    security_level = models.CharField(
        max_length=20,
        choices=SecurityLevel.choices,
        default=SecurityLevel.RESTRICTED
    )
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        db_table = 'security_encryption_key'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.algorithm} key {self.key_id}"
    
    def is_expired(self):
        """Check if the key is expired."""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False


class AuditLog(TimestampedModel):
    """
    Comprehensive audit logging for all system operations.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    session_id = models.CharField(max_length=100, blank=True)
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=50)
    resource_id = models.CharField(max_length=100, blank=True)
    old_values = models.JSONField(default=dict, blank=True)
    new_values = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    risk_score = models.FloatField(default=0.0)
    is_suspicious = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'security_audit_log'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['action', 'created_at']),
            models.Index(fields=['resource_type', 'resource_id']),
            models.Index(fields=['is_suspicious', 'created_at']),
        ]
    
    def __str__(self):
        user_str = self.user.email if self.user else 'Anonymous'
        return f"{user_str} - {self.action} on {self.resource_type}"


class SecurityIncident(TimestampedModel):
    """
    Model for tracking security incidents and threats.
    """
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('investigating', 'Under Investigation'),
        ('contained', 'Contained'),
        ('resolved', 'Resolved'),
        ('false_positive', 'False Positive'),
    ]
    
    incident_id = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    affected_users = models.ManyToManyField(User, blank=True, related_name='security_incidents')
    affected_resources = models.JSONField(default=list)
    source_ip = models.GenericIPAddressField(null=True, blank=True)
    attack_vector = models.CharField(max_length=100, blank=True)
    indicators_of_compromise = models.JSONField(default=list)
    mitigation_actions = models.TextField(blank=True)
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_incidents'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'security_incident'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.incident_id}: {self.title}"


class AccessLog(TimestampedModel):
    """
    Model for logging resource access attempts.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='access_logs'
    )
    resource_type = models.CharField(max_length=50)
    resource_id = models.CharField(max_length=100)
    action = models.CharField(max_length=50)
    success = models.BooleanField()
    denial_reason = models.CharField(max_length=200, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    security_level_required = models.CharField(
        max_length=20,
        choices=SecurityLevel.choices
    )
    user_security_level = models.CharField(
        max_length=20,
        choices=SecurityLevel.choices
    )
    
    class Meta:
        db_table = 'security_access_log'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['success', 'created_at']),
            models.Index(fields=['resource_type', 'resource_id']),
        ]
    
    def __str__(self):
        user_str = self.user.email if self.user else 'Anonymous'
        status = 'Success' if self.success else 'Denied'
        return f"{user_str} - {status} access to {self.resource_type}"


class ThreatIntelligence(TimestampedModel):
    """
    Model for storing threat intelligence data.
    """
    THREAT_TYPES = [
        ('malware', 'Malware'),
        ('phishing', 'Phishing'),
        ('data_breach', 'Data Breach'),
        ('ddos', 'DDoS Attack'),
        ('social_engineering', 'Social Engineering'),
        ('insider_threat', 'Insider Threat'),
        ('supply_chain', 'Supply Chain Attack'),
    ]
    
    threat_id = models.CharField(max_length=100, unique=True)
    threat_type = models.CharField(max_length=50, choices=THREAT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    indicators = models.JSONField(default=list)
    severity_score = models.FloatField()
    confidence_level = models.FloatField()
    source = models.CharField(max_length=100)
    tags = models.JSONField(default=list)
    mitigations = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'security_threat_intelligence'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.threat_id}: {self.title}"


class CryptographicOperation(TimestampedModel):
    """
    Model for logging cryptographic operations for audit purposes.
    """
    OPERATION_TYPES = [
        ('encrypt', 'Encryption'),
        ('decrypt', 'Decryption'),
        ('sign', 'Digital Signature'),
        ('verify', 'Signature Verification'),
        ('key_generation', 'Key Generation'),
        ('key_exchange', 'Key Exchange'),
    ]
    
    operation_id = models.CharField(max_length=100, unique=True)
    operation_type = models.CharField(max_length=20, choices=OPERATION_TYPES)
    algorithm = models.CharField(max_length=50)
    key_id = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    resource_type = models.CharField(max_length=50, blank=True)
    resource_id = models.CharField(max_length=100, blank=True)
    success = models.BooleanField()
    error_message = models.TextField(blank=True)
    execution_time_ms = models.PositiveIntegerField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'security_cryptographic_operation'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['operation_type', 'created_at']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['key_id', 'created_at']),
        ]
    
    def __str__(self):
        user_str = self.user.email if self.user else 'System'
        return f"{user_str} - {self.operation_type} using {self.algorithm}"


class SecurityConfiguration(TimestampedModel):
    """
    Model for storing security configuration settings.
    """
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField()
    category = models.CharField(
        max_length=50,
        choices=[
            ('authentication', 'Authentication'),
            ('encryption', 'Encryption'),
            ('access_control', 'Access Control'),
            ('monitoring', 'Security Monitoring'),
            ('compliance', 'Compliance'),
        ]
    )
    is_sensitive = models.BooleanField(default=False)
    requires_restart = models.BooleanField(default=False)
    last_modified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        db_table = 'security_configuration'
        ordering = ['category', 'key']
    
    def __str__(self):
        return f"{self.category}: {self.key}"