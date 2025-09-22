# Contributing to Sovereign Media Platform

Thank you for your interest in contributing to the Sovereign Media Platform! This document outlines the development process, coding standards, and security considerations for contributors.

## 🛡️ Security First

Before contributing, please understand that this platform handles sensitive journalistic content. All contributions must prioritize security and privacy.

### Security Guidelines
- Never commit secrets, API keys, or sensitive data
- Use secure coding practices and follow OWASP guidelines
- All crypto implementations must use established libraries
- Report security vulnerabilities privately to security@atonixcorp.org

## 📋 Development Setup

### Local Environment
1. **Prerequisites**
   - Docker & Docker Compose
   - Node.js 18+ and npm
   - Python 3.11+ and pip
   - Git with GPG signing enabled

2. **Initial Setup**
   ```bash
   git clone https://github.com/atonixdev/smp-civic.git
   cd smp-civic
   cp .env.example .env
   docker compose up -d
   ```

3. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py createsuperuser
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 🎯 Code Standards

### Backend (Django)
- **Style**: PEP 8 compliance (enforced by black and flake8)
- **Testing**: pytest with 90%+ coverage
- **Documentation**: Google-style docstrings
- **Security**: All inputs validated, SQL injection prevention
- **Performance**: Database query optimization

### Frontend (React/TypeScript)
- **Style**: ESLint + Prettier configuration
- **Testing**: Jest + React Testing Library
- **Documentation**: TSDoc comments for complex functions
- **Performance**: React.memo, useMemo, useCallback where appropriate
- **Accessibility**: WCAG 2.1 AA compliance

## 🔄 Development Workflow

### Branching Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature development branches
- `hotfix/*`: Critical production fixes

### Pull Request Process
1. Create feature branch from `develop`
2. Implement changes with tests
3. Ensure all CI checks pass
4. Request review from core team
5. Address feedback and merge

### Commit Convention
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `security`

Example:
```
feat(publishing): add encrypted document upload

Implements secure file upload with client-side encryption
using post-quantum cryptography algorithms.

Closes #123
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest --cov=apps --cov-report=html
```

### Frontend Testing
```bash
cd frontend
npm test -- --coverage
```

### End-to-End Testing
```bash
npm run test:e2e
```

## 🔐 Security Testing

### Static Analysis
```bash
# Backend security scan
bandit -r backend/apps/

# Frontend security scan
npm audit

# Container security scan
docker run --rm -v $(pwd):/app -w /app aquasec/trivy fs .
```

### Dependency Scanning
- Automated dependency vulnerability scanning
- Regular updates of security-critical packages
- Supply chain verification for all dependencies

## 📚 Documentation

### Code Documentation
- All public APIs must have docstrings
- Complex algorithms require detailed comments
- Security-sensitive code needs threat model documentation

### API Documentation
- OpenAPI 3.0 specifications for all endpoints
- Interactive documentation at `/api/docs/`
- Examples for all request/response formats

## 🚀 Deployment

### Development Deployment
```bash
docker compose up
```

### Staging Deployment
```bash
docker compose -f docker-compose.staging.yml up -d
```

### Production Deployment
- Automated via GitHub Actions
- Blue-green deployment strategy
- Automated rollback on failure

## 🏷️ Release Process

1. **Version Bumping**: Semantic versioning (MAJOR.MINOR.PATCH)
2. **Changelog**: Automated generation from conventional commits
3. **Security Review**: Manual security review for all releases
4. **Staging Testing**: Full E2E testing on staging environment
5. **Production Deployment**: Automated deployment with monitoring

## 📋 Issue Templates

### Bug Report
- Environment details
- Steps to reproduce
- Expected vs actual behavior
- Security implications (if any)

### Feature Request
- Use case description
- Proposed implementation
- Security considerations
- Performance impact

### Security Vulnerability
- Private disclosure via security@atonixcorp.org
- CVE assessment and scoring
- Coordinated disclosure timeline

## 🤝 Community Guidelines

### Code of Conduct
- Respectful and inclusive communication
- Focus on constructive feedback
- No tolerance for harassment or discrimination
- Professional behavior in all interactions

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Email**: security@atonixcorp.org for security issues

## 📖 Learning Resources

### Platform Architecture
- [System Architecture Overview](docs/architecture.md)
- [Security Design Principles](docs/security.md)
- [API Reference](docs/api.md)

### External Resources
- [Django Best Practices](https://django-best-practices.readthedocs.io/)
- [React Performance Patterns](https://kentcdodds.com/blog/optimize-react-re-renders)
- [Post-Quantum Cryptography](https://pqcrypto.org/)

## 🏆 Recognition

Contributors will be recognized in:
- GitHub contributor graph
- CONTRIBUTORS.md file
- Release notes for significant contributions
- Annual contributor appreciation events

---

Thank you for helping build a more transparent and secure media platform! 🛡️📰