(function ($, Drupal) {
  Drupal.behaviors.webPush = {
    attach: function (context, settings) {

      this.applicationServerKey = ('webpush' in Drupal.settings) ? Drupal.settings.webpush.applicationServerKey : false;
      if (!this.applicationServerKey) {
        return;
      }

      this.isPushEnabled = false;


      // If the features are not supported by the browser, stop here.
      if (this.fn.unsupportedFeatures()) {
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

    isPushEnabled: false,

    pushButton: $('#webpush-subscription-button'),

    fn: {

      unsupportedFeatures: function () {
        if (!('serviceWorker' in navigator)) {
          console.warn("Service workers are not supported by this browser");
          this.updateWebpushState('incompatible');
          return true;
        }

        if (!('PushManager' in window)) {
          console.warn('Push notifications are not supported by this browser');
          this.updateWebpushState('incompatible');
          return true;
        }

        if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
          console.warn('Notifications are not supported by this browser');
          this.updateWebpushState('incompatible');
          return true;
        }
        return false;
      },

      urlBase64ToUint8Array: function (base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      },

      push_sendSubscriptionToServer: function (subscription, method) {
        const key = subscription.getKey('p256dh');
        const token = subscription.getKey('auth');
        const contentEncoding = (PushManager.supportedContentEncodings || ['aesgcm'])[0];

        let d = new Date();
        return fetch('/webpush/subscription-registration?' + d.getTime(), {
          method,
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            publicKey: key ? btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : null,
            authToken: token ? btoa(String.fromCharCode.apply(null, new Uint8Array(token))) : null,
            contentEncoding,
          }),
        }).then(() => subscription);
      },


      initializeSimpleButton: function () {
        // If there is no subscription related button, nothing to do here.
        Drupal.behaviors.webPush.pushButton = $('#webpush-subscription-button');
        if (!Drupal.behaviors.webPush.pushButton) {
          return false;
        }

        Drupal.behaviors.webPush.pushButton.once('webpush-subscription-click', function () {
          $(this).click(function () {
            if (Drupal.behaviors.webPush.isPushEnabled) {
              Drupal.behaviors.webPush.fn.push_unsubscribe();
            }
            else {
              Drupal.behaviors.webPush.fn.push_subscribe();
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
              return Drupal.behaviors.webPush.fn.push_sendSubscriptionToServer(subscription, 'PUT');
            })
            .then(subscription => subscription && Drupal.behaviors.webPush.fn.updateWebpushState('enabled')) // Set your UI to show they have subscribed for push messages
            .catch(e => {
              console.error('Error when updating the subscription', e);
            });
      },

      push_subscribe: function () {
        Drupal.behaviors.webPush.fn.updateWebpushState('computing');

        navigator.serviceWorker.ready
            .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: Drupal.behaviors.webPush.fn.urlBase64ToUint8Array(Drupal.behaviors.webPush.applicationServerKey),
            }))
            .then(subscription => {
              // Subscription was successful
              // create subscription on your server
              return Drupal.behaviors.webPush.fn.push_sendSubscriptionToServer(subscription, 'POST');
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

      push_unsubscribe: function () {
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
              return Drupal.behaviors.webPush.fn.push_sendSubscriptionToServer(subscription, 'DELETE');
            })
            .then(subscription => subscription.unsubscribe())
            .then(() => Drupal.behaviors.webPush.fn.updateWebpushState('disabled'))
            .catch(e => {
              // We failed to unsubscribe, this can lead to
              // an unusual state, so  it may be best to remove
              // the users data from your data store and
              // inform the user that you have done so
              console.error('Error when unsubscribing the user', e);
              Drupal.behaviors.webPush.fn.updateWebpushState('disabled', $pushButton);
            });
      },

      updateWebpushState: function (state) {
        const $pushButton = Drupal.behaviors.webPush.pushButton;
        const $messageSpan = $pushButton.find('span.webpush-subscription-message');

        switch (state) {
          case 'enabled':
            $pushButton.disabled = false;
            $messageSpan.text("Disable Push notifications");
            Drupal.behaviors.webPush.isPushEnabled = true;
            $pushButton.addClass('working');
            break;
          case 'disabled':
            $pushButton.disabled = false;
            $messageSpan.text("Enable Push notifications");
            Drupal.behaviors.webPush.isPushEnabled = false;
            $pushButton.addClass('working');
            break;
          case 'computing':
            $pushButton.disabled = true;
            $messageSpan.text("Loading...");
            break;
          case 'incompatible':
            $pushButton.disabled = true;
            $messageSpan.text("Push notifications are not compatible with this browser");
            $pushButton.addClass('not-working');
            break;
          case 'userdenied':
            $pushButton.disabled = true;
            $messageSpan.text("The user has denied push notifications");
            $pushButton.addClass('not-working');
            break;
          default:
            console.error('Unhandled push button state', state);
            $pushButton.addClass('not-working');
            break;
        }

      },

    },


  };
})(jQuery, Drupal);