"""
Celery configuration for SMP Civic project.
"""

import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smp_civic.settings')

app = Celery('smp_civic')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery beat schedule for periodic tasks
app.conf.beat_schedule = {
    'cleanup-expired-tokens': {
        'task': 'apps.authentication.tasks.cleanup_expired_tokens',
        'schedule': 60.0 * 60 * 24,  # Run daily
    },
    'audit-log-cleanup': {
        'task': 'apps.security.tasks.cleanup_old_audit_logs',
        'schedule': 60.0 * 60 * 24 * 7,  # Run weekly
    },
    'backup-critical-data': {
        'task': 'apps.core.tasks.backup_critical_data',
        'schedule': 60.0 * 60 * 6,  # Run every 6 hours
    },
    'generate-analytics-reports': {
        'task': 'apps.analytics.tasks.generate_daily_reports',
        'schedule': 60.0 * 60 * 24,  # Run daily
    },
}

app.conf.timezone = 'UTC'

@app.task(bind=True)
def debug_task(self):
    """Debug task for testing Celery functionality."""
    print(f'Request: {self.request!r}')