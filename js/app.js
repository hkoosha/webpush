(function ($, Drupal) {
  Drupal.behaviors.webPushApp = {

    attach: function (context, settings) {
      if (!this.initializeApplicationServerKey()) {
        return;
      }

      this.isPushEnabled = false;

      // If the features are not supported by the browser, stop here.
      if (this.unsupportedFeatures()) {
        return;
      }


    },

    isPushEnabled: false,

    applicationServerKey: false,

    initializeApplicationServerKey: function () {
      this.applicationServerKey = ('webpush' in Drupal.settings) ? Drupal.settings.webpush.applicationServerKey : false;
      return this.applicationServerKey;
    },

    subButton: false,

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

    push_sendSubscriptionToServer: function (subscription, method, data) {
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
          data: data
        }),
      }).then(() => subscription);
    },

    updateWebpushState: function (state) {
      const $subButton = this.subButton;
      const $messageSpan = $subButton.find('#webpush-subscription-message');

      let message = '';

      switch (state) {
        case 'enabled':
          message = 'Disable Push notifications';
          $messageSpan.text(message);
          this.isPushEnabled = true;
          $subButton.addClass('working');
          break;
        case 'disabled':
          message = 'Enable Push notifications';
          $messageSpan.text(message);
          this.isPushEnabled = false;
          $subButton.addClass('working');
          break;
        case 'computing':
          message = 'Loading...';
          $messageSpan.text(message);
          break;
        case 'incompatible':
          message = 'Push notifications are not compatible with this browser';
          $messageSpan.text(message);
          $subButton.addClass('not-working');
          break;
        case 'userdenied':
          message = 'The user has denied push notifications';
          $messageSpan.text(message);
          $subButton.addClass('not-working');
          break;
        default:
          message = 'Unknown push notifications state';
          $messageSpan.text(message);
          console.error('Unhandled push button state', state);
          $subButton.addClass('not-working');
          break;
      }

    },


    push_updateSubscription: function (data) {
      const that = this;
      navigator.serviceWorker.ready.then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
          .then(subscription => {
            that.updateWebpushState('disabled');

            if (!subscription) {
              // We aren't subscribed to push, so set UI to allow the user to
              // enable push
              return;
            }

            // Keep your server in sync with the latest endpoint
            return that.push_sendSubscriptionToServer(subscription, 'PUT', data);
          })
          .then(subscription => subscription && that.updateWebpushState('enabled')) // Set your UI to show they have subscribed for push messages
          .catch(e => {
            console.error('Error when updating the subscription', e);
          });
    },

    push_subscribe: function (data) {
      const that = this;
      this.updateWebpushState('computing');

      navigator.serviceWorker.ready
          .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: that.urlBase64ToUint8Array(that.applicationServerKey),
          }))
          .then(subscription => {
            // Subscription was successful
            // create subscription on your server
            return that.push_sendSubscriptionToServer(subscription, 'POST', data);
          })
          .then(subscription => subscription && that.updateWebpushState('enabled')) // update your UI
          .catch(e => {
            if (Notification.permission === 'denied') {
              // The user denied the notification permission which
              // means we failed to subscribe and the user will need
              // to manually change the notification permission to
              // subscribe to push messages
              console.warn('Notifications are denied by the user.');
              that.updateWebpushState('userdenied');
            }
            else {
              // A problem occurred with the subscription; common reasons
              // include network errors or the user skipped the permission
              console.error('Impossible to subscribe to push notifications', e);
              that.updateWebpushState('disabled');
            }
          });
    },

    push_unsubscribe: function (data) {
      const that = this;
      this.updateWebpushState('computing');

      // To unsubscribe from push messaging, you need to get the subscription
      // object
      navigator.serviceWorker.ready
          .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
          .then(subscription => {
            // Check that we have a subscription to unsubscribe
            if (!subscription) {
              // No subscription object, so set the state
              // to allow the user to subscribe to push
              that.updateWebpushState('disabled');
              return;
            }

            // We have a subscription, unsubscribe
            // Remove push subscription from server
            return that.push_sendSubscriptionToServer(subscription, 'DELETE', data);
          })
          .then(subscription => subscription.unsubscribe())
          .then(() => that.updateWebpushState('disabled'))
          .catch(e => {
            // We failed to unsubscribe, this can lead to
            // an unusual state, so  it may be best to remove
            // the users data from your data store and
            // inform the user that you have done so
            console.error('Error when unsubscribing the user', e);
            that.updateWebpushState('disabled', $subButton);
          });
    },


  };
})(jQuery, Drupal);