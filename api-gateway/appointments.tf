# Appointments Endpoints Configuration

# Appointments book endpoint
resource "aws_api_gateway_method" "appointments_book_post" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.appointments_book.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "appointments_book_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.appointments_book.id
  http_method = aws_api_gateway_method.appointments_book_post.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "POST"
  uri                     = "http://${var.lb_dns_name}/api/appointments/book"
}

# Appointments available times endpoint
resource "aws_api_gateway_method" "appointments_available_times_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.appointments_available_times.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "appointments_available_times_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.appointments_available_times.id
  http_method = aws_api_gateway_method.appointments_available_times_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/appointments/available-times"
}

# Appointments available times with date endpoint
resource "aws_api_gateway_method" "appointments_available_times_date_get" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.appointments_available_times_date.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "appointments_available_times_date_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.appointments_available_times_date.id
  http_method = aws_api_gateway_method.appointments_available_times_date_get.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "GET"
  uri                     = "http://${var.lb_dns_name}/api/appointments/available-times/{date}"
}

# Appointments parse datetime endpoint
resource "aws_api_gateway_method" "appointments_parse_datetime_post" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.appointments_parse_datetime.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "appointments_parse_datetime_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.appointments_parse_datetime.id
  http_method = aws_api_gateway_method.appointments_parse_datetime_post.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "POST"
  uri                     = "http://${var.lb_dns_name}/api/appointments/parse-datetime"
}

# Appointments send email endpoint
resource "aws_api_gateway_method" "appointments_send_email_post" {
  rest_api_id   = aws_api_gateway_rest_api.service_bot.id
  resource_id   = aws_api_gateway_resource.appointments_send_email.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "appointments_send_email_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_bot.id
  resource_id = aws_api_gateway_resource.appointments_send_email.id
  http_method = aws_api_gateway_method.appointments_send_email_post.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "POST"
  uri                     = "http://${var.lb_dns_name}/api/appointments/send-email"
}
