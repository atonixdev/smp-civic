#!/bin/bash

# Development setup script for SMP Civic
# This script sets up the development environment

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "🛡️ Setting up SMP Civic development environment..."

# Create environment file
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp .env.example .env
    print_success ".env file created"
else
    print_warning ".env file already exists"
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p backend/logs
mkdir -p backend/media
mkdir -p backend/static
mkdir -p ssl
print_success "Directories created"

# Start development environment
print_status "Starting development environment..."
docker compose up -d db redis

# Wait for database
print_status "Waiting for database to be ready..."
sleep 10

# Setup backend
print_status "Setting up Django backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
print_success "Python dependencies installed"

# Run migrations
print_status "Running database migrations..."
python manage.py migrate
print_success "Database migrations completed"

# Create superuser (optional)
print_warning "Would you like to create a superuser? (y/n)"
read -r create_user
if [[ $create_user =~ ^[Yy]$ ]]; then
    python manage.py createsuperuser
fi

# Collect static files
print_status "Collecting static files..."
python manage.py collectstatic --noinput
print_success "Static files collected"

cd ..

# Setup frontend
print_status "Setting up React frontend..."
cd frontend

# Install Node dependencies
print_status "Installing Node.js dependencies..."
npm install
print_success "Node.js dependencies installed"

cd ..

print_success "🎉 Development environment setup completed!"
echo ""
echo "To start development:"
echo "===================="
echo "Backend:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python manage.py runserver"
echo ""
echo "Frontend:"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "Or use Docker:"
echo "  docker-compose up"
echo ""
echo "Access the application at:"
echo "• Frontend: http://localhost:3000"
echo "• Backend API: http://localhost:8000"
echo "• Admin: http://localhost:8000/admin"