# Services Endpoints Configuration

# Services endpoint
resource "aws_api_gateway_method" "services_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.services.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "services_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.services.id
  http_method = aws_api_gateway_method.services_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/services"
}

# Services search endpoint
resource "aws_api_gateway_method" "services_search_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.services_search.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "services_search_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.services_search.id
  http_method = aws_api_gateway_method.services_search_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/services/search"
}

# Services category endpoint
resource "aws_api_gateway_method" "services_category_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.services_category.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "services_category_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.services_category.id
  http_method = aws_api_gateway_method.services_category_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/services/category"
}

# Services popular endpoint
resource "aws_api_gateway_method" "services_popular_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.services_popular.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "services_popular_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.services_popular.id
  http_method = aws_api_gateway_method.services_popular_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/services/popular"
}

# Services price range endpoint
resource "aws_api_gateway_method" "services_price_range_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.services_price_range.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "services_price_range_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.services_price_range.id
  http_method = aws_api_gateway_method.services_price_range_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/services/price-range"
}

# Services test search endpoint
resource "aws_api_gateway_method" "services_test_search_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.services_test_search.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "services_test_search_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.services_test_search.id
  http_method = aws_api_gateway_method.services_test_search_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/services/test-search"
}

# Services test search term endpoint
resource "aws_api_gateway_method" "services_test_search_term_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.services_test_search_term.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "services_test_search_term_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.services_test_search_term.id
  http_method = aws_api_gateway_method.services_test_search_term_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/services/test-search/{term}"
}

# Services price range min endpoint
resource "aws_api_gateway_method" "services_price_range_min_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.services_price_range_min.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "services_price_range_min_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.services_price_range_min.id
  http_method = aws_api_gateway_method.services_price_range_min_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/services/price-range/{min}"
}

# Services price range min max endpoint
resource "aws_api_gateway_method" "services_price_range_min_max_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.services_price_range_min_max.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "services_price_range_min_max_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.services_price_range_min_max.id
  http_method = aws_api_gateway_method.services_price_range_min_max_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/services/price-range/{min}/{max}"
}

# Services category dynamic endpoint
resource "aws_api_gateway_method" "services_category_dynamic_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.services_category_dynamic.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "services_category_dynamic_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.services_category_dynamic.id
  http_method = aws_api_gateway_method.services_category_dynamic_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/services/{category}"
}
