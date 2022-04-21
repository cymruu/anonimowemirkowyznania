variable "region" {
  description = "google cloud region where the infrastructure will be created"
  type        = string
  default     = "europe-west"
}

variable "tags" {
  type = map(string)
  default = {
    env        = "production"
    managed-by = "terraform"
  }
}
