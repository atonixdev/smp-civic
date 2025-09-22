"""
Post-quantum cryptography utilities for SMP Civic platform.

This module provides quantum-safe cryptographic operations using
CRYSTALS-Kyber for key encapsulation and CRYSTALS-Dilithium for digital signatures.
"""

import os
import base64
import hashlib
import secrets
from typing import Tuple, Optional, Dict, Any
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305, AESGCM
import logging

# Post-quantum cryptography imports (placeholder for actual implementation)
# In production, these would use actual PQC libraries like liboqs-python
try:
    # Placeholder imports - replace with actual PQC library
    # from oqs import KeyEncapsulation, Signature
    pass
except ImportError:
    # Fallback to classical cryptography with plans for PQC migration
    pass

logger = logging.getLogger(__name__)


class PostQuantumCrypto:
    """
    Post-quantum cryptography handler for SMP Civic platform.
    
    Currently implements classical cryptography with a design that allows
    easy migration to post-quantum algorithms when production-ready libraries
    are available.
    """
    
    def __init__(self):
        self.kyber_variant = os.getenv('KYBER_VARIANT', 'kyber768')
        self.dilithium_variant = os.getenv('DILITHIUM_VARIANT', 'dilithium3')
        self.pqc_enabled = os.getenv('PQC_ENABLED', 'True').lower() == 'true'
    
    def generate_keypair(self, algorithm: str = 'kyber768') -> Tuple[bytes, bytes]:
        """
        Generate a key pair for the specified algorithm.
        
        Args:
            algorithm: The cryptographic algorithm ('kyber768', 'dilithium3', etc.)
            
        Returns:
            Tuple of (public_key, private_key) as bytes
        """
        if algorithm.startswith('kyber'):
            return self._generate_kyber_keypair(algorithm)
        elif algorithm.startswith('dilithium'):
            return self._generate_dilithium_keypair(algorithm)
        else:
            # Fallback to RSA for now
            return self._generate_rsa_keypair()
    
    def _generate_kyber_keypair(self, variant: str) -> Tuple[bytes, bytes]:
        """Generate CRYSTALS-Kyber key pair (placeholder implementation)."""
        # Placeholder: In production, use actual Kyber implementation
        # For now, generate RSA keys as fallback
        logger.warning(f"Using RSA fallback for {variant} key generation")
        return self._generate_rsa_keypair()
    
    def _generate_dilithium_keypair(self, variant: str) -> Tuple[bytes, bytes]:
        """Generate CRYSTALS-Dilithium key pair (placeholder implementation)."""
        # Placeholder: In production, use actual Dilithium implementation
        logger.warning(f"Using RSA fallback for {variant} key generation")
        return self._generate_rsa_keypair()
    
    def _generate_rsa_keypair(self) -> Tuple[bytes, bytes]:
        """Generate RSA key pair as fallback."""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=4096
        )
        public_key = private_key.public_key()
        
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        return public_pem, private_pem
    
    def encapsulate_key(self, public_key: bytes) -> Tuple[bytes, bytes]:
        """
        Perform key encapsulation using Kyber algorithm.
        
        Args:
            public_key: The public key for encapsulation
            
        Returns:
            Tuple of (ciphertext, shared_secret)
        """
        # Placeholder: In production, use actual Kyber encapsulation
        # For now, generate a random shared secret and encrypt with RSA
        shared_secret = secrets.token_bytes(32)
        
        try:
            public_key_obj = serialization.load_pem_public_key(public_key)
            ciphertext = public_key_obj.encrypt(
                shared_secret,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            return ciphertext, shared_secret
        except Exception as e:
            logger.error(f"Key encapsulation failed: {e}")
            raise
    
    def decapsulate_key(self, private_key: bytes, ciphertext: bytes) -> bytes:
        """
        Perform key decapsulation using Kyber algorithm.
        
        Args:
            private_key: The private key for decapsulation
            ciphertext: The ciphertext from encapsulation
            
        Returns:
            The shared secret
        """
        # Placeholder: In production, use actual Kyber decapsulation
        try:
            private_key_obj = serialization.load_pem_private_key(private_key, password=None)
            shared_secret = private_key_obj.decrypt(
                ciphertext,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            return shared_secret
        except Exception as e:
            logger.error(f"Key decapsulation failed: {e}")
            raise
    
    def sign_data(self, private_key: bytes, data: bytes) -> bytes:
        """
        Sign data using Dilithium algorithm.
        
        Args:
            private_key: The private signing key
            data: The data to sign
            
        Returns:
            The digital signature
        """
        # Placeholder: In production, use actual Dilithium signing
        try:
            private_key_obj = serialization.load_pem_private_key(private_key, password=None)
            signature = private_key_obj.sign(
                data,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return signature
        except Exception as e:
            logger.error(f"Data signing failed: {e}")
            raise
    
    def verify_signature(self, public_key: bytes, data: bytes, signature: bytes) -> bool:
        """
        Verify signature using Dilithium algorithm.
        
        Args:
            public_key: The public verification key
            data: The original data
            signature: The signature to verify
            
        Returns:
            True if signature is valid, False otherwise
        """
        # Placeholder: In production, use actual Dilithium verification
        try:
            public_key_obj = serialization.load_pem_public_key(public_key)
            public_key_obj.verify(
                signature,
                data,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return True
        except Exception as e:
            logger.error(f"Signature verification failed: {e}")
            return False


class SymmetricEncryption:
    """
    Symmetric encryption utilities using quantum-safe algorithms.
    """
    
    @staticmethod
    def generate_key() -> bytes:
        """Generate a random encryption key."""
        return secrets.token_bytes(32)
    
    @staticmethod
    def encrypt_data(key: bytes, data: bytes, algorithm: str = 'chacha20') -> bytes:
        """
        Encrypt data using the specified algorithm.
        
        Args:
            key: The encryption key
            data: The data to encrypt
            algorithm: The encryption algorithm ('chacha20' or 'aes256')
            
        Returns:
            The encrypted data with nonce prepended
        """
        if algorithm == 'chacha20':
            cipher = ChaCha20Poly1305(key)
            nonce = os.urandom(12)
            ciphertext = cipher.encrypt(nonce, data, None)
            return nonce + ciphertext
        elif algorithm == 'aes256':
            cipher = AESGCM(key)
            nonce = os.urandom(12)
            ciphertext = cipher.encrypt(nonce, data, None)
            return nonce + ciphertext
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm}")
    
    @staticmethod
    def decrypt_data(key: bytes, encrypted_data: bytes, algorithm: str = 'chacha20') -> bytes:
        """
        Decrypt data using the specified algorithm.
        
        Args:
            key: The decryption key
            encrypted_data: The encrypted data with nonce prepended
            algorithm: The encryption algorithm ('chacha20' or 'aes256')
            
        Returns:
            The decrypted data
        """
        if algorithm == 'chacha20':
            cipher = ChaCha20Poly1305(key)
            nonce = encrypted_data[:12]
            ciphertext = encrypted_data[12:]
            return cipher.decrypt(nonce, ciphertext, None)
        elif algorithm == 'aes256':
            cipher = AESGCM(key)
            nonce = encrypted_data[:12]
            ciphertext = encrypted_data[12:]
            return cipher.decrypt(nonce, ciphertext, None)
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm}")


class SecureHash:
    """
    Secure hashing utilities with quantum resistance considerations.
    """
    
    @staticmethod
    def hash_data(data: bytes, algorithm: str = 'sha256') -> str:
        """
        Hash data using the specified algorithm.
        
        Args:
            data: The data to hash
            algorithm: The hash algorithm ('sha256', 'sha3_256', 'shake256')
            
        Returns:
            The hash as a hexadecimal string
        """
        if algorithm == 'sha256':
            return hashlib.sha256(data).hexdigest()
        elif algorithm == 'sha3_256':
            return hashlib.sha3_256(data).hexdigest()
        elif algorithm == 'shake256':
            # SHAKE256 is quantum-resistant
            return hashlib.shake_256(data).hexdigest(32)
        else:
            raise ValueError(f"Unsupported hash algorithm: {algorithm}")
    
    @staticmethod
    def verify_hash(data: bytes, expected_hash: str, algorithm: str = 'sha256') -> bool:
        """
        Verify data against an expected hash.
        
        Args:
            data: The data to verify
            expected_hash: The expected hash value
            algorithm: The hash algorithm used
            
        Returns:
            True if hash matches, False otherwise
        """
        actual_hash = SecureHash.hash_data(data, algorithm)
        return secrets.compare_digest(actual_hash, expected_hash)


class KeyManager:
    """
    Key management utilities for SMP Civic platform.
    """
    
    def __init__(self):
        self.pqc = PostQuantumCrypto()
    
    def create_encryption_key(self, algorithm: str, purpose: str) -> Dict[str, Any]:
        """
        Create a new encryption key with metadata.
        
        Args:
            algorithm: The cryptographic algorithm
            purpose: The intended use of the key
            
        Returns:
            Dictionary containing key information
        """
        public_key, private_key = self.pqc.generate_keypair(algorithm)
        key_id = self._generate_key_id()
        
        return {
            'key_id': key_id,
            'algorithm': algorithm,
            'purpose': purpose,
            'public_key': base64.b64encode(public_key).decode('utf-8'),
            'private_key': base64.b64encode(private_key).decode('utf-8'),
            'created_at': os.urandom(8).hex(),  # Placeholder timestamp
        }
    
    def _generate_key_id(self) -> str:
        """Generate a unique key identifier."""
        return f"key_{secrets.token_hex(16)}"
    
    def encrypt_private_key(self, private_key: bytes, password: str) -> bytes:
        """
        Encrypt a private key with a password.
        
        Args:
            private_key: The private key to encrypt
            password: The password for encryption
            
        Returns:
            The encrypted private key
        """
        # Derive key from password
        salt = os.urandom(16)
        key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
        
        # Encrypt the private key
        cipher = Fernet(base64.urlsafe_b64encode(key))
        encrypted_key = cipher.encrypt(private_key)
        
        # Prepend salt to encrypted key
        return salt + encrypted_key
    
    def decrypt_private_key(self, encrypted_key: bytes, password: str) -> bytes:
        """
        Decrypt a private key with a password.
        
        Args:
            encrypted_key: The encrypted private key with salt prepended
            password: The password for decryption
            
        Returns:
            The decrypted private key
        """
        # Extract salt and encrypted key
        salt = encrypted_key[:16]
        encrypted_data = encrypted_key[16:]
        
        # Derive key from password
        key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
        
        # Decrypt the private key
        cipher = Fernet(base64.urlsafe_b64encode(key))
        return cipher.decrypt(encrypted_data)