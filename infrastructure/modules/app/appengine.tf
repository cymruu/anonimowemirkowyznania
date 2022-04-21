resource "google_app_engine_application" "anonimowe-tf-appengine" {
  project     = google_project.anonimowe-tf.project_id
  location_id = var.region
}
