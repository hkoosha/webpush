<?php

function webpush_admin_overview_form() {
  $form = [];

  $form['message'] = [
    '#type' => 'markup',
    '#title' => t('Markup'),
    '#markup' => t('There will be some text here'),
  ];

  return $form;
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