# 🛡️ SMP Civic Platform

**Sovereign Media Platform for Civic Journalism**

A secure, encrypted, and community-driven platform designed for independent journalists, investigative reporters, and civic contributors who need military-grade security for their work.

![SMP Civic Banner](https://img.shields.io/badge/SMP%20Civic-Secure%20Journalism-blue?style=for-the-badge&logo=shield)

## 🌟 Overview

SMP Civic is a comprehensive platform that combines investigative journalism with cutting-edge encryption technology to protect journalists, sources, and sensitive information in high-risk environments.

### 🎯 Mission
- **Secure Communication**: End-to-end encrypted messaging for journalists
- **Zero-Knowledge Storage**: Client-side encryption before any data leaves your device
- **Community-Driven**: Collaborative platform for civic journalism
- **Future-Proof**: Post-quantum cryptography ready for the quantum era

## 🔒 Security Features

### **Military-Grade Encryption**
- 🔐 **RSA-4096-OAEP**: Asymmetric encryption for secure key exchange
- 🛡️ **AES-256-GCM**: Symmetric encryption for high-speed data protection
- 💬 **Curve25519 E2EE**: End-to-end encrypted messaging
- 🔮 **Post-Quantum Ready**: Kyber1024 + Dilithium5 for quantum resistance

### **Zero-Knowledge Architecture**
- 📁 Client-side file encryption before upload
- 🔑 Password-based key derivation (PBKDF2, 100k iterations)
- 🔍 Encrypted metadata protection
- ✅ Tamper-proof file fingerprinting

### **Advanced Security**
- � Perfect Forward Secrecy for messaging
- ⏰ Self-destruct messages
- 📊 Comprehensive audit logging
- 🛡️ Tamper-proof security monitoring

## 🏗️ Architecture

### **Frontend (React + TypeScript)**
```
📁 frontend/
├── 🔧 src/utils/encryption.js    # WebCrypto API utilities
├── 🔒 SecurityDashboard          # Key management interface
├── 💬 SecureMessaging            # E2EE messaging system
├── 📰 InvestigationsPage         # Journalism content
├── 🌍 GeopoliticsPage            # Regional analysis
├── 👥 ContributorsPage           # Community features
└── 🎨 App.css                    # Security-focused UI
```

### **Backend (Django + REST API)**
```
📁 backend/
├── 🧠 apps/encryption/core.py     # Comprehensive crypto manager
├── 📊 apps/encryption/models.py   # Database schema
├── 🌐 apps/encryption/views.py    # REST API endpoints
├── 👤 apps/authentication/        # User management
└── 📋 apps/core/                  # Platform core
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **Python** 3.11+
- **Modern Browser** with WebCrypto API support

### 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/atonixdev/smp-civic.git
   cd smp-civic
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   The React app will be available at `http://localhost:3000`

3. **Backend Setup**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Run migrations
   python manage.py migrate
   
   # Create superuser
   python manage.py createsuperuser
   
   # Start server
   python manage.py runserver
   ```
   The Django API will be available at `http://localhost:8000`

### 🔐 First-Time Security Setup

1. **Access Security Dashboard**: Navigate to `/security` (requires login)
2. **Generate Keys**: Click "Generate RSA-4096 Key Pair"
3. **Test Encryption**: Upload a test file with password encryption
4. **Verify Logs**: Check the security log for successful operations

## 📖 User Guide

### 🔑 Security Dashboard

The Security Dashboard is your control center for all encryption operations:

- **🛡️ Encryption Status**: Real-time monitoring of crypto capabilities
- **🔑 Key Management**: Generate, import, and manage encryption keys
- **📁 File Encryption**: Zero-knowledge file encryption with client-side processing
- **📊 Security Log**: Comprehensive audit trail of all security events

### 💬 Secure Messaging

End-to-end encrypted communication system:

- **🔒 E2EE Messages**: All messages encrypted with recipient's public key
- **⏰ Self-Destruct**: Optional automatic message deletion
- **🛡️ Metadata Protection**: Communication patterns protected
- **✅ Delivery Confirmation**: Encrypted status updates

### 📰 Journalism Features

Professional tools for investigative journalism:

- **🔍 Investigations**: Secure document management and collaboration
- **🌍 Geopolitics**: Regional analysis and reporting tools
- **👥 Contributors**: Community features with social interactions
- **📋 Legal Briefs**: Secure legal document handling

## 🔧 API Documentation

### Authentication Endpoints
```
POST /api/v1/auth/login/          # User login
POST /api/v1/auth/register/       # User registration
POST /api/v1/auth/logout/         # User logout
```

### Encryption API
```
GET  /api/v1/encryption/status/           # Encryption capabilities
POST /api/v1/encryption/keys/             # Generate key pairs
GET  /api/v1/encryption/keys/public/      # Get public keys
POST /api/v1/encryption/content/encrypt/  # Encrypt content
POST /api/v1/encryption/content/decrypt/  # Decrypt content
POST /api/v1/encryption/messages/         # Send encrypted message
GET  /api/v1/encryption/messages/         # Get messages
```

## �️ Security Specifications

| Component | Algorithm | Key Size | Security Level |
|-----------|-----------|----------|----------------|
| **Symmetric** | AES-256-GCM | 256-bit | High |
| **Asymmetric** | RSA-OAEP | 4096-bit | Very High |
| **E2EE** | Curve25519 | 256-bit | High |
| **Hashing** | SHA-256/SHA-512 | 256/512-bit | High |
| **Key Derivation** | PBKDF2 | 100k iterations | High |
| **Post-Quantum** | Kyber1024 + Dilithium5 | PQ-Safe | Quantum-Resistant |

## 🔒 Security Best Practices

### For Journalists
1. **🔑 Generate unique keys** for each device/story
2. **💾 Backup encryption keys** securely offline
3. **🔄 Rotate keys regularly** for high-sensitivity work
4. **📱 Use dedicated devices** for sensitive investigations
5. **🌐 Access via VPN/Tor** when possible

### For Administrators
1. **📊 Monitor security logs** regularly
2. **🔄 Update dependencies** frequently
3. **🛡️ Implement rate limiting** on API endpoints
4. **📈 Scale encryption services** based on usage
5. **🔐 Use hardware security modules** for production keys

## 🤝 Contributing

We welcome contributions from the journalism and security communities!

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper testing
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Security Contributions
- **🔍 Security audits** and vulnerability reports
- **🔐 Cryptographic improvements** and optimizations
- **🛡️ New encryption algorithms** integration
- **📚 Security documentation** and guides

## 📋 Roadmap

### 🎯 Version 2.0 (Q1 2026)
- [ ] **Full Post-Quantum Integration**: Complete PQC implementation
- [ ] **Mobile Applications**: Native iOS/Android apps
- [ ] **Federation Support**: Cross-platform secure messaging
- [ ] **Advanced Analytics**: Privacy-preserving usage insights

### 🎯 Version 2.1 (Q2 2026)
- [ ] **AI-Powered Verification**: Automated fact-checking tools
- [ ] **Blockchain Integration**: Immutable publication records
- [ ] **Advanced Collaboration**: Real-time encrypted editing
- [ ] **Source Protection**: Enhanced anonymity features

## 🆘 Support & Community

### 📞 Getting Help
- **📧 Email**: support@smpcivic.org
- **🔒 Security**: security@smpcivic.org  
- **💡 Tips**: tips@smpcivic.org
- **📚 Documentation**: [docs.smpcivic.org](https://docs.smpcivic.org)

### 🌐 Community
- **💬 Discord**: [SMP Civic Community](https://discord.gg/smpcivic)
- **🐦 Twitter**: [@SMPCivic](https://twitter.com/smpcivic)
- **📰 Blog**: [blog.smpcivic.org](https://blog.smpcivic.org)

## ⚖️ Legal & Privacy

### � License
This project is licensed under the **GNU Affero General Public License v3.0** (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

### 🔒 Privacy Policy
- **Zero-Knowledge**: We cannot access your encrypted content
- **Minimal Data**: Only necessary metadata is stored
- **No Tracking**: No user behavior analytics
- **Open Source**: Full transparency in our code

### 🛡️ Security Disclosure
If you discover a security vulnerability, please send details to **security@smpcivic.org**. We will respond within 24 hours and work with you to address the issue responsibly.

## 🙏 Acknowledgments

### Built With
- **🔐 Cryptography Libraries**: OpenSSL, NaCl, liboqs
- **🌐 Web Technologies**: React, Django, WebCrypto API
- **🛡️ Security Standards**: NIST, FIPS, Common Criteria
- **📚 Research**: Based on Signal Protocol, age encryption

### Special Thanks
- **🔒 Cryptography Community**: For advancing secure communications
- **📰 Journalism Organizations**: For security requirements and feedback
- **🛡️ Security Researchers**: For audits and improvements
- **🌍 Open Source Community**: For contributions and support

---

<div align="center">

**🛡️ SMP Civic Platform - Secure • Transparent • Community-Driven**

*Built with ❤️ for a more transparent world*

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Security: Military Grade](https://img.shields.io/badge/Security-Military%20Grade-green.svg)](https://smpcivic.org/security)
[![Encryption: Post-Quantum Ready](https://img.shields.io/badge/Encryption-Post--Quantum%20Ready-purple.svg)](https://smpcivic.org/crypto)

</div>