#!/bin/bash

# 🚀 EC2 Deployment Script for Material Kit React App
# This script deploys your full-stack application to AWS EC2 using Elastic Beanstalk
# Maintains your existing RDS MySQL setup

set -e  # Exit on any error

echo "🚀 Starting EC2 Deployment Process..."

# Colors for output
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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if EB CLI is installed
    if ! command -v eb &> /dev/null; then
        print_error "AWS EB CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install it first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install it first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "All prerequisites met!"
}

# Get user input for configuration
get_configuration() {
    print_status "Getting deployment configuration..."
    
    # Get RDS endpoint
    read -p "Enter your RDS MySQL endpoint (e.g., dashboard-mysql.xxxxx.us-east-1.rds.amazonaws.com): " RDS_ENDPOINT
    if [ -z "$RDS_ENDPOINT" ]; then
        print_error "RDS endpoint is required!"
        exit 1
    fi
    
    # Get RDS password
    read -s -p "Enter your RDS MySQL password: " RDS_PASSWORD
    echo
    if [ -z "$RDS_PASSWORD" ]; then
        print_error "RDS password is required!"
        exit 1
    fi
    
    # Get application name
    read -p "Enter application name (default: material-kit-app): " APP_NAME
    APP_NAME=${APP_NAME:-material-kit-app}
    
    # Get environment name
    read -p "Enter environment name (default: material-kit-env): " ENV_NAME
    ENV_NAME=${ENV_NAME:-material-kit-env}
    
    # Get region
    read -p "Enter AWS region (default: us-east-1): " AWS_REGION
    AWS_REGION=${AWS_REGION:-us-east-1}
    
    # Get JWT secret
    read -s -p "Enter JWT secret (or press Enter to generate): " JWT_SECRET
    echo
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -base64 32)
        print_success "Generated JWT secret"
    fi
    
    print_success "Configuration collected!"
}

# Create production environment file
create_production_env() {
    print_status "Creating production environment configuration..."
    
    cat > backend/.env.production << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=5000

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRE=7d

# Database Configuration (RDS)
DATABASE_URL=mysql://admin:$RDS_PASSWORD@$RDS_ENDPOINT:3306/cloud
DB_HOST=$RDS_ENDPOINT
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=$RDS_PASSWORD
DB_NAME=cloud

# Frontend URL (will be updated after deployment)
FRONTEND_URL=http://$ENV_NAME.$AWS_REGION.elasticbeanstalk.com

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads

# Logging
LOG_LEVEL=info
EOF
    
    print_success "Production environment file created!"
}

# Build the application
build_application() {
    print_status "Building application..."
    
    # Install dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Build backend
    print_status "Building backend..."
    cd backend
    npm install
    npm run build
    cd ..
    
    # Build frontend
    print_status "Building frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
    
    print_success "Application built successfully!"
}

# Create Elastic Beanstalk configuration
create_eb_config() {
    print_status "Creating Elastic Beanstalk configuration..."
    
    # Create .ebextensions directory
    mkdir -p .ebextensions
    
    # Create Node.js configuration
    cat > .ebextensions/01-nodejs.config << EOF
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
    NodeVersion: 18.20.4
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 5000
  aws:elasticbeanstalk:environment:proxy:staticfiles:
    /uploads: uploads
    /static: frontend/out/_next/static
EOF
    
    # Create platform configuration
    cat > .ebextensions/02-platform.config << EOF
option_settings:
  aws:autoscaling:launchconfiguration:
    IamInstanceProfile: aws-elasticbeanstalk-ec2-role
  aws:elasticbeanstalk:environment:
    LoadBalancerType: application
  aws:elasticbeanstalk:environment:process:default:
    HealthCheckPath: /health
    Port: 5000
    Protocol: HTTP
EOF
    
    # Create Procfile for production
    cat > Procfile << EOF
web: cd backend && npm start
EOF
    
    # Create package.json for root (required by EB)
    cat > package.json << EOF
{
  "name": "material-kit-react-main",
  "version": "1.0.0",
  "description": "Full-stack application with React frontend and Node.js backend",
  "main": "backend/dist/index.js",
  "scripts": {
    "start": "cd backend && npm start",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "cd frontend && npm run build",
    "postinstall": "cd backend && npm install && cd ../frontend && npm install"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "keywords": ["react", "nodejs", "mysql", "aws"],
  "author": "",
  "license": "MIT"
}
EOF
    
    print_success "Elastic Beanstalk configuration created!"
}

# Initialize and deploy to Elastic Beanstalk
deploy_to_eb() {
    print_status "Deploying to Elastic Beanstalk..."
    
    # Initialize EB application (if not already initialized)
    if [ ! -f ".elasticbeanstalk/config.yml" ]; then
        print_status "Initializing Elastic Beanstalk application..."
        eb init $APP_NAME --platform node.js-18 --region $AWS_REGION
    fi
    
    # Create environment (if not exists)
    if ! eb list | grep -q $ENV_NAME; then
        print_status "Creating Elastic Beanstalk environment..."
        eb create $ENV_NAME --instance-type t3.micro --platform-version "Node.js 18"
    fi
    
    # Copy production environment file
    cp backend/.env.production backend/.env
    
    # Deploy the application
    print_status "Deploying application..."
    eb deploy $ENV_NAME
    
    # Get the application URL
    APP_URL=$(eb status $ENV_NAME | grep "CNAME" | awk '{print $2}')
    
    print_success "Application deployed successfully!"
    print_success "Application URL: http://$APP_URL"
    
    # Update frontend environment with actual URL
    print_status "Updating frontend configuration..."
    cat > frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=http://$APP_URL
NEXT_PUBLIC_APP_URL=http://$APP_URL
EOF
    
    # Update backend environment with actual frontend URL
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://$APP_URL|g" backend/.env
    
    # Redeploy with updated configuration
    print_status "Redeploying with updated configuration..."
    eb deploy $ENV_NAME
    
    print_success "Deployment completed successfully!"
    print_success "Your application is now live at: http://$APP_URL"
}

# Test the deployment
test_deployment() {
    print_status "Testing deployment..."
    
    APP_URL=$(eb status $ENV_NAME | grep "CNAME" | awk '{print $2}')
    
    # Test health endpoint
    print_status "Testing health endpoint..."
    if curl -f -s "http://$APP_URL/health" > /dev/null; then
        print_success "Health check passed!"
    else
        print_warning "Health check failed. Check the logs with: eb logs"
    fi
    
    # Test database connection
    print_status "Testing database connection..."
    if curl -f -s "http://$APP_URL/api/health" > /dev/null; then
        print_success "Database connection test passed!"
    else
        print_warning "Database connection test failed. Check the logs with: eb logs"
    fi
}

# Main deployment function
main() {
    echo "🚀 Material Kit React - EC2 Deployment Script"
    echo "=============================================="
    echo
    
    check_prerequisites
    get_configuration
    create_production_env
    build_application
    create_eb_config
    deploy_to_eb
    test_deployment
    
    echo
    echo "🎉 Deployment completed successfully!"
    echo "=============================================="
    echo "Application URL: http://$(eb status $ENV_NAME | grep "CNAME" | awk '{print $2}')"
    echo "Environment: $ENV_NAME"
    echo "Region: $AWS_REGION"
    echo
    echo "📋 Useful commands:"
    echo "  eb status          - Check environment status"
    echo "  eb logs            - View application logs"
    echo "  eb health          - Check environment health"
    echo "  eb open            - Open application in browser"
    echo "  eb terminate       - Terminate environment (when done)"
    echo
    echo "🔧 Troubleshooting:"
    echo "  If deployment fails, check logs with: eb logs"
    echo "  If database connection fails, verify RDS security groups"
    echo "  If frontend doesn't load, check CORS settings"
    echo
}

# Run main function
main "$@"
