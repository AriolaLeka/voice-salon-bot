# Health Endpoints Configuration

# Health endpoint
resource "aws_api_gateway_method" "health_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.root.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "health_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.root.id
  http_method = aws_api_gateway_method.health_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/health"
}

# Root endpoint (API documentation)
resource "aws_api_gateway_method" "root_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_rest_api.service_bot.root_resource_id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "root_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_rest_api.service_bot.root_resource_id
  http_method = aws_api_gateway_method.root_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/"
}

# CORS Configuration
resource "aws_api_gateway_method" "options" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_rest_api.service_bot.root_resource_id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_rest_api.service_bot.root_resource_id
  http_method = aws_api_gateway_method.options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration" "options" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_rest_api.service_bot.root_resource_id
  http_method = aws_api_gateway_method.options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_rest_api.service_bot.root_resource_id
  http_method = aws_api_gateway_method.options.http_method
  status_code = aws_api_gateway_method_response.options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}
