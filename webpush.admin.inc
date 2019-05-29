<?php

function webpush_autocomplete_node_callback($string = "") {
  $matches = [];
  if ($string) {
    $result = db_select('node')
      ->fields('node', ['nid', 'title'])
      ->condition('title', db_like($string) . '%', 'LIKE')
      ->range(0, 10)
      ->execute();
    foreach ($result as $node) {
      $matches[$node->title . " [$node->nid]"] = check_plain($node->title);
    }
  }

  drupal_json_output($matches);
}

function webpush_admin_configuration_form() {
  $form = [];

  $form['default_values'] = [
    '#type' => 'fieldset',
    '#title' => t('Default values', [], ['context' => 'webpush']),
    '#description' => t('Default values for your notification messages.', [], ['context' => 'webpush']),
  ];
  $form['default_values']['webpush_link_type'] = [
    '#type' => 'radios',
    '#title' => t('Link type', [], ['context' => 'webpush']),
    '#options' => webpush_link_type_options(),
    '#default_value' => variable_get('webpush_link_type', 'frontpage'),
  ];
  $form['default_values']['webpush_icon_fid'] = [
    '#type' => 'managed_file',
    '#title' => t('Icon', [], ['context' => 'webpush']),
    '#description' => t('Allowed extensions: jpg, jpeg, png, gif. It should be at least 512x512 px.', [], ['context' => 'webpush']),
    '#default_value' => variable_get('webpush_icon_fid', ''),
    '#upload_validators' => [
      'file_validate_extensions' => ['jpg jpeg png gif'],
    ],
    '#upload_location' => 'public://',
  ];
  $form['default_values']['webpush_badge_fid'] = [
    '#type' => 'managed_file',
    '#title' => t('Badge', [], ['context' => 'webpush']),
    '#description' => t('Allowed extensions: jpg, jpeg, png, gif. It should be at least 128x128 px.', [], ['context' => 'webpush']),
    '#default_value' => variable_get('webpush_badge_fid', ''),
    '#upload_validators' => [
      'file_validate_extensions' => ['jpg jpeg png gif'],
    ],
    '#upload_location' => 'public://',
  ];

  $form['default_values']['webpush_utm_source'] = [
    '#type' => 'textfield',
    '#default_value' => variable_get('webpush_utm_source', ''),
    '#title' => 'utm_source',
    '#description' => t('Add utm_source parameter to url. Leave empty to ignore.', [], ['context' => 'webpush']),
  ];
  $form['default_values']['webpush_utm_medium'] = [
    '#type' => 'textfield',
    '#default_value' => variable_get('webpush_utm_medium', ''),
    '#title' => 'utm_medium',
    '#description' => t('Add utm_medium parameter to url. Leave empty to ignore.', [], ['context' => 'webpush']),
  ];
  $form['default_values']['webpush_utm_campaign'] = [
    '#type' => 'textfield',
    '#default_value' => variable_get('webpush_utm_campaign', ''),
    '#title' => 'utm_campaign',
    '#description' => t('Add utm_campaign parameter to url. Leave empty to ignore.', [], ['context' => 'webpush']),
  ];

  $form = system_settings_form($form);
  $form['#submit'][] = 'webpush_admin_configuration_form_submit__images';

  return $form;
}

function webpush_admin_configuration_form_submit__images($form, &$form_state) {

  // @TODO consider adding a validation function, to unset the images from $form_state if they are already stored
  // Leave it like that for now!

  $files = [];

  if ($form_state['values']['webpush_icon_fid']) {
    $files[] = file_load($form_state['values']['webpush_icon_fid']);
  }
  if ($form_state['values']['webpush_badge_fid']) {
    $files[] = file_load($form_state['values']['webpush_badge_fid']);
  }
  if ($files) {
    foreach ($files as $file) {
      if ($file->status !== FILE_STATUS_PERMANENT) {
        $file->status = FILE_STATUS_PERMANENT;
        file_save($file);
        file_usage_add($file, 'webpush', 'admin', 1);
      }
    }
  }
}

function webpush_admin_advanced_configuration_form() {
  $form = [];

  $form['app_keys'] = [
    '#type' => 'fieldset',
    '#title' => t('App keys', [], ['context' => 'webpush']),
    '#description' => t('You can use this site to create your app keys:', [], ['context' => 'webpush']) . ' <a href="https://web-push-codelab.glitch.me/">https://web-push-codelab.glitch.me</a>',
    '#collapsible' => FALSE,
  ];
  $form['app_keys']['webpush_public_key'] = [
    '#type' => 'textfield',
    '#title' => t('Public key', [], ['context' => 'webpush']),
    '#description' => t('Public key description.', [], ['context' => 'webpush']),
    '#default_value' => variable_get('webpush_public_key', ''),
    '#required' => TRUE,
  ];
  $form['app_keys']['webpush_private_key'] = [
    '#type' => 'textfield',
    '#title' => t('Private key', [], ['context' => 'webpush']),
    '#description' => t('Private key description.', [], ['context' => 'webpush']),
    '#default_value' => variable_get('webpush_private_key', ''),
    '#required' => TRUE,
  ];

  $collapse = !variable_get('webpush_keep_invalid_subscriptions', FALSE);
  $form['debug'] = [
    '#type' => 'fieldset',
    '#title' => t('Debug', [], ['context' => 'webpush']),
    '#description' => t('Several options that can be used for debugging.', [], ['context' => 'webpush']),
    '#collapsible' => FALSE,
  ];
  $form['debug']['webpush_keep_invalid_subscriptions'] = [
    '#type' => 'checkbox',
    '#title' => t('Keep invalid subscriptions', [], ['context' => 'webpush']),
    '#description' => t('Enable this option if you want to keep the subscriptions in your database even if the sending of a notification has failed.', [], ['context' => 'webpush']),
    '#default_value' => variable_get('webpush_keep_invalid_subscriptions', FALSE),
  ];

  $form = system_settings_form($form);

  return $form;
}
