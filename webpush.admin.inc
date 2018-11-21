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

function webpush_admin_send_form_validate(&$form, &$form_state) {
  $values = $form_state['values'];

  if ($values['link_type'] == 'node') {
    $title = $values['link_node'];
    if (empty($title)) {
      form_error($form['link']['link_node'], t('You need to select a valid node.'));
      return FALSE;
    }
    $matches = [];

    // This preg_match() looks for the last pattern like [33334] and if found
    // extracts the numeric portion.
    $result = preg_match('/\[([0-9]+)\]$/', $title, $matches);
    if ($result > 0) {
      // If $result is nonzero, we found a match and can use it as the index into
      // $matches.
      $nid = $matches[$result];
      // Verify that it's a valid nid.
      $node = node_load($nid);
      if (empty($node)) {
        form_error($form['link']['link_node'], t('No node with nid %nid can be found', ['%nid' => $nid]));
        return FALSE;
      }
    }
    // BUT: Not everybody will have javascript turned on, or they might hit ESC
    // and not use the autocomplete values offered. In that case, we can attempt
    // to come up with a useful value. This is not absolutely necessary, and we
    // *could* just emit a form_error() as below.
    else {
      $nid = db_select('node')
        ->fields('node', ['nid'])
        ->condition('title', db_like($title) . '%', 'LIKE')
        ->range(0, 1)
        ->execute()
        ->fetchField();
    }

    // Now, if we somehow found a nid, assign it to the node. If we failed, emit
    // an error.
    if (!empty($nid)) {
      $form_state['values']['link_node'] = $nid;
    }
    else {
      form_error($form['link']['link_node'], t('No node starting with %title can be found', ['%title' => $title]));
      return FALSE;
    }

  }
  elseif ($values['link_type'] == 'custom') {
    if (!valid_url($values['link_custom'], TRUE)) {
      form_error($form['link']['link_custom'], t('The url you typed is not valid. It has to begin with http:// or https://'));
      return FALSE;
    }
  }
}

function webpush_admin_send_form_submit($form, &$form_state) {
  $values = $form_state['values'];
  $title = $values['title'];
  $body = $values['body'];
  switch ($values['link_type']) {
    case 'node':
      $link = '/' . drupal_get_path_alias('node/' . $values['link_node']);
      break;
    case 'custom':
      $link = $values['link_custom'];
      break;
    case 'frontpage':
    default:
      global $base_url;
      $link = $base_url;
      break;
  }
  $notification_entity = webpush_notification__create_entity($title, $body, $link);
  if (isset($form_state['_webpush_notification_entity_fields'])) {
    $notification_wrapper = entity_metadata_wrapper('webpush_notification', $notification_entity);
    foreach ($form_state['_webpush_notification_entity_fields'] as $field => $field_values) {
      $notification_wrapper->$field->set($field_values);
    }
    $notification_wrapper->save();
  }

  $targets = [];
  if (isset($form_state['_webpush_targets'])) {
    if ($form_state['_webpush_targets']) {
      $targets = $form_state['_webpush_targets'];
    }
    else {
      $msg = t('You have no subscriptions to your selected topics.');
      drupal_set_message($msg, 'warning');
      return;
    }
  }

  batch_set(webpush__send_notification_batch($notification_entity, $targets));
}

function webpush_admin_configuration_form() {
  $form = [];

  $form['app_keys'] = [
    '#type' => 'fieldset',
    '#title' => t('App keys'),
    '#description' => t('You can use this site to create your app keys:') . ' <a href="https://web-push-codelab.glitch.me/">https://web-push-codelab.glitch.me</a>',
    '#collapsible' => TRUE,
    '#collapsed' => webpush_is_enabled(),
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
  $form['default_values']['webpush_link_type'] = [
    '#type' => 'radios',
    '#title' => t('Link type'),
    '#options' => webpush_link_type_options(),
    '#default_value' => variable_get('webpush_link_type', 'frontpage'),
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
