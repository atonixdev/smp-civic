/**
 * SMP Civic Frontend Encryption Utilities
 * =======================================
 * 
 * Client-side encryption using WebCrypto API for:
 * - Zero-knowledge file encryption before upload
 * - Secure key derivation and management
 * - End-to-end encrypted messaging
 * - Post-quantum ready architecture
 */

// WebCrypto API utilities for SMP Civic
class SMPCivicCrypto {
  constructor() {
    this.crypto = window.crypto;
    this.subtle = window.crypto.subtle;
    
    // Encryption algorithms
    this.algorithms = {
      symmetric: 'AES-GCM',
      asymmetric: 'RSA-OAEP',
      hash: 'SHA-256',
      keyDerivation: 'PBKDF2'
    };
    
    // Key storage prefix
    this.keyPrefix = 'smp_civic_';
  }

  // === UTILITY FUNCTIONS ===
  
  /**
   * Convert string to ArrayBuffer
   */
  str2ab(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }
  
  /**
   * Convert ArrayBuffer to string
   */
  ab2str(buffer) {
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  }
  
  /**
   * Convert ArrayBuffer to base64
   */
  ab2base64(buffer) {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return window.btoa(binary);
  }
  
  /**
   * Convert base64 to ArrayBuffer
   */
  base642ab(base64) {
    const binary = window.atob(base64);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  // === SYMMETRIC ENCRYPTION (AES-256-GCM) ===
  
  /**
   * Generate a new AES-256 key
   */
  async generateSymmetricKey() {
    return await this.subtle.generateKey(
      {
        name: this.algorithms.symmetric,
        length: 256
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * Derive key from password using PBKDF2
   */
  async deriveKeyFromPassword(password, salt = null) {
    if (!salt) {
      salt = window.crypto.getRandomValues(new Uint8Array(16));
    }
    
    // Import password as key material
    const keyMaterial = await this.subtle.importKey(
      'raw',
      this.str2ab(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // Derive AES key
    const key = await this.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: this.algorithms.hash
      },
      keyMaterial,
      {
        name: this.algorithms.symmetric,
        length: 256
      },
      false, // not extractable for security
      ['encrypt', 'decrypt']
    );
    
    return { key, salt };
  }
  
  /**
   * Encrypt data with AES-256-GCM
   */
  async encryptSymmetric(data, key) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
    
    const encrypted = await this.subtle.encrypt(
      {
        name: this.algorithms.symmetric,
        iv: iv
      },
      key,
      typeof data === 'string' ? this.str2ab(data) : data
    );
    
    return {
      ciphertext: this.ab2base64(encrypted),
      iv: this.ab2base64(iv),
      algorithm: this.algorithms.symmetric
    };
  }
  
  /**
   * Decrypt AES-256-GCM encrypted data
   */
  async decryptSymmetric(encryptedData, key) {
    const ciphertext = this.base642ab(encryptedData.ciphertext);
    const iv = this.base642ab(encryptedData.iv);
    
    const decrypted = await this.subtle.decrypt(
      {
        name: this.algorithms.symmetric,
        iv: iv
      },
      key,
      ciphertext
    );
    
    return decrypted;
  }

  // === ASYMMETRIC ENCRYPTION (RSA-OAEP) ===
  
  /**
   * Generate RSA key pair
   */
  async generateAsymmetricKeyPair() {
    return await this.subtle.generateKey(
      {
        name: this.algorithms.asymmetric,
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]), // 65537
        hash: this.algorithms.hash
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * Export public key for sharing
   */
  async exportPublicKey(keyPair) {
    const exported = await this.subtle.exportKey('spki', keyPair.publicKey);
    return this.ab2base64(exported);
  }
  
  /**
   * Import public key from base64
   */
  async importPublicKey(publicKeyBase64) {
    const keyData = this.base642ab(publicKeyBase64);
    return await this.subtle.importKey(
      'spki',
      keyData,
      {
        name: this.algorithms.asymmetric,
        hash: this.algorithms.hash
      },
      true,
      ['encrypt']
    );
  }
  
  /**
   * Hybrid encryption: RSA + AES for large data
   */
  async encryptHybrid(data, publicKey) {
    // Generate symmetric key for data
    const symmetricKey = await this.generateSymmetricKey();
    
    // Encrypt data with symmetric key
    const encryptedData = await this.encryptSymmetric(data, symmetricKey);
    
    // Export and encrypt symmetric key with RSA
    const exportedKey = await this.subtle.exportKey('raw', symmetricKey);
    const encryptedKey = await this.subtle.encrypt(
      {
        name: this.algorithms.asymmetric
      },
      publicKey,
      exportedKey
    );
    
    return {
      encryptedKey: this.ab2base64(encryptedKey),
      encryptedData: encryptedData,
      algorithm: 'RSA-4096-OAEP+AES-256-GCM'
    };
  }

  // === FILE ENCRYPTION ===
  
  /**
   * Encrypt file before upload (Zero-knowledge)
   */
  async encryptFile(file, password) {
    try {
      // Read file as ArrayBuffer
      const fileBuffer = await file.arrayBuffer();
      
      // Derive key from password
      const { key, salt } = await this.deriveKeyFromPassword(password);
      
      // Encrypt file content
      const encrypted = await this.encryptSymmetric(fileBuffer, key);
      
      // Create metadata
      const metadata = {
        originalName: file.name,
        originalSize: file.size,
        mimeType: file.type,
        encrypted: true,
        timestamp: new Date().toISOString(),
        algorithm: this.algorithms.symmetric
      };
      
      // Encrypt metadata
      const encryptedMetadata = await this.encryptSymmetric(JSON.stringify(metadata), key);
      
      return {
        encryptedContent: encrypted,
        encryptedMetadata: encryptedMetadata,
        salt: this.ab2base64(salt),
        fileFingerprint: await this.createFileFingerprint(fileBuffer)
      };
    } catch (error) {
      throw new Error(`File encryption failed: ${error.message}`);
    }
  }
  
  /**
   * Decrypt file after download
   */
  async decryptFile(encryptedFile, password) {
    try {
      const { key } = await this.deriveKeyFromPassword(password, this.base642ab(encryptedFile.salt));
      
      // Decrypt metadata
      const metadataBuffer = await this.decryptSymmetric(encryptedFile.encryptedMetadata, key);
      const metadata = JSON.parse(this.ab2str(metadataBuffer));
      
      // Decrypt content
      const contentBuffer = await this.decryptSymmetric(encryptedFile.encryptedContent, key);
      
      // Create file blob
      const blob = new Blob([contentBuffer], { type: metadata.mimeType });
      
      return {
        blob,
        metadata,
        fingerprint: encryptedFile.fileFingerprint
      };
    } catch (error) {
      throw new Error(`File decryption failed: ${error.message}`);
    }
  }

  // === KEY MANAGEMENT ===
  
  /**
   * Store encrypted key in localStorage
   */
  async storeKey(keyId, key, password) {
    const { key: derivedKey, salt } = await this.deriveKeyFromPassword(password);
    const exportedKey = await this.subtle.exportKey('raw', key);
    const encrypted = await this.encryptSymmetric(exportedKey, derivedKey);
    
    const keyData = {
      encrypted,
      salt: this.ab2base64(salt),
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`${this.keyPrefix}${keyId}`, JSON.stringify(keyData));
  }
  
  /**
   * Retrieve and decrypt key from localStorage
   */
  async retrieveKey(keyId, password) {
    const stored = localStorage.getItem(`${this.keyPrefix}${keyId}`);
    if (!stored) {
      throw new Error('Key not found');
    }
    
    const keyData = JSON.parse(stored);
    const { key: derivedKey } = await this.deriveKeyFromPassword(password, this.base642ab(keyData.salt));
    
    const decryptedKeyData = await this.decryptSymmetric(keyData.encrypted, derivedKey);
    
    return await this.subtle.importKey(
      'raw',
      decryptedKeyData,
      {
        name: this.algorithms.symmetric,
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // === SECURITY UTILITIES ===
  
  /**
   * Create tamper-proof file fingerprint
   */
  async createFileFingerprint(fileBuffer) {
    const hashBuffer = await this.subtle.digest(this.algorithms.hash, fileBuffer);
    return {
      sha256: this.ab2base64(hashBuffer),
      size: fileBuffer.byteLength,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Generate secure random string
   */
  generateSecureId(length = 32) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Verify file integrity
   */
  async verifyFileIntegrity(fileBuffer, expectedFingerprint) {
    const currentFingerprint = await this.createFileFingerprint(fileBuffer);
    return currentFingerprint.sha256 === expectedFingerprint.sha256 &&
           currentFingerprint.size === expectedFingerprint.size;
  }

  // === MESSAGING ENCRYPTION ===
  
  /**
   * Encrypt message for end-to-end communication
   */
  async encryptMessage(message, recipientPublicKey, senderPrivateKey) {
    // For demo purposes, using hybrid encryption
    // In production, would use actual E2EE like Signal Protocol
    const publicKey = await this.importPublicKey(recipientPublicKey);
    const encrypted = await this.encryptHybrid(message, publicKey);
    
    return {
      ...encrypted,
      timestamp: new Date().toISOString(),
      messageId: this.generateSecureId()
    };
  }
}

// Export singleton instance
export const smpcrypto = new SMPCivicCrypto();

// Export utility functions
export const CryptoUtils = {
  /**
   * Check if WebCrypto is available
   */
  isWebCryptoSupported() {
    return !!(window.crypto && window.crypto.subtle);
  },
  
  /**
   * Get supported algorithms
   */
  getSupportedAlgorithms() {
    return {
      symmetric: ['AES-GCM', 'AES-CBC'],
      asymmetric: ['RSA-OAEP', 'RSA-PSS'],
      hash: ['SHA-256', 'SHA-384', 'SHA-512'],
      keyDerivation: ['PBKDF2']
    };
  },
  
  /**
   * Test encryption capabilities
   */
  async testEncryption() {
    try {
      const testData = 'SMP Civic Encryption Test';
      const key = await smpcrypto.generateSymmetricKey();
      const encrypted = await smpcrypto.encryptSymmetric(testData, key);
      const decrypted = await smpcrypto.decryptSymmetric(encrypted, key);
      const result = smpcrypto.ab2str(decrypted);
      
      return result === testData;
    } catch (error) {
      console.error('Encryption test failed:', error);
      return false;
    }
  }
};