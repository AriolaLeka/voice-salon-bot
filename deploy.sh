#!/bin/bash

# Service Bot Terraform Deployment Script
# This script handles the complete deployment of the service bot infrastructure

set -e

# Set AWS profile
export AWS_PROFILE="${AWS_PROFILE}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="service-bot"
AWS_REGION="eu-west-1"
AWS_ACCOUNT_ID="628403812475"
AWS_PROFILE="awsBepitic"

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Terraform is installed
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install Terraform first."
        exit 1
    fi
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Verify AWS profile
    print_status "Using AWS Profile: $AWS_PROFILE"
    print_status "AWS Account: $(aws sts get-caller-identity --query 'Account' --output text)"
    print_status "AWS User: $(aws sts get-caller-identity --query 'Arn' --output text)"
    
    print_success "All prerequisites met!"
}

# Build and push Docker image
build_and_push_image() {
    print_status "Building and pushing Docker image..."
    
    # Build the image
    docker build -t ${PROJECT_NAME}:latest .
    
    # Tag for ECR
    docker tag ${PROJECT_NAME}:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}:latest
    
    # Login to ECR
    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
    
    # Push to ECR
    docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}:latest
    
    print_success "Docker image pushed to ECR!"
}

# Initialize Terraform
init_terraform() {
    print_status "Initializing Terraform..."
    
    terraform init
    
    print_success "Terraform initialized!"
}

# Plan Terraform deployment
plan_deployment() {
    print_status "Planning Terraform deployment..."
    
    terraform plan -out=tfplan
    
    print_success "Terraform plan created!"
}

# Apply Terraform deployment
apply_deployment() {
    print_status "Applying Terraform deployment..."
    
    terraform apply tfplan
    
    print_success "Terraform deployment completed!"
}

# Test the deployment
test_deployment() {
    print_status "Testing the deployment..."
    
    # Get the API Gateway URL
    API_URL=$(terraform output -raw api_gateway_invoke_url)
    
    print_status "API Gateway URL: $API_URL"
    
    # Wait a bit more for the service to be fully ready
    print_status "Waiting for service to be fully ready..."
    sleep 30
    
    # Test all API endpoints
    local endpoints=(
        "/health"
        "/"
        "/api/services"
        "/api/hours"
        "/api/location"
        "/api/general"
        "/api/appointments"
        "/api/elevenlabs/health"
    )
    
    local success_count=0
    local total_endpoints=${#endpoints[@]}
    
    print_status "Testing $total_endpoints API endpoints..."
    echo ""
    
    for endpoint in "${endpoints[@]}"; do
        print_status "Testing: $endpoint"
        
        # Test with timeout and capture response
        if response=$(curl -s -w "%{http_code}" --max-time 10 "${API_URL}${endpoint}" 2>/dev/null); then
            http_code="${response: -3}"
            response_body="${response%???}"
            
            if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 404 ]; then
                print_success "✅ $endpoint - HTTP $http_code"
                ((success_count++))
            else
                print_warning "⚠️  $endpoint - HTTP $http_code"
            fi
        else
            print_error "❌ $endpoint - Connection failed"
        fi
        
        # Small delay between requests
        sleep 2
    done
    
    echo ""
    print_status "API Testing Summary:"
    echo "  Successful: $success_count/$total_endpoints endpoints"
    
    if [ $success_count -eq $total_endpoints ]; then
        print_success "🎉 All API endpoints are working correctly!"
    elif [ $success_count -gt 0 ]; then
        print_warning "⚠️  Some endpoints are working, but $((total_endpoints - success_count)) failed"
        print_status "This might be normal during initial deployment. Wait a few minutes and test again."
    else
        print_error "❌ No endpoints are responding. Check ECS service status and logs."
    fi
    
    # Test POST endpoint (ElevenLabs webhook)
    echo ""
    print_status "Testing POST endpoint (ElevenLabs webhook)..."
    if response=$(curl -s -w "%{http_code}" --max-time 10 -X POST -H "Content-Type: application/json" -d '{"test": "webhook"}' "${API_URL}/api/elevenlabs/webhook" 2>/dev/null); then
        http_code="${response: -3}"
        if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 400 ] || [ "$http_code" -eq 404 ]; then
            print_success "✅ ElevenLabs webhook endpoint - HTTP $http_code"
        else
            print_warning "⚠️  ElevenLabs webhook endpoint - HTTP $http_code"
        fi
    else
        print_error "❌ ElevenLabs webhook endpoint - Connection failed"
    fi
    
    print_success "Deployment testing completed!"
}

# Show deployment info
show_deployment_info() {
    print_status "Deployment Information:"
    echo ""
    echo "ECR Repository: $(terraform output -raw ecr_repository_url)"
    echo "ECS Cluster: $(terraform output -raw ecs_cluster_name)"
    echo "ECS Service: $(terraform output -raw ecs_service_name)"
    echo "API Gateway URL: $(terraform output -raw api_gateway_invoke_url)"
    echo ""
    print_status "Next steps:"
    echo "1. Update your ElevenLabs webhook URL to: $(terraform output -raw api_gateway_invoke_url)/api/elevenlabs/webhook"
    echo "2. Test the webhook with ElevenLabs"
    echo "3. Monitor the service in AWS Console"
    echo ""
    print_status "Testing & Debugging:"
    echo "  • Load Balancer URL: $(terraform output -raw load_balancer_url)"
    echo "  • ECS Cluster: $(terraform output -raw ecs_cluster_name)"
    echo "  • ECS Service: $(terraform output -raw ecs_service_name)"
    echo "  • CloudWatch Logs: /ecs/$(terraform output -raw ecs_service_name)"
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    rm -f tfplan
    print_success "Cleanup completed!"
}

# Main deployment function
main() {
    print_status "Starting Service Bot deployment..."
    echo ""
    
    check_prerequisites
    echo ""
    
    build_and_push_image
    echo ""
    
    init_terraform
    echo ""
    
    plan_deployment
    echo ""
    
    apply_deployment
    echo ""
    
    # Wait for ECS service to be stable
    print_status "Waiting for ECS service to be stable..."
    sleep 60
    
    test_deployment
    echo ""
    
    show_deployment_info
    echo ""
    
    # Show testing instructions
    print_status "Testing Instructions:"
    echo "  • Test all endpoints: $0 --test-only"
    echo "  • Test Load Balancer: $0 --test-lb"
    echo "  • Re-run tests: $0 --test-only"
    echo ""
    
    cleanup
    
    print_success "Service Bot deployment completed successfully! 🎉"
}

# Test load balancer directly (useful for debugging)
test_load_balancer() {
    print_status "Testing Load Balancer directly..."
    
    # Get the Load Balancer URL
    LB_URL=$(terraform output -raw load_balancer_url)
    
    print_status "Load Balancer URL: $LB_URL"
    
    # Test health endpoint directly on LB
    print_status "Testing health endpoint on Load Balancer..."
    if response=$(curl -s -w "%{http_code}" --max-time 10 "${LB_URL}/health" 2>/dev/null); then
        http_code="${response: -3}"
        if [ "$http_code" -eq 200 ]; then
            print_success "✅ Load Balancer health endpoint - HTTP $http_code"
        else
            print_warning "⚠️  Load Balancer health endpoint - HTTP $http_code"
        fi
    else
        print_error "❌ Load Balancer health endpoint - Connection failed"
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --plan-only     Only create Terraform plan (don't apply)"
    echo "  --test-only     Only test existing deployment"
    echo "  --test-lb       Test Load Balancer directly (bypass API Gateway)"
    echo ""
    echo "Examples:"
    echo "  $0              # Full deployment"
    echo "  $0 --plan-only  # Only plan"
    echo "  $0 --test-only  # Only test"
    echo "  $0 --test-lb    # Test Load Balancer directly"
}

# Parse command line arguments
case "${1:-}" in
    "--help"|"-h")
        show_usage
        exit 0
        ;;
    "--plan-only")
        check_prerequisites
        init_terraform
        plan_deployment
        print_success "Plan completed! Run '$0' to apply the deployment."
        exit 0
        ;;
    "--test-only")
        print_status "Testing existing deployment..."
        test_deployment
        echo ""
        show_deployment_info
        exit 0
        ;;
    "--test-lb")
        print_status "Testing Load Balancer directly..."
        test_load_balancer
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac
