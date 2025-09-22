"""
Threat detection system for SMP Civic platform.

Provides real-time threat analysis and detection capabilities.
"""

import re
import logging
from typing import Dict, List, Any, Optional
from django.http import HttpRequest, HttpResponse
from django.core.cache import cache
from django.conf import settings
import json

logger = logging.getLogger(__name__)


class ThreatDetector:
    """
    Real-time threat detection and analysis system.
    """
    
    def __init__(self):
        self.malicious_patterns = self._load_malicious_patterns()
        self.suspicious_user_agents = self._load_suspicious_user_agents()
        self.blacklisted_ips = self._load_blacklisted_ips()
    
    def analyze_request(self, request: HttpRequest, response: HttpResponse) -> bool:
        """
        Analyze a request/response pair for suspicious activity.
        
        Args:
            request: The HTTP request
            response: The HTTP response
            
        Returns:
            True if suspicious activity is detected, False otherwise
        """
        suspicious_indicators = []
        
        # Check for malicious patterns
        if self.detect_malicious_patterns(request):
            suspicious_indicators.append('malicious_patterns')
        
        # Check for suspicious user agents
        if self.detect_suspicious_user_agent(request):
            suspicious_indicators.append('suspicious_user_agent')
        
        # Check for unusual request patterns
        if self.detect_unusual_patterns(request):
            suspicious_indicators.append('unusual_patterns')
        
        # Check for high-frequency requests
        if self.detect_high_frequency_requests(request):
            suspicious_indicators.append('high_frequency')
        
        # Check for SQL injection attempts
        if self.detect_sql_injection(request):
            suspicious_indicators.append('sql_injection')
        
        # Check for XSS attempts
        if self.detect_xss_attempts(request):
            suspicious_indicators.append('xss_attempt')
        
        # Check for path traversal attempts
        if self.detect_path_traversal(request):
            suspicious_indicators.append('path_traversal')
        
        # Log suspicious activity
        if suspicious_indicators:
            logger.warning(
                f"Suspicious activity detected from {self._get_client_ip(request)}: "
                f"{', '.join(suspicious_indicators)}"
            )
            
            # Store in cache for further analysis
            cache_key = f"suspicious_activity:{self._get_client_ip(request)}"
            cache.set(cache_key, suspicious_indicators, 3600)  # Store for 1 hour
        
        return len(suspicious_indicators) > 0
    
    def calculate_risk_score(self, request: HttpRequest, response: HttpResponse) -> float:
        """
        Calculate a risk score for the request.
        
        Args:
            request: The HTTP request
            response: The HTTP response
            
        Returns:
            Risk score between 0.0 and 10.0
        """
        risk_score = 0.0
        
        # Base score factors
        if response.status_code >= 400:
            risk_score += 1.0
        
        if response.status_code == 403:
            risk_score += 2.0
        
        if response.status_code >= 500:
            risk_score += 3.0
        
        # Check request characteristics
        if self.detect_malicious_patterns(request):
            risk_score += 4.0
        
        if self.detect_sql_injection(request):
            risk_score += 5.0
        
        if self.detect_xss_attempts(request):
            risk_score += 4.0
        
        if self.detect_path_traversal(request):
            risk_score += 3.0
        
        # Check client characteristics
        client_ip = self._get_client_ip(request)
        if self.is_blacklisted_ip(client_ip):
            risk_score += 6.0
        
        if self.detect_suspicious_user_agent(request):
            risk_score += 2.0
        
        # Check frequency
        if self.detect_high_frequency_requests(request):
            risk_score += 2.0
        
        return min(risk_score, 10.0)  # Cap at 10.0
    
    def detect_malicious_patterns(self, request: HttpRequest) -> bool:
        """Detect malicious patterns in the request."""
        
        # Check URL path
        path = request.path.lower()
        for pattern in self.malicious_patterns['paths']:
            if re.search(pattern, path):
                return True
        
        # Check query parameters
        query_string = request.META.get('QUERY_STRING', '').lower()
        for pattern in self.malicious_patterns['query']:
            if re.search(pattern, query_string):
                return True
        
        # Check POST data if available
        if hasattr(request, 'body') and request.body:
            try:
                body_str = request.body.decode('utf-8').lower()
                for pattern in self.malicious_patterns['body']:
                    if re.search(pattern, body_str):
                        return True
            except UnicodeDecodeError:
                # Binary data, skip pattern matching
                pass
        
        return False
    
    def detect_suspicious_user_agent(self, request: HttpRequest) -> bool:
        """Detect suspicious user agents."""
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
        
        for pattern in self.suspicious_user_agents:
            if re.search(pattern, user_agent):
                return True
        
        return False
    
    def detect_unusual_patterns(self, request: HttpRequest) -> bool:
        """Detect unusual request patterns."""
        
        # Check for unusual HTTP methods
        if request.method not in ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']:
            return True
        
        # Check for unusual headers
        suspicious_headers = [
            'x-originating-ip', 'x-forwarded-server', 'x-remote-ip',
            'x-remote-addr', 'x-cluster-client-ip'
        ]
        
        for header in suspicious_headers:
            if header in request.META:
                return True
        
        # Check for missing common headers
        if request.method == 'POST' and 'HTTP_CONTENT_TYPE' not in request.META:
            return True
        
        return False
    
    def detect_high_frequency_requests(self, request: HttpRequest) -> bool:
        """Detect high-frequency requests from the same IP."""
        client_ip = self._get_client_ip(request)
        cache_key = f"request_count:{client_ip}"
        
        current_count = cache.get(cache_key, 0)
        cache.set(cache_key, current_count + 1, 60)  # Count for 1 minute
        
        # Threshold: more than 100 requests per minute
        return current_count > 100
    
    def detect_sql_injection(self, request: HttpRequest) -> bool:
        """Detect SQL injection attempts."""
        sql_patterns = [
            r"('|(\\'))(;|<|>|[\\s]*union[\\s]+select|[\\s]*delete[\\s]+from|[\\s]*insert[\\s]+into|[\\s]*drop[\\s]+table)",
            r"union[\\s]+select",
            r"(select|insert|update|delete|drop|create|alter)[\\s]+",
            r"(exec|execute)[\\s]*\\(",
            r"script[\\s]*:",
            r"<[\\s]*script",
        ]
        
        # Check URL path and query parameters
        full_url = request.get_full_path().lower()
        for pattern in sql_patterns:
            if re.search(pattern, full_url, re.IGNORECASE):
                return True
        
        # Check POST data
        if hasattr(request, 'body') and request.body:
            try:
                body_str = request.body.decode('utf-8').lower()
                for pattern in sql_patterns:
                    if re.search(pattern, body_str, re.IGNORECASE):
                        return True
            except UnicodeDecodeError:
                pass
        
        return False
    
    def detect_xss_attempts(self, request: HttpRequest) -> bool:
        """Detect XSS (Cross-Site Scripting) attempts."""
        xss_patterns = [
            r"<[\\s]*script",
            r"javascript[\\s]*:",
            r"vbscript[\\s]*:",
            r"on(load|error|click|mouseover)[\\s]*=",
            r"<[\\s]*iframe",
            r"<[\\s]*object",
            r"<[\\s]*embed",
            r"eval[\\s]*\\(",
            r"alert[\\s]*\\(",
        ]
        
        # Check URL path and query parameters
        full_url = request.get_full_path().lower()
        for pattern in xss_patterns:
            if re.search(pattern, full_url, re.IGNORECASE):
                return True
        
        # Check POST data
        if hasattr(request, 'body') and request.body:
            try:
                body_str = request.body.decode('utf-8').lower()
                for pattern in xss_patterns:
                    if re.search(pattern, body_str, re.IGNORECASE):
                        return True
            except UnicodeDecodeError:
                pass
        
        return False
    
    def detect_path_traversal(self, request: HttpRequest) -> bool:
        """Detect path traversal attempts."""
        path_patterns = [
            r"\\.\\./",
            r"\\.\\.\\\\",
            r"%2e%2e%2f",
            r"%2e%2e%5c",
            r"\\.\\.%2f",
            r"\\.\\.%5c",
        ]
        
        path = request.path.lower()
        query_string = request.META.get('QUERY_STRING', '').lower()
        
        for pattern in path_patterns:
            if re.search(pattern, path) or re.search(pattern, query_string):
                return True
        
        return False
    
    def is_blacklisted_ip(self, ip_address: str) -> bool:
        """Check if an IP address is blacklisted."""
        return ip_address in self.blacklisted_ips
    
    def _get_client_ip(self, request: HttpRequest) -> str:
        """Get the real IP address of the client."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip
    
    def _load_malicious_patterns(self) -> Dict[str, List[str]]:
        """Load malicious patterns for detection."""
        return {
            'paths': [
                r'/admin/config\.php',
                r'/wp-admin/',
                r'/phpmyadmin/',
                r'/\\.git/',
                r'/\\.env',
                r'/config/',
                r'/backup/',
                r'/test/',
                r'/temp/',
                r'/debug/',
            ],
            'query': [
                r'cmd=',
                r'exec=',
                r'command=',
                r'shell=',
                r'system=',
                r'passwd',
                r'/etc/',
                r'ping[\\s]+',
                r'nslookup[\\s]+',
            ],
            'body': [
                r'<\\?php',
                r'<%[\\s]*eval',
                r'system[\\s]*\\(',
                r'exec[\\s]*\\(',
                r'shell_exec[\\s]*\\(',
                r'passthru[\\s]*\\(',
            ]
        }
    
    def _load_suspicious_user_agents(self) -> List[str]:
        """Load suspicious user agent patterns."""
        return [
            r'sqlmap',
            r'nikto',
            r'dirb',
            r'nmap',
            r'masscan',
            r'zap',
            r'burp',
            r'havij',
            r'acunetix',
            r'nessus',
            r'openvas',
            r'w3af',
            r'skipfish',
            r'grabber',
            r'wpscan',
            r'joomscan',
            r'python-requests',
            r'curl/',
            r'wget/',
            r'httperf',
            r'ab/',  # Apache Bench
        ]
    
    def _load_blacklisted_ips(self) -> List[str]:
        """Load blacklisted IP addresses."""
        # In production, this would load from a database or external threat feed
        return [
            '0.0.0.0',  # Invalid IP
            '127.0.0.1',  # Localhost (for testing)
            # Add known malicious IPs here
        ]


class IntrusionDetectionSystem:
    """
    Advanced intrusion detection system for SMP Civic.
    """
    
    def __init__(self):
        self.threat_detector = ThreatDetector()
        self.baseline_metrics = self._load_baseline_metrics()
    
    def analyze_traffic_patterns(self, timeframe: int = 3600) -> Dict[str, Any]:
        """
        Analyze traffic patterns for anomalies.
        
        Args:
            timeframe: Time window in seconds to analyze
            
        Returns:
            Dictionary containing analysis results
        """
        # This would implement statistical analysis of traffic patterns
        # For now, return a placeholder
        return {
            'anomalies_detected': 0,
            'threat_level': 'low',
            'recommendations': [],
        }
    
    def detect_insider_threats(self, user_id: str) -> Dict[str, Any]:
        """
        Detect potential insider threats based on user behavior.
        
        Args:
            user_id: The user ID to analyze
            
        Returns:
            Dictionary containing threat assessment
        """
        # This would implement behavioral analysis
        # For now, return a placeholder
        return {
            'risk_score': 0.0,
            'behavioral_anomalies': [],
            'recommended_actions': [],
        }
    
    def _load_baseline_metrics(self) -> Dict[str, float]:
        """Load baseline metrics for anomaly detection."""
        # In production, this would load from historical data
        return {
            'avg_requests_per_minute': 100.0,
            'avg_response_time': 200.0,
            'avg_error_rate': 0.01,
        }