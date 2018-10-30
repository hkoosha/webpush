(function ($, Drupal) {
  Drupal.behaviors.webPushApp = {

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

  };
})(jQuery, Drupal);