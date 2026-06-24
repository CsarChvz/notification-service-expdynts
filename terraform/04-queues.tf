data "aws_sqs_queue" "existente" {
  name = "cola-destino"
}

resource "aws_sqs_queue" "cola_destino" {
  count = length(data.aws_sqs_queue.existente.arn) > 0 ? 0 : 1
  
  name = "cola-destino"
}

locals {
  arn_cola_destino = length(data.aws_sqs_queue.existente.arn) > 0 ? data.aws_sqs_queue.existente.arn : aws_sqs_queue.cola_destino[0].arn
}