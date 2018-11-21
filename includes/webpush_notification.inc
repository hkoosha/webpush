<?php

/**
 * Webpush_subscription entity class extending the Entity class
 */

class WebpushNotification extends Entity {

}

/**
 * Extending the EntityAPIController for the webpush_subscription entity.
 */
class WebpushNotificationController extends EntityAPIController {

}

class WebpushNotificationUIController extends EntityDefaultUIController {
  /**
   * Builds the entity overview form.
   */
  public function overviewForm($form, &$form_state) {
    $form['content'] = webpush_notification__overview();
    return $form;
  }
}

function _webpush_notification_entity_info() {
  $info = [];

  $info['webpush_notification'] = [
    'label' => 'WebPush notification',
    'entity class' => 'WebpushNotification',
    'controller class' => 'WebpushNotificationController',
    'views controller class' => 'EntityDefaultViewsController',
    'base table' => 'webpush_notification',
    'entity keys' => [
      'id' => 'id',
    ],
    'access callback' => 'webpush_notification_access_callback',
    //    'uri callback' => 'entity_class_uri',
    'admin ui' => [
      'path' => 'admin/content/webpush',
      'controller class' => 'WebpushNotificationUIController',
    ],
    'module' => 'webpush',
    'fieldable' => TRUE,
    'bundles' => [
      'webpush_notification' => [
        'label' => 'WebPush notification',
        'admin' => [
          'path' => 'admin/structure/webpush-notification/manage',
          'access arguments' => ['administer webpush'],
        ],
      ],
    ],

  ];

  return $info;
}

function _webpush_notification_entity_property_info() {
  $info = [];

  $info['webpush_notification']['properties']['id'] = [
    'label' => t('ID'),
    'description' => t('The notification ID.'),
    'type' => 'integer',
    'schema field' => 'id',
  ];
  $info['webpush_notification']['properties']['title'] = [
    'label' => t('Title'),
    'description' => t('The notification title.'),
    'type' => 'text',
    'schema field' => 'title',
  ];
  $info['webpush_notification']['properties']['created'] = [
    'label' => t('Created'),
    'description' => t('The notification creation timestamp.'),
    'type' => 'date',
    'schema field' => 'created',
  ];
  $info['webpush_notification']['properties']['body'] = [
    'label' => t('Body'),
    'description' => t('The notification body.'),
    'type' => 'text',
    'schema field' => 'body',
  ];
  $info['webpush_notification']['properties']['link'] = [
    'label' => t('Link'),
    'description' => t('The notification link (if any).'),
    'type' => 'text',
    'schema field' => 'link',
  ];
  $info['webpush_notification']['properties']['total'] = [
    'label' => t('Total'),
    'description' => t('Total registered subscriptions.'),
    'type' => 'integer',
    'schema field' => 'total',
    'setter callback' => 'entity_property_verbatim_set',
  ];
  $info['webpush_notification']['properties']['success'] = [
    'label' => t('Success'),
    'description' => t('Successful deliveries.'),
    'type' => 'integer',
    'schema field' => 'success',
    'setter callback' => 'entity_property_verbatim_set',
  ];


  return $info;
}

function webpush_notification__overview() {
  $content[] = [
    '#markup' => views_embed_view('webpush_notifications', 'default'),
  ];
  return $content;
}
