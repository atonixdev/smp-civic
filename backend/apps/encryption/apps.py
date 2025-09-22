"""
Django app configuration for SMP Civic encryption
"""

from django.apps import AppConfig


class EncryptionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.encryption'
    verbose_name = 'SMP Civic Encryption'
    
    def ready(self):
        """Initialize encryption services when Django starts"""
        from .core import encryption_manager
        
        # Verify cryptographic libraries are working
        try:
            # Test AES encryption
            test_key = encryption_manager.generate_symmetric_key()
            test_data = "SMP Civic Encryption Test"
            encrypted = encryption_manager.encrypt_symmetric(test_data, test_key)
            decrypted = encryption_manager.decrypt_symmetric(encrypted, test_key)
            
            if decrypted.decode('utf-8') != test_data:
                raise Exception("Symmetric encryption test failed")
            
            print("✅ SMP Civic Encryption: AES-256-GCM operational")
            
            # Test RSA encryption
            private_key, public_key = encryption_manager.generate_rsa_keypair()
            encrypted_rsa = encryption_manager.encrypt_asymmetric(test_data, public_key)
            decrypted_rsa = encryption_manager.decrypt_asymmetric(encrypted_rsa, private_key)
            
            if decrypted_rsa.decode('utf-8') != test_data:
                raise Exception("Asymmetric encryption test failed")
            
            print("✅ SMP Civic Encryption: RSA-4096-OAEP operational")
            
            # Test E2EE
            sender_private, sender_public = encryption_manager.generate_e2ee_keypair()
            recipient_private, recipient_public = encryption_manager.generate_e2ee_keypair()
            
            encrypted_e2ee = encryption_manager.encrypt_e2ee(test_data, recipient_public, sender_private)
            decrypted_e2ee = encryption_manager.decrypt_e2ee(encrypted_e2ee, sender_public, recipient_private)
            
            if decrypted_e2ee.decode('utf-8') != test_data:
                raise Exception("E2EE encryption test failed")
            
            print("✅ SMP Civic Encryption: Curve25519 E2EE operational")
            
            # Test post-quantum if available
            from .core import POST_QUANTUM_AVAILABLE
            if POST_QUANTUM_AVAILABLE:
                pq_keys = encryption_manager.generate_pq_keypair()
                if pq_keys:
                    print("✅ SMP Civic Encryption: Post-Quantum Cryptography operational")
                else:
                    print("⚠️  SMP Civic Encryption: Post-Quantum Cryptography available but test failed")
            else:
                print("⚠️  SMP Civic Encryption: Post-Quantum Cryptography not available")
            
        except Exception as e:
            print(f"❌ SMP Civic Encryption initialization failed: {e}")
            raise