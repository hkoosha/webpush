<?php

/**
 * Webpush_subscription entity class extending the Entity class
 */

class WebpushSubscription extends Entity {

}

/**
 * Extending the EntityAPIController for the webpush_subscription entity.
 */
class WebpushSubscriptionController extends EntityAPIController {

}

function _webpush_subscription_entity_info() {
  $info = [];

  $info['webpush_subscription'] = [
    'label' => 'WebPush subscription',
    'entity class' => 'WebpushSubscription',
    'controller class' => 'WebpushSubscriptionController',
    'views controller class' => 'EntityDefaultViewsController',
    'base table' => 'webpush_subscription',
    'entity keys' => [
      'id' => 'id',
    ],
    'access callback' => 'webpush_subscription_access_callback',
    'admin ui' => [
      'controller class' => 'EntityDefaultUIController',
    ],
    'module' => 'webpush',
    'fieldable' => TRUE,
    'bundles' => [
      'webpush_subscription' => [
        'label' => 'WebPush subscription',
        'admin' => [
          'path' => 'admin/structure/webpush-subscription/manage',
          'access arguments' => ['administer webpush'],
        ],
      ],
    ],

  ];

  return $info;
}

function _webpush_subscription_entity_property_info() {
  $info = [];

  $info['webpush_subscription']['properties']['id'] = [
    'label' => t('ID', [], ['context' => 'webpush']),
    'description' => t('The subscription ID.', [], ['context' => 'webpush']),
    'type' => 'integer',
    'schema field' => 'id',
  ];
  $info['webpush_subscription']['properties']['subscription'] = [
    'label' => t('Subscription', [], ['context' => 'webpush']),
    'description' => t('The serialized subscription object (\Minishlink\WebPush\Subscription)', [], ['context' => 'webpush']),
    'type' => 'text',
    'schema field' => 'subscription',
    'setter callback' => 'entity_property_verbatim_set',
    'getter callback' => 'entity_property_verbatim_get',
  ];
  $info['webpush_subscription']['properties']['created'] = [
    'label' => t('Created', [], ['context' => 'webpush']),
    'description' => t('The serialized subscription object (\Minishlink\WebPush\Subscription)', [], ['context' => 'webpush']),
    'type' => 'date',
    'schema field' => 'subscription',
  ];

  return $info;
}

function webpush_subscription__overview() {
  $count = webpush_subscription__count();
  $content[] = [
    '#markup' => t('You have !number push notification subscription(s).', ['!number' => $count], ['context' => 'webpush']),
  ];

  if ($count) {
    $content[] = drupal_get_form('webpush_subscription__delete_all_form');
  }

  return $content;
}
