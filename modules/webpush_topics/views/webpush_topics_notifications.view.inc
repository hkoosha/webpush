<?php

$view = new view();
$view->name = 'webpush_notifications_topics';
$view->description = '';
$view->tag = 'default';
$view->base_table = 'webpush_notification';
$view->human_name = 'Webpush notifications (topics)';
$view->core = 7;
$view->api_version = '3.0';
$view->disabled = FALSE; /* Edit this to true to make a default view disabled initially */

/* Display: Master */
$handler = $view->new_display('default', 'Master', 'default');
$handler->display->display_options['title'] = 'Webpush notifications';
$handler->display->display_options['use_more_always'] = FALSE;
$handler->display->display_options['access']['type'] = 'none';
$handler->display->display_options['cache']['type'] = 'none';
$handler->display->display_options['query']['type'] = 'views_query';
$handler->display->display_options['exposed_form']['type'] = 'basic';
$handler->display->display_options['pager']['type'] = 'full';
$handler->display->display_options['pager']['options']['items_per_page'] = '20';
$handler->display->display_options['pager']['options']['offset'] = '0';
$handler->display->display_options['pager']['options']['id'] = '0';
$handler->display->display_options['pager']['options']['quantity'] = '9';
$handler->display->display_options['style_plugin'] = 'table';
/* Field: WebPush notification: ID */
$handler->display->display_options['fields']['id']['id'] = 'id';
$handler->display->display_options['fields']['id']['table'] = 'webpush_notification';
$handler->display->display_options['fields']['id']['field'] = 'id';
$handler->display->display_options['fields']['id']['separator'] = '';
/* Field: WebPush notification: Created */
$handler->display->display_options['fields']['created']['id'] = 'created';
$handler->display->display_options['fields']['created']['table'] = 'webpush_notification';
$handler->display->display_options['fields']['created']['field'] = 'created';
$handler->display->display_options['fields']['created']['date_format'] = 'short';
$handler->display->display_options['fields']['created']['second_date_format'] = 'day';
$handler->display->display_options['fields']['created']['reldate'] = '0';
/* Field: WebPush notification: Title */
$handler->display->display_options['fields']['title']['id'] = 'title';
$handler->display->display_options['fields']['title']['table'] = 'webpush_notification';
$handler->display->display_options['fields']['title']['field'] = 'title';
/* Field: WebPush notification: Body */
$handler->display->display_options['fields']['body']['id'] = 'body';
$handler->display->display_options['fields']['body']['table'] = 'webpush_notification';
$handler->display->display_options['fields']['body']['field'] = 'body';
/* Field: WebPush notification: Link */
$handler->display->display_options['fields']['link']['id'] = 'link';
$handler->display->display_options['fields']['link']['table'] = 'webpush_notification';
$handler->display->display_options['fields']['link']['field'] = 'link';
/* Field: WebPush notification: Total */
$handler->display->display_options['fields']['total']['id'] = 'total';
$handler->display->display_options['fields']['total']['table'] = 'webpush_notification';
$handler->display->display_options['fields']['total']['field'] = 'total';
$handler->display->display_options['fields']['total']['separator'] = '';
/* Field: WebPush notification: Success */
$handler->display->display_options['fields']['success']['id'] = 'success';
$handler->display->display_options['fields']['success']['table'] = 'webpush_notification';
$handler->display->display_options['fields']['success']['field'] = 'success';
$handler->display->display_options['fields']['success']['separator'] = '';
/* Field: Field: Topics */
$handler->display->display_options['fields']['webpush_topics']['id'] = 'webpush_topics';
$handler->display->display_options['fields']['webpush_topics']['table'] = 'field_data_webpush_topics';
$handler->display->display_options['fields']['webpush_topics']['field'] = 'webpush_topics';
$handler->display->display_options['fields']['webpush_topics']['empty'] = 'All';
$handler->display->display_options['fields']['webpush_topics']['settings'] = array(
  'bypass_access' => 0,
  'link' => 0,
  'empty_fields_handler' => '',
  'empty_fields_emptyfieldtext_empty_text' => '',
);
$handler->display->display_options['fields']['webpush_topics']['delta_offset'] = '0';
$handler->display->display_options['fields']['webpush_topics']['multi_type'] = 'ul';
/* Sort criterion: WebPush notification: Created */
$handler->display->display_options['sorts']['created']['id'] = 'created';
$handler->display->display_options['sorts']['created']['table'] = 'webpush_notification';
$handler->display->display_options['sorts']['created']['field'] = 'created';
$handler->display->display_options['sorts']['created']['order'] = 'DESC';
$translatables['webpush_notifications_topics'] = array(
  t('Master'),
  t('Webpush notifications'),
  t('more'),
  t('Apply'),
  t('Reset'),
  t('Sort by'),
  t('Asc'),
  t('Desc'),
  t('Items per page'),
  t('- All -'),
  t('Offset'),
  t('« first'),
  t('‹ previous'),
  t('next ›'),
  t('last »'),
  t('ID'),
  t('.'),
  t('Created'),
  t('Title'),
  t('Body'),
  t('Link'),
  t('Total'),
  t('Success'),
  t('Topics'),
  t('All'),
);


return $view;
