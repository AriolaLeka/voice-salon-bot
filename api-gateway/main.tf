# Main API Gateway Configuration
# This file contains the core API Gateway resources

# API Gateway
resource "aws_api_gateway_rest_api" "service_bot" {
  name        = "${var.name_prefix}-api"
  description = "Service Bot API Gateway"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name = "${var.name_prefix}-api"
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

# ElevenLabs resources
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

# Services resources
resource "aws_api_gateway_resource" "services" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "services"
}

resource "aws_api_gateway_resource" "services_search" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.services.id
  path_part   = "search"
}

resource "aws_api_gateway_resource" "services_category" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.services.id
  path_part   = "category"
}

resource "aws_api_gateway_resource" "services_popular" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.services.id
  path_part   = "popular"
}

resource "aws_api_gateway_resource" "services_price_range" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.services.id
  path_part   = "price-range"
}

resource "aws_api_gateway_resource" "services_test_search" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.services.id
  path_part   = "test-search"
}

resource "aws_api_gateway_resource" "services_test_search_term" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.services_test_search.id
  path_part   = "{term}"
}

resource "aws_api_gateway_resource" "services_price_range_min" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.services_price_range.id
  path_part   = "{min}"
}

resource "aws_api_gateway_resource" "services_price_range_min_max" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.services_price_range_min.id
  path_part   = "{max}"
}

resource "aws_api_gateway_resource" "services_category_dynamic" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.services.id
  path_part   = "{category}"
}

# Hours resources
resource "aws_api_gateway_resource" "hours" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "hours"
}

resource "aws_api_gateway_resource" "hours_today" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.hours.id
  path_part   = "today"
}

resource "aws_api_gateway_resource" "hours_status" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.hours.id
  path_part   = "status"
}

resource "aws_api_gateway_resource" "hours_week" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.hours.id
  path_part   = "week"
}

# Location resources
resource "aws_api_gateway_resource" "location" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "location"
}

resource "aws_api_gateway_resource" "location_address" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.location.id
  path_part   = "address"
}

resource "aws_api_gateway_resource" "location_directions" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.location.id
  path_part   = "directions"
}

resource "aws_api_gateway_resource" "location_transport" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.location.id
  path_part   = "transport"
}

resource "aws_api_gateway_resource" "location_parking" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.location.id
  path_part   = "parking"
}

resource "aws_api_gateway_resource" "location_summary" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.location.id
  path_part   = "summary"
}

# General resources
resource "aws_api_gateway_resource" "general" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "general"
}

resource "aws_api_gateway_resource" "general_welcome" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.general.id
  path_part   = "welcome"
}

resource "aws_api_gateway_resource" "general_about" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.general.id
  path_part   = "about"
}

resource "aws_api_gateway_resource" "general_services_overview" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.general.id
  path_part   = "services-overview"
}

resource "aws_api_gateway_resource" "general_contact" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.general.id
  path_part   = "contact"
}

resource "aws_api_gateway_resource" "general_status" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.general.id
  path_part   = "status"
}

# Appointments resources
resource "aws_api_gateway_resource" "appointments" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "appointments"
}

resource "aws_api_gateway_resource" "appointments_book" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.appointments.id
  path_part   = "book"
}

resource "aws_api_gateway_resource" "appointments_available_times" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.appointments.id
  path_part   = "available-times"
}

resource "aws_api_gateway_resource" "appointments_available_times_date" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.appointments_available_times.id
  path_part   = "{date}"
}

resource "aws_api_gateway_resource" "appointments_parse_datetime" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  parent_id   = aws_api_gateway_resource.appointments.id
  path_part   = "parse-datetime"
}

# API Gateway Stage
resource "aws_api_gateway_stage" "service_bot" {
  deployment_id = aws_api_gateway_deployment.service_bot.id
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  stage_name    = var.stage_name

  tags = {
    Name = "${var.name_prefix}-stage"
  }
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "service_bot" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id

  depends_on = [
    # Health
    aws_api_gateway_integration.health_integration,
    aws_api_gateway_integration.root_integration,
    
    # Services
    aws_api_gateway_integration.services_integration,
    aws_api_gateway_integration.services_search_integration,
    aws_api_gateway_integration.services_category_integration,
    aws_api_gateway_integration.services_popular_integration,
    aws_api_gateway_integration.services_price_range_integration,
    aws_api_gateway_integration.services_test_search_integration,
    aws_api_gateway_integration.services_test_search_term_integration,
    aws_api_gateway_integration.services_price_range_min_integration,
    aws_api_gateway_integration.services_price_range_min_max_integration,
    aws_api_gateway_integration.services_category_dynamic_integration,
    
    # Hours
    aws_api_gateway_integration.hours_integration,
    aws_api_gateway_integration.hours_today_integration,
    aws_api_gateway_integration.hours_status_integration,
    aws_api_gateway_integration.hours_week_integration,
    
    # Location
    aws_api_gateway_integration.location_integration,
    aws_api_gateway_integration.location_address_integration,
    aws_api_gateway_integration.location_directions_integration,
    aws_api_gateway_integration.location_transport_integration,
    aws_api_gateway_integration.location_parking_integration,
    aws_api_gateway_integration.location_summary_integration,
    
    # General
    aws_api_gateway_integration.general_welcome_integration,
    aws_api_gateway_integration.general_about_integration,
    aws_api_gateway_integration.general_services_overview_integration,
    aws_api_gateway_integration.general_contact_integration,
    aws_api_gateway_integration.general_status_integration,
    
    # Appointments
    aws_api_gateway_integration.appointments_book_integration,
    aws_api_gateway_integration.appointments_available_times_integration,
    aws_api_gateway_integration.appointments_available_times_date_integration,
    aws_api_gateway_integration.appointments_parse_datetime_integration,
    
    # ElevenLabs
    aws_api_gateway_integration.webhook_integration,
    aws_api_gateway_integration.elevenlabs_health_integration
  ]

  lifecycle {
    create_before_destroy = true
  }
}
