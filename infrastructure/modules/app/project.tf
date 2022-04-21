resource "google_project" "anonimowe-tf" {
  name            = "anonimowe - ${var.tags["env"]}"
  project_id      = "anonimowe-tf-${var.tags["env"]}"
  billing_account = "01DF35-0748D3-A42D64"

}
