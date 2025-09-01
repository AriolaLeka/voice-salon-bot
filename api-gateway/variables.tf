variable "name_prefix" {
  description = "Project name prefix (e.g., service-bot-production)"
  type        = string
}

variable "lb_dns_name" {
  description = "Application Load Balancer DNS name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "stage_name" {
  description = "API Gateway stage name"
  type        = string
  default     = "prod"
}

