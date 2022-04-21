module "app" {
  source = "../modules/app"
  tags   = var.tags
  region = var.region
}
