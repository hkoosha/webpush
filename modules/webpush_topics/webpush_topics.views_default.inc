<?php

/**
 * Implementation of hook_views_default_views().
 *
 **/
function webpush_topics_views_default_views() {
  $views = [];
  $files = file_scan_directory(drupal_get_path('module', 'webpush_topics') . '/views', '/.view.inc/');
  foreach ($files as $filepath => $file) {
    require $filepath;
    if (isset($view)) {
      $views[$view->name] = $view;
    }
  }
  return $views;
}

