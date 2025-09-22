"""
Publishing app configuration.
"""

from django.apps import AppConfig


class PublishingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.publishing'
    verbose_name = 'Publishing'

    def ready(self):
        """Initialize the publishing app when Django starts."""
        import apps.publishing.signals  # noqa