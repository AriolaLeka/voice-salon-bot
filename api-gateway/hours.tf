# Hours Endpoints Configuration

# Hours endpoint
resource "aws_api_gateway_method" "hours_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.hours.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "hours_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.hours.id
  http_method = aws_api_gateway_method.hours_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/hours"
}

# Hours today endpoint
resource "aws_api_gateway_method" "hours_today_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.hours_today.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "hours_today_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.hours_today.id
  http_method = aws_api_gateway_method.hours_today_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/hours/today"
}

# Hours status endpoint
resource "aws_api_gateway_method" "hours_status_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.hours_status.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "hours_status_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.hours_status.id
  http_method = aws_api_gateway_method.hours_status_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/hours/status"
}

# Hours week endpoint
resource "aws_api_gateway_method" "hours_week_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.hours_week.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "hours_week_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.hours_week.id
  http_method = aws_api_gateway_method.hours_week_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/hours/week"
}
