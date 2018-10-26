<?php

function webpush_admin_send_form() {
  $form = [];

  $form['title'] = [
    '#type' => 'textfield',
    '#title' => t('Title'),
    '#description' => t('Title description.'),
    '#required' => TRUE,
  ];

  $form['body'] = [
    '#type' => 'textarea',
    '#title' => t('Body'),
    '#description' => t('Body description.'),
    '#required' => TRUE,
  ];

  $form['submit'] = [
    '#type' => 'submit',
    '#value' => t('Send'),
  ];

  return $form;
}

function webpush_admin_send_form_submit($form, &$form_state) {
  $values = $form_state['values'];
  $title = $values['title'];
  $body = $values['body'];
  dsm($values, 'values');

  drupal_set_message('Form submitted!');

  webpush__send_notification($title, $body);
}

function webpush_admin_configuration_form() {
  $form = [];

  $form['app_keys'] = [
    '#type' => 'fieldset',
    '#title' => t('App keys'),
    '#description' => t('App keys'),
  ];

  $form['app_keys']['webpush_public_key'] = [
    '#type' => 'textfield',
    '#title' => t('Public key'),
    '#description' => t('Public key description.'),
    '#default_value' => variable_get('webpush_public_key', ''),
    '#required' => TRUE,
  ];

  $form['app_keys']['webpush_private_key'] = [
    '#type' => 'textfield',
    '#title' => t('Private key'),
    '#description' => t('Private key description.'),
    '#default_value' => variable_get('webpush_private_key', ''),
    '#required' => TRUE,
  ];
  $form['default_values'] = [
    '#type' => 'fieldset',
    '#title' => t('Default values'),
    '#description' => t('Default values for your notification messages.'),
  ];
  $form['default_values']['webpush_icon_fid'] = [
    '#type' => 'managed_file',
    '#title' => t('Icon'),
    '#description' => t('Allowed extensions: jpg, jpeg, png, gif. It should be at least 512x512 px.'),
    '#default_value' => variable_get('webpush_icon_fid', ''),
    '#upload_validators' => [
      'file_validate_extensions' => ['jpg jpeg png gif'],
    ],
    '#upload_location' => 'public://',
  ];
  $form['default_values']['webpush_badge_fid'] = [
    '#type' => 'managed_file',
    '#title' => t('Badge'),
    '#description' => t('Allowed extensions: jpg, jpeg, png, gif. It should be at least 128x128 px.'),
    '#default_value' => variable_get('webpush_badge_fid', ''),
    '#upload_validators' => [
      'file_validate_extensions' => ['jpg jpeg png gif'],
    ],
    '#upload_location' => 'public://',
  ];

  $collapse = !variable_get('webpush_keep_invalid_subscriptions', FALSE);
  $form['debug'] = [
    '#type' => 'fieldset',
    '#title' => t('Debug'),
    '#description' => t('Several options that can be used for debugging.'),
    '#collapsible' => TRUE,
    '#collapsed' => $collapse,
  ];
  $form['debug']['webpush_keep_invalid_subscriptions'] = [
    '#type' => 'checkbox',
    '#title' => t('Keep invalid subscriptions'),
    '#description' => t('Enable this option if you want to keep the subscriptions in your database even if the sending of a notification has failed.'),
    '#default_value' => variable_get('webpush_keep_invalid_subscriptions', FALSE),
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
