# webpush
Drupal integration of the PHP WebPush library.

This module allows you to send push notifications from your Drupal site with the PHP WebPush library.

You don't need any external service, neither node.js or other frameworks, just install the module, configure it, and it just works.

The basic webpush module offers you simple push notifications.
With the submodule webpush_topics you can let your users subscribe to topics and only notify subscribers of a specific topic.

## Installation of Webpush
- Install the module, as usual
- Under Configuration > Webpush > Advanced (admin/config/services/webpush/advanced)
you have to enter a pair of VAPID keys. There are several libraries that you can use to generate them, or you could just visit the Push Companion website and generate them there
- In the Configuration tab you can add images for the Icon and the Badge of your notifications
- Enable the permission "Register webpush" for the roles that you want to provide the feature
- Place the "Webpush simple button" block somewhere in the site
- You are ready, your users can start subscribing

## Usage
Under Administration > Reports > Webpush subscriptions (admin/reports/webpush-subscriptions) you can get an overview of how many subscriptions you have.

On Administration > Content > Push notifications (admin/content/webpush) you can see your previously sent notifications, and use the "Add webpush notification" button to send a new one (admin/content/webpush/add)

## Webpush Dependencies
- It only works on https sites, and localhost.
- Entity API
- Views (oh come on, is there any real Drupal site without Views???)
- Composer Manager (I added this as hard dependency in order to easily handle the integration of the web-push-libs/web-push-php library. I know there are other ways too, but I didn't want to spend time on figuring out how, so please suggest patches if you want to remove the dependency...)

## Webpush Topics
This module extends the webpush and it has some extra dependencies (see below).

When you install it, a taxonomy vocabulary "Webpush topics" is created, and a term "Sample topic" is added.

You are advised to not delete this vocabulary, and keep it populated with at least one term. I didn't check what happens if you delete the vocab or leave it empty (and I would like to find a way to prevent this - patches are welcomed!)

This module offers a new subscription block, called Webpush user panel. You should not have both blocks enabled at the same time.

## Webpush Topics Dependencies
- Taxonomy (:D)
- Entity Reference

## Limitations
It's not yet compatible with Safari, because Apple implemented the push protocol in a different way.

Also, if you enable the base module and start working with it, and at some point you decide to enable the topics, all your existing subscribers will get a message that they got unsubscribed and that they need to re-subscribe. I'm currently looking for a workaround on that.

## Script build
If you want to contribute Javascript code, you need `npm` to build the scripts

### Script setup

Simply run `npm install` to get the `node_modules` folder set up

Run `npm run-script build` to build the Javascript file.
