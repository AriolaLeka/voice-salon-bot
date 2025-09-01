# Location Endpoints Configuration

# Location endpoint
resource "aws_api_gateway_method" "location_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.location.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "location_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.location.id
  http_method = aws_api_gateway_method.location_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/location"
}

# Location address endpoint
resource "aws_api_gateway_method" "location_address_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.location_address.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "location_address_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.location_address.id
  http_method = aws_api_gateway_method.location_address_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/location/address"
}

# Location directions endpoint
resource "aws_api_gateway_method" "location_directions_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.location_directions.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "location_directions_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.location_directions.id
  http_method = aws_api_gateway_method.location_directions_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/location/directions"
}

# Location transport endpoint
resource "aws_api_gateway_method" "location_transport_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.location_transport.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "location_transport_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.location_transport.id
  http_method = aws_api_gateway_method.location_transport_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/location/transport"
}

# Location parking endpoint
resource "aws_api_gateway_method" "location_parking_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.location_parking.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "location_parking_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.location_parking.id
  http_method = aws_api_gateway_method.location_parking_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/location/parking"
}

# Location summary endpoint
resource "aws_api_gateway_method" "location_summary_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.location_summary.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "location_summary_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.location_summary.id
  http_method = aws_api_gateway_method.location_summary_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/location/summary"
}
