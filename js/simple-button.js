(function ($, Drupal) {
  Drupal.behaviors.webPushSimpleButton = {
    attach: function (context, settings) {

      if (!this.app.initializeApplicationServerKey()) {
        return;
      }

      this.app.isPushEnabled = false;

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
        Drupal.behaviors.webPushApp.updateWebpushState('userdenied');
        return;
      }

      navigator.serviceWorker.register("webpush/serviceworker/js", {scope: '/'})
          .then(() => {
            console.log('[SW] Service worker has been registered');
            Drupal.behaviors.webPushSimpleButton.fn.push_updateSubscription();
          }, e => {
            console.error('[SW] Service worker registration failed', e);
            Drupal.behaviors.webPushApp.updateWebpushState('incompatible');
          });

    },

    app: Drupal.behaviors.webPushApp,

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
            if (Drupal.behaviors.webPushApp.isPushEnabled) {
              Drupal.behaviors.webPushSimpleButton.fn.push_unsubscribe($button);
            }
            else {
              Drupal.behaviors.webPushSimpleButton.fn.push_subscribe($button);
            }
          });
        });

        return true;
      },


      push_updateSubscription: function () {
        navigator.serviceWorker.ready.then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
            .then(subscription => {
              Drupal.behaviors.webPushApp.updateWebpushState('disabled');

              if (!subscription) {
                // We aren't subscribed to push, so set UI to allow the user to
                // enable push
                return;
              }

              // Keep your server in sync with the latest endpoint
              return Drupal.behaviors.webPushApp.push_sendSubscriptionToServer(subscription, 'PUT');
            })
            .then(subscription => subscription && Drupal.behaviors.webPushApp.updateWebpushState('enabled')) // Set your UI to show they have subscribed for push messages
            .catch(e => {
              console.error('Error when updating the subscription', e);
            });
      },

      push_subscribe: function ($button) {
        Drupal.behaviors.webPushApp.updateWebpushState('computing');

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
            .then(subscription => subscription && Drupal.behaviors.webPushApp.updateWebpushState('enabled')) // update your UI
            .catch(e => {
              if (Notification.permission === 'denied') {
                // The user denied the notification permission which
                // means we failed to subscribe and the user will need
                // to manually change the notification permission to
                // subscribe to push messages
                console.warn('Notifications are denied by the user.');
                Drupal.behaviors.webPushApp.updateWebpushState('userdenied');
              }
              else {
                // A problem occurred with the subscription; common reasons
                // include network errors or the user skipped the permission
                console.error('Impossible to subscribe to push notifications', e);
                Drupal.behaviors.webPushApp.updateWebpushState('disabled');
              }
            });
      },

      push_unsubscribe: function ($button) {
        Drupal.behaviors.webPushApp.updateWebpushState('computing');

        // To unsubscribe from push messaging, you need to get the subscription
        // object
        navigator.serviceWorker.ready
            .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
            .then(subscription => {
              // Check that we have a subscription to unsubscribe
              if (!subscription) {
                // No subscription object, so set the state
                // to allow the user to subscribe to push
                Drupal.behaviors.webPushApp.updateWebpushState('disabled');
                return;
              }

              // We have a subscription, unsubscribe
              // Remove push subscription from server
              return Drupal.behaviors.webPushApp.push_sendSubscriptionToServer(subscription, 'DELETE');
            })
            .then(subscription => subscription.unsubscribe())
            .then(() => Drupal.behaviors.webPushApp.updateWebpushState('disabled'))
            .catch(e => {
              // We failed to unsubscribe, this can lead to
              // an unusual state, so  it may be best to remove
              // the users data from your data store and
              // inform the user that you have done so
              console.error('Error when unsubscribing the user', e);
              Drupal.behaviors.webPushApp.updateWebpushState('disabled', $subButton);
            });
      },

    },


  };
})(jQuery, Drupal);