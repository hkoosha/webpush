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

  $form = system_settings_form($form);

  return $form;
}