(function ($, Drupal) {
  Drupal.behaviors.webPush = {
    attach: function (context, settings) {

      if (!this.app.initializeApplicationServerKey()) {
        return;
      }

      this.isPushEnabled = false;

      // If the features are not supported by the browser, stop here.
      if (this.app.unsupportedFeatures()) {
        return;
      }

      // Initialize button
      let initializeSimpleButton = this.fn.initializeSimpleButton();
      if (!initializeSimpleButton) {
        return;
      }


      // Check the current Notification permission.
      // If its denied, the button should appears as such, until the user
      // changes the permission manually
      if (Notification.permission === 'denied') {
        console.warn('Notifications are denied by the user');
        Drupal.behaviors.webPush.fn.updateWebpushState('userdenied');
        return;
      }

      navigator.serviceWorker.register("webpush/serviceworker/js", {scope: '/'})
          .then(() => {
            console.log('[SW] Service worker has been registered');
            Drupal.behaviors.webPush.fn.push_updateSubscription();
          }, e => {
            console.error('[SW] Service worker registration failed', e);
            Drupal.behaviors.webPush.fn.updateWebpushState('incompatible');
          });

    },

    app: Drupal.behaviors.webPushApp,

    isPushEnabled: false,

    // subButton: $('#webpush-subscription-button'),

    fn: {

      initializeSimpleButton: function () {
        // If there is no subscription related button, nothing to do here.
        Drupal.behaviors.webPushApp.subButton = $('#webpush-subscription-button');
        if (!Drupal.behaviors.webPushApp.subButton) {
          return false;
        }

        Drupal.behaviors.webPushApp.subButton.once('webpush-subscription-click', function () {
          $(this).click(function () {
            const $button = $(this);
            if (Drupal.behaviors.webPush.isPushEnabled) {
              Drupal.behaviors.webPush.fn.push_unsubscribe($button);
            }
            else {
              Drupal.behaviors.webPush.fn.push_subscribe($button);
            }
          });
        });

        return true;
      },


      push_updateSubscription: function () {
        navigator.serviceWorker.ready.then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
            .then(subscription => {
              Drupal.behaviors.webPush.fn.updateWebpushState('disabled');

              if (!subscription) {
                // We aren't subscribed to push, so set UI to allow the user to
                // enable push
                return;
              }

              // Keep your server in sync with the latest endpoint
              return Drupal.behaviors.webPushApp.push_sendSubscriptionToServer(subscription, 'PUT');
            })
            .then(subscription => subscription && Drupal.behaviors.webPush.fn.updateWebpushState('enabled')) // Set your UI to show they have subscribed for push messages
            .catch(e => {
              console.error('Error when updating the subscription', e);
            });
      },

      push_subscribe: function ($button) {
        Drupal.behaviors.webPush.fn.updateWebpushState('computing');

        navigator.serviceWorker.ready
            .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: Drupal.behaviors.webPushApp.urlBase64ToUint8Array(Drupal.behaviors.webPushApp.applicationServerKey),
            }))
            .then(subscription => {
              // Subscription was successful
              // create subscription on your server
              return Drupal.behaviors.webPushApp.push_sendSubscriptionToServer(subscription, 'POST');
            })
            .then(subscription => subscription && Drupal.behaviors.webPush.fn.updateWebpushState('enabled')) // update your UI
            .catch(e => {
              if (Notification.permission === 'denied') {
                // The user denied the notification permission which
                // means we failed to subscribe and the user will need
                // to manually change the notification permission to
                // subscribe to push messages
                console.warn('Notifications are denied by the user.');
                Drupal.behaviors.webPush.fn.updateWebpushState('userdenied');
              }
              else {
                // A problem occurred with the subscription; common reasons
                // include network errors or the user skipped the permission
                console.error('Impossible to subscribe to push notifications', e);
                Drupal.behaviors.webPush.fn.updateWebpushState('disabled');
              }
            });
      },

      push_unsubscribe: function ($button) {
        Drupal.behaviors.webPush.fn.updateWebpushState('computing');

        // To unsubscribe from push messaging, you need to get the subscription
        // object
        navigator.serviceWorker.ready
            .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
            .then(subscription => {
              // Check that we have a subscription to unsubscribe
              if (!subscription) {
                // No subscription object, so set the state
                // to allow the user to subscribe to push
                Drupal.behaviors.webPush.fn.updateWebpushState('disabled');
                return;
              }

              // We have a subscription, unsubscribe
              // Remove push subscription from server
              return Drupal.behaviors.webPushApp.push_sendSubscriptionToServer(subscription, 'DELETE');
            })
            .then(subscription => subscription.unsubscribe())
            .then(() => Drupal.behaviors.webPush.fn.updateWebpushState('disabled'))
            .catch(e => {
              // We failed to unsubscribe, this can lead to
              // an unusual state, so  it may be best to remove
              // the users data from your data store and
              // inform the user that you have done so
              console.error('Error when unsubscribing the user', e);
              Drupal.behaviors.webPush.fn.updateWebpushState('disabled', $subButton);
            });
      },

      updateWebpushState: function (state) {
        const $subButton = Drupal.behaviors.webPushApp.subButton;
        const $messageSpan = $('#webpush-subscription-message');

        switch (state) {
          case 'enabled':
            $messageSpan.text("Disable Push notifications");
            Drupal.behaviors.webPush.isPushEnabled = true;
            $subButton.addClass('working');
            break;
          case 'disabled':
            $messageSpan.text("Enable Push notifications");
            Drupal.behaviors.webPush.isPushEnabled = false;
            $subButton.addClass('working');
            break;
          case 'computing':
            $messageSpan.text("Loading...");
            break;
          case 'incompatible':
            $messageSpan.text("Push notifications are not compatible with this browser");
            $subButton.addClass('not-working');
            break;
          case 'userdenied':
            $messageSpan.text("The user has denied push notifications");
            $subButton.addClass('not-working');
            break;
          default:
            console.error('Unhandled push button state', state);
            $subButton.addClass('not-working');
            break;
        }

      },

    },


  };
})(jQuery, Drupal);