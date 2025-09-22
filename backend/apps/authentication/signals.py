"""
Signals for the authentication app.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User


@receiver(post_save, sender=User)
def user_created(sender, instance, created, **kwargs):
    """Handle user creation events."""
    if created:
        # Log user creation or send welcome email
        pass