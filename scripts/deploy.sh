#!/bin/bash

# SMP Civic Deployment Script
# This script sets up the complete SMP Civic platform

set -e  # Exit on any error

echo "🛡️ Starting SMP Civic deployment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are available"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_warning "Please edit .env file with your configuration before continuing."
        print_warning "Press Enter when ready to continue..."
        read
    fi
    print_success "Environment configuration found"
}

# Generate secret keys
generate_secrets() {
    print_status "Generating secret keys..."
    
    # Generate Django secret key
    SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())' 2>/dev/null || openssl rand -hex 32)
    
    # Generate JWT secret key
    JWT_SECRET=$(openssl rand -hex 32)
    
    # Generate encryption key
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    
    # Generate Fernet key
    FERNET_KEY=$(python3 -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())' 2>/dev/null || openssl rand -base64 32)
    
    # Update .env file
    sed -i "s/your-secret-key-here-change-this-in-production/$SECRET_KEY/" .env
    sed -i "s/your-jwt-secret-key-here/$JWT_SECRET/" .env
    sed -i "s/your-encryption-key-here-32-bytes-minimum/$ENCRYPTION_KEY/" .env
    sed -i "s/your-fernet-key-here/$FERNET_KEY/" .env
    
    print_success "Secret keys generated and updated in .env file"
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    docker compose build --no-cache
    print_success "Docker images built successfully"
}

# Start services
start_services() {
    print_status "Starting SMP Civic services..."
    docker compose up -d
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Check if services are running
    if docker compose ps | grep -q "Up"; then
        print_success "Services started successfully"
    else
        print_error "Some services failed to start"
        docker compose logs
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    docker compose exec backend python manage.py migrate
    print_success "Database migrations completed"
}

# Create superuser
create_superuser() {
    print_status "Creating Django superuser..."
    print_warning "Please provide superuser credentials:"
    docker compose exec backend python manage.py createsuperuser
    print_success "Superuser created"
}

# Load initial data
load_initial_data() {
    print_status "Loading initial data..."
    
    # Create fixtures directory if it doesn't exist
    docker compose exec backend mkdir -p fixtures
    
    # Load initial categories
    docker compose exec backend python manage.py loaddata --app core categories || print_warning "Categories fixture not found"
    
    # Load initial settings
    docker compose exec backend python manage.py loaddata --app core settings || print_warning "Settings fixture not found"
    
    print_success "Initial data loaded"
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    docker compose exec frontend npm install
    print_success "Frontend dependencies installed"
}

# Build frontend
build_frontend() {
    print_status "Building frontend application..."
    docker compose exec frontend npm run build
    print_success "Frontend built successfully"
}

# Collect static files
collect_static() {
    print_status "Collecting static files..."
    docker compose exec backend python manage.py collectstatic --noinput
    print_success "Static files collected"
}

# Setup SSL certificates (for production)
setup_ssl() {
    if [ "$1" = "production" ]; then
        print_status "Setting up SSL certificates..."
        
        # Create SSL directory
        mkdir -p ssl
        
        # Generate self-signed certificate for development
        if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
            openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
                -subj "/C=US/ST=State/L=City/O=AtonixCorp/CN=smp-civic.local"
            print_success "SSL certificates generated"
        else
            print_success "SSL certificates already exist"
        fi
    fi
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Check backend health
    if curl -f -s http://localhost:8000/health/ > /dev/null; then
        print_success "Backend is healthy"
    else
        print_error "Backend health check failed"
    fi
    
    # Check frontend
    if curl -f -s http://localhost:3000 > /dev/null; then
        print_success "Frontend is accessible"
    else
        print_warning "Frontend may still be building..."
    fi
    
    # Check database
    if docker compose exec -T db pg_isready -U smp_user -d smp_civic > /dev/null; then
        print_success "Database is ready"
    else
        print_error "Database is not accessible"
    fi
}

# Display access information
show_access_info() {
    echo ""
    echo "🎉 SMP Civic deployment completed successfully!"
    echo ""
    echo "Access Information:"
    echo "=================="
    echo "• Frontend:      http://localhost:3000"
    echo "• Backend API:   http://localhost:8000/api"
    echo "• Admin Panel:   http://localhost:8000/admin"
    echo "• API Docs:      http://localhost:8000/api/docs"
    echo ""
    echo "Default Credentials:"
    echo "==================="
    echo "• Database: smp_user / smp_password"
    echo "• Redis: (no password in development)"
    echo ""
    echo "Important Security Notes:"
    echo "========================"
    echo "• Change all default passwords in production"
    echo "• Update environment variables in .env"
    echo "• Enable HTTPS for production deployment"
    echo "• Configure proper backup procedures"
    echo ""
    echo "For more information, see README.md"
    echo ""
}

# Main deployment flow
main() {
    local environment=${1:-development}
    
    echo "Deploying SMP Civic in $environment mode..."
    
    check_docker
    check_env_file
    
    if [ "$environment" = "production" ]; then
        generate_secrets
        setup_ssl production
    fi
    
    build_images
    start_services
    run_migrations
    
    if [ "$environment" = "development" ]; then
        create_superuser
    fi
    
    load_initial_data
    collect_static
    
    # Frontend setup
    install_frontend_deps
    
    if [ "$environment" = "production" ]; then
        build_frontend
    fi
    
    health_check
    show_access_info
    
    print_success "SMP Civic deployment completed! 🛡️"
}

# Handle command line arguments
case "${1:-}" in
    "production")
        main production
        ;;
    "development"|"dev"|"")
        main development
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [environment]"
        echo ""
        echo "Environments:"
        echo "  development  - Deploy for development (default)"
        echo "  production   - Deploy for production with security hardening"
        echo ""
        echo "Examples:"
        echo "  $0                    # Deploy for development"
        echo "  $0 development        # Deploy for development"
        echo "  $0 production         # Deploy for production"
        ;;
    *)
        print_error "Unknown environment: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac