variable "tags" {
  type = map(string)
}

variable "region" {
  description = "google cloud region where the module infrastructure will be located"
  type        = string
}
