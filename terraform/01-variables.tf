variable "aws_region" {
  description = "Región de AWS para el laboratorio"
  type        = string
  default     = "us-east-1"
}

variable "project_prefix" {
  description = "Prefijo para identificar los recursos"
  type        = string
  default     = "notification-service-expdynts"
}


variable "cola_destino" {
  type    = string
  default = "cola-destino"
}

data "aws_ssm_parameter" "db_url" {
  name = "/config/database_url"
}

data "aws_ssm_parameter" "notification_url" {
  name = "/config/notification_url"
}