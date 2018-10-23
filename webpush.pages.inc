<?php

/**
 * Deliver the JS for the service worker.
 *
 * Adds a Service-Worker-Allowed header so that a file served from
 * '/webpush/serviceworker/js' can have a scope of '/'.
 */
function webpush_deliver_js_file($page_callback_result) {
  drupal_add_http_header('Content-Type', 'application/javascript');
  drupal_add_http_header('Content-Disposition', 'inline; filename="sw.js"');
  drupal_add_http_header('Service-Worker-Allowed', base_path());
  print $page_callback_result;
}

/**
 * Returns the JS of the service worker.
 *
 * @return mixed
 */
function webpush_serviceworker_file_data() {
  $data = cache_get('webpush:serviceworker', 'cache');
  if ($data) {
    $data = $data->data;
  }
  else {
    $data = _webpush_serviceworker_file();
    cache_set('webpush:serviceworker', $data, 'cache');
  }

  return $data;
}

/**
 * Take the serviceworker template file and return its contents.
 *
 * @return string
 */
function _webpush_serviceworker_file() {
  $path = drupal_get_path('module', 'webpush');
  $sw = file_get_contents($path . '/js/sw.js');
  return $sw;
}
