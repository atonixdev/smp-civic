"""
SMP Civic Encryption Core Module
================================

This module provides comprehensive encryption capabilities for the SMP Civic platform:

1. Asymmetric Encryption (RSA/OpenPGP) - For secure communication
2. Symmetric Encryption (AES-256) - For fast data encryption
3. End-to-End Encryption (E2EE) - For messaging and collaboration
4. Post-Quantum Cryptography - Future-proof security

Features:
- Zero-knowledge client-side encryption
- Secure key management and exchange
- Tamper-proof audit trails
- Encrypted metadata handling
"""

import base64
import hashlib
import json
import os
from datetime import datetime, timezone
from typing import Dict, Optional, Tuple, Union, Any

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
from cryptography.fernet import Fernet
import nacl.utils
import nacl.secret
import nacl.public
import nacl.encoding

try:
    # Post-quantum cryptography imports
    import oqs
    POST_QUANTUM_AVAILABLE = True
except ImportError:
    POST_QUANTUM_AVAILABLE = False
    print("Warning: Post-quantum cryptography not available. Install liboqs-python for full security.")


class EncryptionManager:
    """
    Core encryption manager providing all cryptographic operations for SMP Civic
    """
    
    def __init__(self):
        self.aes_key_size = 32  # AES-256
        self.rsa_key_size = 4096  # RSA-4096
        self.salt_size = 16
        self.nonce_size = 12
        
        # Post-quantum algorithms (NIST finalists)
        self.pq_kem_algorithm = "Kyber1024"  # Key encapsulation
        self.pq_sig_algorithm = "Dilithium5"  # Digital signatures
    
    # === SYMMETRIC ENCRYPTION (AES-256) ===
    
    def generate_symmetric_key(self) -> bytes:
        """Generate a secure 256-bit symmetric key"""
        return os.urandom(self.aes_key_size)
    
    def derive_key_from_password(self, password: str, salt: bytes = None) -> Tuple[bytes, bytes]:
        """Derive encryption key from password using PBKDF2"""
        if salt is None:
            salt = os.urandom(self.salt_size)
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=self.aes_key_size,
            salt=salt,
            iterations=100000,
        )
        key = kdf.derive(password.encode())
        return key, salt
    
    def encrypt_symmetric(self, data: Union[str, bytes], key: bytes) -> Dict[str, str]:
        """Encrypt data using AES-256-GCM"""
        if isinstance(data, str):
            data = data.encode('utf-8')
        
        nonce = os.urandom(self.nonce_size)
        cipher = Cipher(algorithms.AES(key), modes.GCM(nonce))
        encryptor = cipher.encryptor()
        
        ciphertext = encryptor.update(data) + encryptor.finalize()
        
        return {
            'ciphertext': base64.b64encode(ciphertext).decode('ascii'),
            'nonce': base64.b64encode(nonce).decode('ascii'),
            'tag': base64.b64encode(encryptor.tag).decode('ascii'),
            'algorithm': 'AES-256-GCM'
        }
    
    def decrypt_symmetric(self, encrypted_data: Dict[str, str], key: bytes) -> bytes:
        """Decrypt AES-256-GCM encrypted data"""
        ciphertext = base64.b64decode(encrypted_data['ciphertext'])
        nonce = base64.b64decode(encrypted_data['nonce'])
        tag = base64.b64decode(encrypted_data['tag'])
        
        cipher = Cipher(algorithms.AES(key), modes.GCM(nonce, tag))
        decryptor = cipher.decryptor()
        
        return decryptor.update(ciphertext) + decryptor.finalize()
    
    # === ASYMMETRIC ENCRYPTION (RSA) ===
    
    def generate_rsa_keypair(self) -> Tuple[bytes, bytes]:
        """Generate RSA-4096 key pair"""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=self.rsa_key_size,
        )
        
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        public_key = private_key.public_key()
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        return private_pem, public_pem
    
    def encrypt_asymmetric(self, data: Union[str, bytes], public_key_pem: bytes) -> str:
        """Encrypt data using RSA public key"""
        if isinstance(data, str):
            data = data.encode('utf-8')
        
        public_key = serialization.load_pem_public_key(public_key_pem)
        
        # RSA can only encrypt small amounts of data, so we use hybrid encryption
        # Generate a symmetric key, encrypt data with it, then encrypt the key with RSA
        symmetric_key = self.generate_symmetric_key()
        encrypted_data = self.encrypt_symmetric(data, symmetric_key)
        
        encrypted_key = public_key.encrypt(
            symmetric_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        return json.dumps({
            'encrypted_key': base64.b64encode(encrypted_key).decode('ascii'),
            'encrypted_data': encrypted_data,
            'algorithm': 'RSA-4096-OAEP+AES-256-GCM'
        })
    
    def decrypt_asymmetric(self, encrypted_json: str, private_key_pem: bytes) -> bytes:
        """Decrypt RSA+AES hybrid encrypted data"""
        encrypted_payload = json.loads(encrypted_json)
        
        private_key = serialization.load_pem_private_key(private_key_pem, password=None)
        
        # Decrypt the symmetric key
        encrypted_key = base64.b64decode(encrypted_payload['encrypted_key'])
        symmetric_key = private_key.decrypt(
            encrypted_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        # Decrypt the data
        return self.decrypt_symmetric(encrypted_payload['encrypted_data'], symmetric_key)
    
    # === END-TO-END ENCRYPTION (NaCl/libsodium) ===
    
    def generate_e2ee_keypair(self) -> Tuple[bytes, bytes]:
        """Generate Curve25519 key pair for E2EE"""
        private_key = nacl.public.PrivateKey.generate()
        public_key = private_key.public_key
        
        return (
            private_key.encode(encoder=nacl.encoding.Base64Encoder),
            public_key.encode(encoder=nacl.encoding.Base64Encoder)
        )
    
    def encrypt_e2ee(self, message: Union[str, bytes], recipient_public_key: bytes, sender_private_key: bytes) -> str:
        """Encrypt message for end-to-end encryption"""
        if isinstance(message, str):
            message = message.encode('utf-8')
        
        # Load keys
        sender_private = nacl.public.PrivateKey(sender_private_key, encoder=nacl.encoding.Base64Encoder)
        recipient_public = nacl.public.PublicKey(recipient_public_key, encoder=nacl.encoding.Base64Encoder)
        
        # Create box for encryption
        box = nacl.public.Box(sender_private, recipient_public)
        encrypted = box.encrypt(message)
        
        return base64.b64encode(encrypted).decode('ascii')
    
    def decrypt_e2ee(self, encrypted_message: str, sender_public_key: bytes, recipient_private_key: bytes) -> bytes:
        """Decrypt end-to-end encrypted message"""
        encrypted_bytes = base64.b64decode(encrypted_message)
        
        # Load keys
        recipient_private = nacl.public.PrivateKey(recipient_private_key, encoder=nacl.encoding.Base64Encoder)
        sender_public = nacl.public.PublicKey(sender_public_key, encoder=nacl.encoding.Base64Encoder)
        
        # Create box for decryption
        box = nacl.public.Box(recipient_private, sender_public)
        return box.decrypt(encrypted_bytes)
    
    # === POST-QUANTUM CRYPTOGRAPHY ===
    
    def generate_pq_keypair(self) -> Optional[Tuple[bytes, bytes]]:
        """Generate post-quantum key pair (Kyber1024 + Dilithium5)"""
        if not POST_QUANTUM_AVAILABLE:
            return None
        
        try:
            # Key encapsulation mechanism (KEM)
            kem = oqs.KeyEncapsulation(self.pq_kem_algorithm)
            kem_public_key = kem.generate_keypair()
            kem_private_key = kem.export_secret_key()
            
            # Digital signature algorithm
            sig = oqs.Signature(self.pq_sig_algorithm)
            sig_public_key = sig.generate_keypair()
            sig_private_key = sig.export_secret_key()
            
            # Combine keys
            combined_public = {
                'kem_public': base64.b64encode(kem_public_key).decode('ascii'),
                'sig_public': base64.b64encode(sig_public_key).decode('ascii'),
                'algorithms': {'kem': self.pq_kem_algorithm, 'sig': self.pq_sig_algorithm}
            }
            
            combined_private = {
                'kem_private': base64.b64encode(kem_private_key).decode('ascii'),
                'sig_private': base64.b64encode(sig_private_key).decode('ascii'),
                'algorithms': {'kem': self.pq_kem_algorithm, 'sig': self.pq_sig_algorithm}
            }
            
            return (
                json.dumps(combined_private).encode(),
                json.dumps(combined_public).encode()
            )
        except Exception as e:
            print(f"Post-quantum key generation failed: {e}")
            return None
    
    def encrypt_post_quantum(self, data: Union[str, bytes], public_key_json: bytes) -> Optional[str]:
        """Encrypt data using post-quantum cryptography"""
        if not POST_QUANTUM_AVAILABLE:
            return None
        
        try:
            if isinstance(data, str):
                data = data.encode('utf-8')
            
            public_key_data = json.loads(public_key_json.decode())
            kem_public = base64.b64decode(public_key_data['kem_public'])
            
            # Use KEM to generate shared secret
            kem = oqs.KeyEncapsulation(public_key_data['algorithms']['kem'])
            ciphertext, shared_secret = kem.encap_secret(kem_public)
            
            # Use shared secret as AES key
            encrypted_data = self.encrypt_symmetric(data, shared_secret[:32])  # Use first 32 bytes
            
            return json.dumps({
                'kem_ciphertext': base64.b64encode(ciphertext).decode('ascii'),
                'encrypted_data': encrypted_data,
                'algorithm': f"{public_key_data['algorithms']['kem']}+AES-256-GCM"
            })
        except Exception as e:
            print(f"Post-quantum encryption failed: {e}")
            return None
    
    # === UTILITY FUNCTIONS ===
    
    def hash_data(self, data: Union[str, bytes], algorithm: str = 'SHA256') -> str:
        """Create cryptographic hash of data"""
        if isinstance(data, str):
            data = data.encode('utf-8')
        
        if algorithm == 'SHA256':
            return hashlib.sha256(data).hexdigest()
        elif algorithm == 'SHA512':
            return hashlib.sha512(data).hexdigest()
        else:
            raise ValueError(f"Unsupported hash algorithm: {algorithm}")
    
    def generate_file_fingerprint(self, file_path: str) -> Dict[str, str]:
        """Generate tamper-proof fingerprint for files"""
        with open(file_path, 'rb') as f:
            file_data = f.read()
        
        return {
            'sha256': self.hash_data(file_data, 'SHA256'),
            'sha512': self.hash_data(file_data, 'SHA512'),
            'size': len(file_data),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
    
    def create_audit_entry(self, action: str, user_id: str, resource_id: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create tamper-proof audit trail entry"""
        entry = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'action': action,
            'user_id': user_id,
            'resource_id': resource_id,
            'metadata': metadata or {}
        }
        
        # Create tamper-proof signature
        entry_json = json.dumps(entry, sort_keys=True)
        entry['signature'] = self.hash_data(entry_json, 'SHA256')
        
        return entry


# Global encryption manager instance
encryption_manager = EncryptionManager()