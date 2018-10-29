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

  $info['webpush_notification']['properties']['title'] = [
    'label' => t('Title'),
//    'description' => t('The serialized subscription object (\Minishlink\WebPush\Subscription)'),
    'type' => 'text',
    'schema field' => 'notification',
  ];
  $info['webpush_notification']['properties']['created'] = [
    'label' => t('Created'),
//    'description' => t('The serialized subscription object (\Minishlink\WebPush\Subscription)'),
    'type' => 'date',
    'schema field' => 'notification',
  ];
  $info['webpush_notification']['properties']['body'] = [
    'label' => t('Body'),
//    'description' => t('The serialized subscription object (\Minishlink\WebPush\Subscription)'),
    'type' => 'text',
    'schema field' => 'notification',
  ];
  $info['webpush_notification']['properties']['link'] = [
    'label' => t('Link'),
//    'description' => t('The serialized subscription object (\Minishlink\WebPush\Subscription)'),
    'type' => 'text',
    'schema field' => 'notification',
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
    '#markup' => t('THE LIST OF PREVIOUS SENT NOTIFICATIONS SHOULD BE HERE.'),
  ];
  return $content;
}
