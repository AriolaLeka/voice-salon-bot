terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables are defined in variables.tf

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# VPC and Networking
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Security Group
resource "aws_security_group" "service_bot" {
  name        = "${local.name_prefix}-sg"
  description = "Security group for Service Bot"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP from Load Balancer"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Container port for health checks"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.name_prefix}-sg"
  }
}

# ECR Repository
resource "aws_ecr_repository" "service_bot" {
  name                 = var.project_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${local.name_prefix}-ecr"
  }
}

# IAM Roles
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${local.name_prefix}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_secrets" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
}

resource "aws_iam_role" "ecs_task_role" {
  name = "${local.name_prefix}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# ECS Cluster
resource "aws_ecs_cluster" "service_bot" {
  name = "${local.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${local.name_prefix}-cluster"
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "service_bot" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = var.log_retention_days

  tags = {
    Name = "${local.name_prefix}-logs"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "service_bot" {
  family                   = var.project_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = var.project_name
      image = "${aws_ecr_repository.service_bot.repository_url}:latest"

      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "PORT"
          value = "3000"
        },
        {
          name  = "NODE_ENV"
          value = "production"
        }
      ]

      secrets = [
        {
          name      = "ELEVENLABS_API_KEY"
          valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:elevenlabs-api-key"
        },
        {
          name      = "ELEVENLABS_AGENT_ID"
          valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:elevenlabs-agent-id"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.service_bot.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command = [
          "CMD-SHELL",
          "node -e \"require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })\""
        ]
        interval    = var.health_check_interval
        timeout     = var.health_check_timeout
        retries     = var.health_check_retries
        startPeriod = var.health_check_start_period
      }

      essential = true
    }
  ])

  tags = {
    Name = "${local.name_prefix}-task-def"
  }
}

# Application Load Balancer
resource "aws_lb" "service_bot" {
  name               = "${local.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.service_bot.id]
  subnets            = data.aws_subnets.default.ids

  enable_deletion_protection = false

  tags = {
    Name = "${local.name_prefix}-alb"
  }
}

# Target Group
resource "aws_lb_target_group" "service_bot" {
  name        = "${local.name_prefix}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name = "${local.name_prefix}-tg"
  }
}

# Listener
resource "aws_lb_listener" "service_bot" {
  load_balancer_arn = aws_lb.service_bot.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.service_bot.arn
  }
}

# ECS Service
resource "aws_ecs_service" "service_bot" {
  name            = "${local.name_prefix}-service"
  cluster         = aws_ecs_cluster.service_bot.id
  task_definition = aws_ecs_task_definition.service_bot.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"
  platform_version = "LATEST"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.service_bot.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.service_bot.arn
    container_name   = var.project_name
    container_port   = var.container_port
  }

  depends_on = [aws_lb_listener.service_bot]

  tags = {
    Name = "${local.name_prefix}-service"
  }
}

# API Gateway
resource "aws_api_gateway_rest_api" "service_bot" {
  name        = "${local.name_prefix}-api"
  description = "Service Bot API Gateway"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name = "${local.name_prefix}-api"
  }
}

# API Gateway Resources
resource "aws_api_gateway_resource" "root" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_rest_api.service_bot.root_resource_id
  path_part   = "health"
}

resource "aws_api_gateway_resource" "api" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_rest_api.service_bot.root_resource_id
  path_part   = "api"
}

resource "aws_api_gateway_resource" "elevenlabs" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "elevenlabs"
}

resource "aws_api_gateway_resource" "webhook" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.elevenlabs.id
  path_part   = "webhook"
}

resource "aws_api_gateway_resource" "elevenlabs_health" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.elevenlabs.id
  path_part   = "health"
}

resource "aws_api_gateway_resource" "services" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "services"
}

resource "aws_api_gateway_resource" "hours" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "hours"
}

resource "aws_api_gateway_resource" "location" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "location"
}

# API Gateway Methods and Integrations are defined in api-gateway.tf

# API Gateway Stage
resource "aws_api_gateway_stage" "service_bot" {
  deployment_id = aws_api_gateway_deployment.service_bot.id
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  stage_name    = "prod"

  tags = {
    Name = "${local.name_prefix}-stage"
  }
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "service_bot" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id

  depends_on = [
    aws_api_gateway_integration.health_integration,
    aws_api_gateway_integration.services_integration,
    aws_api_gateway_integration.hours_integration,
    aws_api_gateway_integration.location_integration,
    aws_api_gateway_integration.webhook_integration,
    aws_api_gateway_integration.elevenlabs_health_integration,
    aws_api_gateway_integration.root_integration,
    aws_lb.service_bot
  ]

  lifecycle {
    create_before_destroy = true
  }
}

# Outputs
output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.service_bot.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.service_bot.name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.service_bot.name
}

output "api_gateway_url" {
  description = "API Gateway invoke URL"
  value       = "${aws_api_gateway_rest_api.service_bot.execution_arn}/*"
}

output "api_gateway_invoke_url" {
  description = "API Gateway invoke URL"
  value       = "https://${aws_api_gateway_rest_api.service_bot.id}.execute-api.${var.aws_region}.amazonaws.com/prod"
}

output "load_balancer_dns" {
  description = "Load Balancer DNS name"
  value       = aws_lb.service_bot.dns_name
}

output "load_balancer_url" {
  description = "Load Balancer URL"
  value       = "http://${aws_lb.service_bot.dns_name}"
}
