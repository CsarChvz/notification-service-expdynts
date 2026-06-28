# Cola Destino (Notificaciones)
resource "aws_sqs_queue" "cola_destino" {
  name = var.cola_destino
}