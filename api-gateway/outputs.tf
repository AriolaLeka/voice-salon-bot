# API Gateway Outputs

output "api_gateway_url" {
  description = "API Gateway execute ARN"
  value       = "${aws_api_gateway_rest_api.service_bot.execution_arn}/*"
}

output "api_gateway_invoke_url" {
  description = "API Gateway invoke URL"
  value       = "https://${aws_api_gateway_rest_api.service_bot.id}.execute-api.${var.aws_region}.amazonaws.com/${var.stage_name}"
}
