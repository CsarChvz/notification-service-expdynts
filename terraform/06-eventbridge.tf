resource "aws_pipes_pipe" "notification_pipe" {
  name     = "${var.project_prefix}-pipe"
  role_arn = aws_iam_role.pipe_role.arn

  source = locals.arn_cola_destino
  source_parameters {
    sqs_queue_parameters {
      batch_size = 2 
    }
  }

  target = module.lambda_function.lambda_function_arn
}