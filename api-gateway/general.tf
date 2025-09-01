# General Endpoints Configuration

# General welcome endpoint
resource "aws_api_gateway_method" "general_welcome_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.general_welcome.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "general_welcome_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.general_welcome.id
  http_method = aws_api_gateway_method.general_welcome_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/general/welcome"
}

# General about endpoint
resource "aws_api_gateway_method" "general_about_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.general_about.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "general_about_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.general_about.id
  http_method = aws_api_gateway_method.general_about_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/general/about"
}

# General services overview endpoint
resource "aws_api_gateway_method" "general_services_overview_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.general_services_overview.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "general_services_overview_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.general_services_overview.id
  http_method = aws_api_gateway_method.general_services_overview_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/general/services-overview"
}

# General contact endpoint
resource "aws_api_gateway_method" "general_contact_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.general_contact.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "general_contact_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.general_contact.id
  http_method = aws_api_gateway_method.general_contact_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/general/contact"
}

# General status endpoint
resource "aws_api_gateway_method" "general_status_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.general_status.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "general_status_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.general_status.id
  http_method = aws_api_gateway_method.general_status_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/general/status"
}
