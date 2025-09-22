"""
Security middleware for SMP Civic platform.

Provides security headers, audit trails, and threat detection.
"""

import json
import time
import logging
from typing import Dict, Any, Optional
from django.conf import settings
from django.http import HttpRequest, HttpResponse
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.utils import timezone
from apps.security.models import AuditLog, AccessLog, SecurityIncident
from apps.security.threat_detection import ThreatDetector

User = get_user_model()
logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware to add security headers to all responses.
    """
    
    def process_response(self, request: HttpRequest, response: HttpResponse) -> HttpResponse:
        """Add security headers to the response."""
        
        # Content Security Policy
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self'",
            "connect-src 'self' ws: wss:",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]
        response['Content-Security-Policy'] = '; '.join(csp_directives)
        
        # Security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = (
            'accelerometer=(), camera=(), geolocation=(), '
            'gyroscope=(), magnetometer=(), microphone=(), '
            'payment=(), usb=()'
        )
        
        # HSTS header for HTTPS
        if request.is_secure():
            response['Strict-Transport-Security'] = (
                'max-age=31536000; includeSubDomains; preload'
            )
        
        # Custom SMP Civic headers
        response['X-SMP-Civic-Version'] = '1.0.0'
        response['X-SMP-Civic-Environment'] = settings.ENVIRONMENT
        
        return response


class AuditTrailMiddleware(MiddlewareMixin):
    """
    Middleware to create audit trails for all requests.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.threat_detector = ThreatDetector()
        super().__init__(get_response)
    
    def process_request(self, request: HttpRequest) -> None:
        """Process incoming request for audit logging."""
        request._audit_start_time = time.time()
        request._audit_data = {
            'method': request.method,
            'path': request.path,
            'query_params': dict(request.GET),
            'ip_address': self._get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'referer': request.META.get('HTTP_REFERER', ''),
        }
    
    def process_response(self, request: HttpRequest, response: HttpResponse) -> HttpResponse:
        """Process response and create audit log."""
        
        # Skip audit logging for certain paths
        skip_paths = ['/health/', '/static/', '/media/', '/admin/jsi18n/']
        if any(request.path.startswith(path) for path in skip_paths):
            return response
        
        # Calculate request duration
        duration = time.time() - getattr(request, '_audit_start_time', time.time())
        
        # Prepare audit data
        audit_data = getattr(request, '_audit_data', {})
        audit_data.update({
            'status_code': response.status_code,
            'response_size': len(response.content) if hasattr(response, 'content') else 0,
            'duration_ms': round(duration * 1000, 2),
            'timestamp': timezone.now().isoformat(),
        })
        
        # Determine if this is a suspicious request
        is_suspicious = self.threat_detector.analyze_request(request, response)
        
        # Create audit log entry
        try:
            AuditLog.objects.create(
                user=getattr(request, 'user', None) if hasattr(request, 'user') and request.user.is_authenticated else None,
                session_id=request.session.session_key if hasattr(request, 'session') else '',
                action=f"{request.method} {request.path}",
                resource_type='http_request',
                resource_id=request.path,
                new_values=audit_data,
                ip_address=audit_data['ip_address'],
                user_agent=audit_data['user_agent'],
                is_suspicious=is_suspicious,
                risk_score=self.threat_detector.calculate_risk_score(request, response),
            )
        except Exception as e:
            logger.error(f"Failed to create audit log: {e}")
        
        # Create security incident if suspicious
        if is_suspicious:
            self._create_security_incident(request, audit_data)
        
        return response
    
    def _get_client_ip(self, request: HttpRequest) -> str:
        """Get the real IP address of the client."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip
    
    def _create_security_incident(self, request: HttpRequest, audit_data: Dict[str, Any]) -> None:
        """Create a security incident for suspicious activity."""
        try:
            incident_id = f"INC-{timezone.now().strftime('%Y%m%d')}-{cache.get('incident_counter', 0) + 1:04d}"
            cache.set('incident_counter', cache.get('incident_counter', 0) + 1, 86400)  # Reset daily
            
            SecurityIncident.objects.create(
                incident_id=incident_id,
                title=f"Suspicious HTTP Request: {request.method} {request.path}",
                description=f"Suspicious activity detected from IP {audit_data['ip_address']}",
                severity='medium',
                status='open',
                source_ip=audit_data['ip_address'],
                attack_vector='http_request',
                indicators_of_compromise=[audit_data],
            )
        except Exception as e:
            logger.error(f"Failed to create security incident: {e}")


class RateLimitingMiddleware(MiddlewareMixin):
    """
    Middleware for rate limiting requests.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limits = {
            'default': (100, 60),  # 100 requests per minute
            'auth': (5, 60),       # 5 auth requests per minute
            'api': (1000, 3600),   # 1000 API requests per hour
        }
        super().__init__(get_response)
    
    def process_request(self, request: HttpRequest) -> Optional[HttpResponse]:
        """Check rate limits for the request."""
        
        # Determine rate limit category
        category = 'default'
        if request.path.startswith('/api/v1/auth/'):
            category = 'auth'
        elif request.path.startswith('/api/'):
            category = 'api'
        
        # Get client identifier
        client_id = self._get_client_identifier(request)
        
        # Check rate limit
        if self._is_rate_limited(client_id, category):
            return HttpResponse(
                json.dumps({'error': 'Rate limit exceeded'}),
                status=429,
                content_type='application/json'
            )
        
        return None
    
    def _get_client_identifier(self, request: HttpRequest) -> str:
        """Get a unique identifier for the client."""
        if hasattr(request, 'user') and request.user.is_authenticated:
            return f"user:{request.user.id}"
        else:
            return f"ip:{self._get_client_ip(request)}"
    
    def _get_client_ip(self, request: HttpRequest) -> str:
        """Get the real IP address of the client."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip
    
    def _is_rate_limited(self, client_id: str, category: str) -> bool:
        """Check if the client has exceeded the rate limit."""
        limit, window = self.rate_limits.get(category, self.rate_limits['default'])
        cache_key = f"rate_limit:{category}:{client_id}"
        
        current_count = cache.get(cache_key, 0)
        if current_count >= limit:
            return True
        
        # Increment counter
        cache.set(cache_key, current_count + 1, window)
        return False


class ThreatDetectionMiddleware(MiddlewareMixin):
    """
    Middleware for real-time threat detection.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.threat_detector = ThreatDetector()
        super().__init__(get_response)
    
    def process_request(self, request: HttpRequest) -> Optional[HttpResponse]:
        """Analyze request for potential threats."""
        
        # Check if IP is blacklisted
        client_ip = self._get_client_ip(request)
        if self.threat_detector.is_blacklisted_ip(client_ip):
            logger.warning(f"Blocked request from blacklisted IP: {client_ip}")
            return HttpResponse(
                json.dumps({'error': 'Access denied'}),
                status=403,
                content_type='application/json'
            )
        
        # Check for malicious patterns
        if self.threat_detector.detect_malicious_patterns(request):
            logger.warning(f"Blocked malicious request from IP: {client_ip}")
            return HttpResponse(
                json.dumps({'error': 'Request blocked'}),
                status=403,
                content_type='application/json'
            )
        
        return None
    
    def _get_client_ip(self, request: HttpRequest) -> str:
        """Get the real IP address of the client."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip


class EncryptionMiddleware(MiddlewareMixin):
    """
    Middleware for handling encrypted requests/responses.
    """
    
    def process_request(self, request: HttpRequest) -> None:
        """Decrypt encrypted request data if applicable."""
        
        # Check for encrypted content header
        if request.META.get('HTTP_X_SMP_ENCRYPTED') == 'true':
            try:
                # Decrypt request body here
                # This is a placeholder - implement actual decryption logic
                logger.info("Processing encrypted request")
            except Exception as e:
                logger.error(f"Failed to decrypt request: {e}")
    
    def process_response(self, request: HttpRequest, response: HttpResponse) -> HttpResponse:
        """Encrypt response data if requested."""
        
        # Check if client requested encrypted response
        if request.META.get('HTTP_X_SMP_ENCRYPT_RESPONSE') == 'true':
            try:
                # Encrypt response content here
                # This is a placeholder - implement actual encryption logic
                response['X-SMP-Encrypted'] = 'true'
                logger.info("Sending encrypted response")
            except Exception as e:
                logger.error(f"Failed to encrypt response: {e}")
        
        return response