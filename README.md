# 🚀 Service Bot - Voice Salon Assistant

An AI-powered voice bot for salon services, built with Node.js and ElevenLabs integration, deployed on AWS using Terraform.

## 🎯 **What It Does**

- **Voice Assistant** - AI-powered salon service recommendations
- **Service Information** - Salon services, hours, location, and pricing
- **Appointment Booking** - Voice-based appointment scheduling
- **Multi-language Support** - English and Spanish
- **ElevenLabs Integration** - High-quality voice synthesis

## 🏗️ **Architecture**

```
Internet → API Gateway → Load Balancer → ECS Container (Port 3000)
```

- **API Gateway** - HTTP API with CORS support
- **Application Load Balancer** - Stable endpoint for traffic
- **ECS Fargate** - Serverless container hosting
- **ECR** - Docker image storage
- **CloudWatch** - Application logging and monitoring

## 🚀 **Quick Start**

### **Prerequisites**
```bash
# Install required tools
brew install terraform docker awscli

# Configure AWS credentials
aws configure --profile awsBepitic
export AWS_PROFILE=awsBepitic
```

### **Deploy Everything**
```bash
# Run the automated deployment
./deploy.sh
```

This will:
1. ✅ Build and push Docker image to ECR
2. ✅ Create all AWS infrastructure with Terraform
3. ✅ Deploy the application
4. ✅ Test all API endpoints
5. ✅ Show deployment information

## 📡 **API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/` | GET | API documentation |
| `/api/services` | GET | Salon services |
| `/api/hours` | GET | Business hours |
| `/api/location` | GET | Location & parking |
| `/api/elevenlabs/webhook` | POST | ElevenLabs webhook |
| `/api/elevenlabs/health` | GET | Integration status |

## 🔧 **Configuration**

### **Environment Variables**
The container needs these secrets in AWS Secrets Manager:
- `elevenlabs-api-key` - Your ElevenLabs API key
- `elevenlabs-agent-id` - Your ElevenLabs agent ID

### **Customize Deployment**
```bash
# View current variables
cat variables.tf

# Override variables
terraform apply -var="container_cpu=512" -var="container_memory=1024"
```

## 📊 **Deployment Options**

```bash
# Full deployment
./deploy.sh

# Only plan (don't apply)
./deploy.sh --plan-only

# Only test existing deployment
./deploy.sh --test-only

# Show help
./deploy.sh --help
```

## 🧹 **Cleanup**

```bash
# Remove all infrastructure
terraform destroy

# Remove specific resources
terraform destroy -target=aws_ecs_service.service_bot
```

## 🔍 **Monitoring**

### **Check ECS Status**
```bash
aws ecs describe-services \
  --cluster service-bot-production-cluster \
  --services service-bot-production-service \
  --region eu-west-1
```

### **View Logs**
```bash
aws logs describe-log-groups \
  --log-group-name-prefix "/ecs/service-bot" \
  --region eu-west-1
```

### **Test API**
```bash
# Get API URL
API_URL=$(terraform output -raw api_gateway_invoke_url)

# Test endpoints
curl "${API_URL}/health"
curl "${API_URL}/api/services"
```

## 🚨 **Important Notes**

1. **AWS Profile** - Uses `awsBepitic` profile automatically
2. **Region** - Deploys to `eu-west-1` (Ireland)
3. **Cost** - ECS Fargate + ALB + API Gateway (minimal for dev)
4. **Security** - Private VPC with security groups
5. **Scaling** - ECS handles auto-scaling automatically

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Terraform not installed**
   ```bash
   brew install terraform
   ```

2. **AWS credentials not configured**
   ```bash
   aws configure --profile awsBepitic
   export AWS_PROFILE=awsBepitic
   ```

3. **Docker build fails**
   ```bash
   # Test locally first
   docker build -t service-bot:latest .
   docker run -p 3000:3000 service-bot:latest
   ```

4. **ECS service not starting**
   ```bash
   # Check task definition
   aws ecs describe-task-definition --task-definition service-bot --region eu-west-1
   ```

## 🎯 **Next Steps After Deployment**

1. **Update ElevenLabs** - Set webhook URL to new API Gateway endpoint
2. **Test Voice Integration** - Verify ElevenLabs agent works
3. **Monitor Performance** - Check CloudWatch metrics
4. **Scale if Needed** - Adjust ECS task count or resources

## 📁 **Project Structure**

```
├── main.tf                 # Main infrastructure
├── api-gateway.tf          # API Gateway configuration
├── variables.tf            # Configurable variables
├── deploy.sh               # Deployment automation
├── Dockerfile              # Container configuration
├── index.js                # Main application
├── routes/                 # API route handlers
└── elevenlabs-integration.js # Voice AI integration
```

---

**🎉 Ready to deploy? Run `./deploy.sh` and watch the magic happen!** 