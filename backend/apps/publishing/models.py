"""
Publishing models for the SMP Civic platform.

Handles content creation, editing, and publication workflows.
"""

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from django.utils.text import slugify
from apps.core.models import (
    AuditableModel, SecurityLevel, ContentStatus, Tag, Category, FileUpload
)

User = get_user_model()


class Article(AuditableModel):
    """
    Main model for articles and journalistic content.
    """
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    excerpt = models.TextField(max_length=500, help_text="Brief summary of the article")
    content = models.TextField()
    content_encrypted = models.BooleanField(default=False)
    encryption_key_id = models.CharField(max_length=100, blank=True)
    
    # Publication details
    status = models.CharField(
        max_length=20,
        choices=ContentStatus.choices,
        default=ContentStatus.DRAFT
    )
    security_level = models.CharField(
        max_length=20,
        choices=SecurityLevel.choices,
        default=SecurityLevel.SUBSCRIBERS
    )
    published_at = models.DateTimeField(null=True, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Authorship and editing
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='authored_articles'
    )
    editors = models.ManyToManyField(
        User,
        through='ArticleEdit',
        related_name='edited_articles',
        blank=True
    )
    contributors = models.ManyToManyField(
        User,
        through='ArticleContribution',
        related_name='contributed_articles',
        blank=True
    )
    
    # Classification
    tags = models.ManyToManyField(Tag, blank=True, related_name='articles')
    categories = models.ManyToManyField(Category, blank=True, related_name='articles')
    
    # Media
    featured_image = models.ForeignKey(
        FileUpload,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='featured_articles'
    )
    attachments = models.ManyToManyField(
        FileUpload,
        blank=True,
        related_name='attached_articles'
    )
    
    # SEO and metadata
    meta_description = models.CharField(max_length=160, blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)
    canonical_url = models.URLField(blank=True)
    
    # Engagement metrics
    view_count = models.PositiveIntegerField(default=0)
    share_count = models.PositiveIntegerField(default=0)
    comment_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    
    # Source protection
    source_protection_level = models.CharField(
        max_length=20,
        choices=[
            ('none', 'No Protection'),
            ('basic', 'Basic Anonymization'),
            ('enhanced', 'Enhanced Protection'),
            ('maximum', 'Maximum Security'),
        ],
        default='basic'
    )
    confidential_sources = models.BooleanField(default=False)
    
    # Legal considerations
    legal_review_required = models.BooleanField(default=False)
    legal_review_completed = models.BooleanField(default=False)
    legal_reviewer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='legal_reviewed_articles'
    )
    legal_notes = models.TextField(blank=True)
    
    # Version control
    version = models.PositiveIntegerField(default=1)
    parent_article = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='revisions'
    )
    
    class Meta:
        db_table = 'publishing_article'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['author', 'created_at']),
            models.Index(fields=['slug']),
            models.Index(fields=['security_level']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse('article-detail', kwargs={'slug': self.slug})
    
    def is_published(self):
        return self.status == ContentStatus.PUBLISHED and self.published_at
    
    def can_be_viewed_by(self, user):
        """Check if a user can view this article."""
        if not user.is_authenticated:
            return self.security_level == SecurityLevel.PUBLIC
        
        return user.can_access_security_level(self.security_level)


class ArticleEdit(models.Model):
    """
    Through model for tracking article edits by editors.
    """
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    editor = models.ForeignKey(User, on_delete=models.CASCADE)
    edit_type = models.CharField(
        max_length=20,
        choices=[
            ('content', 'Content Edit'),
            ('copy', 'Copy Edit'),
            ('structure', 'Structural Edit'),
            ('fact_check', 'Fact Check'),
            ('legal', 'Legal Review'),
        ]
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'publishing_article_edit'
        ordering = ['-created_at']


class ArticleContribution(models.Model):
    """
    Through model for tracking article contributions.
    """
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    contributor = models.ForeignKey(User, on_delete=models.CASCADE)
    contribution_type = models.CharField(
        max_length=20,
        choices=[
            ('research', 'Research'),
            ('source', 'Source Information'),
            ('data', 'Data Analysis'),
            ('photo', 'Photography'),
            ('video', 'Videography'),
            ('translation', 'Translation'),
        ]
    )
    description = models.TextField(blank=True)
    credit_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'publishing_article_contribution'
        ordering = ['-created_at']


class PublicationVault(AuditableModel):
    """
    Secure vault for storing sensitive documents and sources.
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    security_level = models.CharField(
        max_length=20,
        choices=SecurityLevel.choices,
        default=SecurityLevel.CLASSIFIED
    )
    access_users = models.ManyToManyField(
        User,
        through='VaultAccess',
        related_name='accessible_vaults'
    )
    encryption_enabled = models.BooleanField(default=True)
    encryption_algorithm = models.CharField(max_length=50, default='kyber768')
    
    class Meta:
        db_table = 'publishing_vault'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class VaultAccess(models.Model):
    """
    Track vault access permissions and audit trail.
    """
    vault = models.ForeignKey(PublicationVault, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    permission_level = models.CharField(
        max_length=20,
        choices=[
            ('read', 'Read Only'),
            ('write', 'Read/Write'),
            ('admin', 'Administrator'),
        ]
    )
    granted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='granted_vault_access'
    )
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'publishing_vault_access'
        unique_together = ['vault', 'user']


class VaultDocument(AuditableModel):
    """
    Documents stored in secure vaults.
    """
    vault = models.ForeignKey(
        PublicationVault,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.ForeignKey(FileUpload, on_delete=models.CASCADE)
    document_type = models.CharField(
        max_length=50,
        choices=[
            ('source_material', 'Source Material'),
            ('interview_transcript', 'Interview Transcript'),
            ('document_leak', 'Leaked Document'),
            ('evidence', 'Evidence'),
            ('research_data', 'Research Data'),
            ('correspondence', 'Correspondence'),
        ]
    )
    confidentiality_level = models.CharField(
        max_length=20,
        choices=SecurityLevel.choices,
        default=SecurityLevel.CLASSIFIED
    )
    source_anonymous = models.BooleanField(default=True)
    source_notes = models.TextField(blank=True)
    verification_status = models.CharField(
        max_length=20,
        choices=[
            ('unverified', 'Unverified'),
            ('partial', 'Partially Verified'),
            ('verified', 'Verified'),
            ('disputed', 'Disputed'),
        ],
        default='unverified'
    )
    
    class Meta:
        db_table = 'publishing_vault_document'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.vault.name}: {self.title}"


class Comment(AuditableModel):
    """
    Comments on articles with encryption support.
    """
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    content = models.TextField()
    is_encrypted = models.BooleanField(default=False)
    encryption_key_id = models.CharField(max_length=100, blank=True)
    is_anonymous = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'publishing_comment'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.author.email} on {self.article.title}"


class Newsletter(AuditableModel):
    """
    Newsletter model for subscriber communications.
    """
    title = models.CharField(max_length=200)
    subject = models.CharField(max_length=200)
    content = models.TextField()
    html_content = models.TextField(blank=True)
    
    # Sending details
    sent_at = models.DateTimeField(null=True, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    recipient_count = models.PositiveIntegerField(default=0)
    open_count = models.PositiveIntegerField(default=0)
    click_count = models.PositiveIntegerField(default=0)
    
    # Security
    encryption_enabled = models.BooleanField(default=False)
    subscriber_security_level = models.CharField(
        max_length=20,
        choices=SecurityLevel.choices,
        default=SecurityLevel.SUBSCRIBERS
    )
    
    class Meta:
        db_table = 'publishing_newsletter'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title