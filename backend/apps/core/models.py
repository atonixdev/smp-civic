"""
Core models for the SMP Civic platform.

These models provide shared functionality across all applications.
"""

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone


class TimestampedModel(models.Model):
    """
    Abstract base class that provides self-updating created and modified fields.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Tag(TimestampedModel):
    """
    Model for tagging content.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#007bff')  # Hex color
    
    class Meta:
        db_table = 'core_tag'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Category(TimestampedModel):
    """
    Model for categorizing content.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )
    icon = models.CharField(max_length=50, blank=True)
    
    class Meta:
        db_table = 'core_category'
        ordering = ['name']
        verbose_name_plural = 'categories'
    
    def __str__(self):
        if self.parent:
            return f"{self.parent.name} → {self.name}"
        return self.name