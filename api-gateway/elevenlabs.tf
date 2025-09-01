# ElevenLabs Endpoints Configuration

# ElevenLabs webhook endpoint
resource "aws_api_gateway_method" "webhook_post" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.webhook.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "webhook_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.webhook.id
  http_method = aws_api_gateway_method.webhook_post.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "POST"
  uri                     = "http://${var.lb_dns_name}/api/elevenlabs/webhook"
}

# ElevenLabs health endpoint
resource "aws_api_gateway_method" "elevenlabs_health_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.elevenlabs_health.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "elevenlabs_health_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.elevenlabs_health.id
  http_method = aws_api_gateway_method.elevenlabs_health_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/elevenlabs/health"
}
