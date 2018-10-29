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
      'path' => 'admin/webpush-notification',
      'controller class' => 'EntityDefaultUIController',
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

  return $info;
}

function _webpush_notification_menu() {
  $items = [];

  $items['admin/structure/webpush-notification/manage'] = [
    'title' => 'WebPush notifiations',
    'page callback' => 'webpush_notification__overview',
    'file' => 'includes/webpush_notification.inc',
    'access arguments' => ['administer webpush'],
  ];

  $items['admin/structure/webpush-notification/manage/list'] = [
    'title' => 'Overview',
    'type' => MENU_DEFAULT_LOCAL_TASK,
    'access arguments' => ['send push notifications'],
  ];

  return $items;

}

function webpush_notification__overview() {
  $content[] = [
    '#markup' => views_embed_view('webpush_notifications', 'default'),
  ];
  return $content;
}
