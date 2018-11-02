(function ($, Drupal) {
  Drupal.behaviors.webPushApp = {

    attach: function (context, settings) {

      // Initialize the application server key
      if (!this.initializeApplicationServerKey()) {
        return;
      }

      // Initialize variable.
      this.isPushEnabled = false;

      // If the features are not supported by the browser, stop here.
      if (this.unsupportedFeatures()) {
        return;
      }


      // Check the current Notification permission.
      // If its denied, the button should appears as such, until the user
      // changes the permission manually
      if (Notification.permission === 'denied') {
        console.warn('Notifications are denied by the user');
        this.updateWebpushState('userdenied');
        return;
      }

      // Register the service worker.
      const that = this;
      navigator.serviceWorker.register("webpush/serviceworker/js", {scope: '/'})
          .then(() => {
            console.log('[SW] Service worker has been registered');
            that.push_updateSubscription();
          }, e => {
            console.error('[SW] Service worker registration failed', e);
            that.updateWebpushState('incompatible');
          });
    },

    isPushEnabled: false,

    applicationServerKey: false,

    initializeApplicationServerKey: function () {
      this.applicationServerKey = ('webpush' in Drupal.settings) ? Drupal.settings.webpush.applicationServerKey : false;
      return this.applicationServerKey;
    },

    subscriptionButtons: [],

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
      const that = this;
      const key = subscription.getKey('p256dh');
      const token = subscription.getKey('auth');
      const contentEncoding = (PushManager.supportedContentEncodings || ['aesgcm'])[0];

      let d = new Date();
      const a = fetch('/webpush/subscription-registration?' + d.getTime(), {
        method,
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          publicKey: key ? btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : null,
          authToken: token ? btoa(String.fromCharCode.apply(null, new Uint8Array(token))) : null,
          contentEncoding: contentEncoding,
          data: data,
        }),
      });
      const b = a.then(resultA => {
        return resultA.json()
            .then(responseJSON => {
              return responseJSON;
            });
      });
      return Promise.all([a, b]).then(function ([response, drupalJson]) {
        if (drupalJson !== false) {
          const data = drupalJson.webpush.data;
          for (let k in data) {
            if (data.hasOwnProperty(k)) {
              that.setLocalData(k, data[k]);
            }
          }
        }

        return {
          'subscription': subscription,
          'drupalJson': drupalJson
        };
      });
    },

    updateWebpushState: function (state) {
      const $subscriptionButtons = this.subscriptionButtons;
      if (!$subscriptionButtons.length) {
        return; // @TODO maybe we need to handle it better.
      }

      let message = '';
      switch (state) {
        case 'enabled':
          message = 'Disable Push notifications';
          this.isPushEnabled = true;
          break;
        case 'disabled':
          message = 'Enable Push notifications';
          this.isPushEnabled = false;
          break;
        case 'computing':
          message = 'Loading...';
          break;
        case 'incompatible':
          message = 'Push notifications are not compatible with this browser';
          break;
        case 'userdenied':
          message = 'The user has denied push notifications';
          break;
        default:
          console.error('Unhandled push button state', state);
          message = 'Unknown push notifications state';
          state = 'unknown';
          break;
      }

      for (let i = 0, len = $subscriptionButtons.length; i < len; i++) {
        let $button = $subscriptionButtons[i];
        $button.attr('data-webpush-state', state);
        $button.attr('data-webpush-message', message);
      }
    },

    push_updateSubscription: function () {
      const that = this;
      navigator.serviceWorker.ready.then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
          .then(subscription => {
            that.updateWebpushState('disabled');

            if (!subscription) {
              // We aren't subscribed to push, so set UI to allow the user to
              // enable push
              return;
            }

            /*
              If we reached here, it means that the client has updated their
              (already existing) subscription. This might have happened
              because the user manually unregistered the SW, or because our SW
              has been updated, or for other reasons.

              As a result, the client has a new endpoint, a totally different
              PushSubscription object
              (@see https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription)
              which is not related to the old one.

              Until now, I couldn't find any way to relate those two
              PushSubscription objects (if you, dear developer who reads these
              comments, know any way, PLEASE PLEASE PLEASE open a new task in
              the module's issue queue
              (@see https://www.drupal.org/project/issues/webpush?status=All&categories=All)

              The new endpoint must be sent to our server. We'll try to look
              into the local storage, to see if we have any info.

              If the user has also cleared his local cache, then we have no info.

              @TODO maybe implement something that will ask the user
             */

            const localData = that.getAllLocalData() ? that.getAllLocalData() : {};
            return that.push_sendSubscriptionToServer(subscription, 'PUT', localData);
          })
          .then(response => {
            return (response && response.subscription) && that.updateWebpushState('enabled');
          }) // Set your UI to show they have subscribed for push messages
          .catch(e => {
            console.error('Error when updating the subscription', e);
          });
    },

    getLocalData: function (key) {
      const currentStorage = this.getAllLocalData();
      if (currentStorage === null) {
        return false;
      }
      if (key in currentStorage) {
        return currentStorage[key];
      }
      else {
        return false;
      }
    },

    getAllLocalData: function () {
      return JSON.parse(localStorage.getItem('webpush'));
    },

    setLocalData: function (key, value) {
      let store = {};
      let currentStorage = localStorage.getItem('webpush');
      if (currentStorage !== null) {
        // There are already stored values in our bin, we should not lose them.
        store = JSON.parse(currentStorage);
      }
      store[key] = value;
      localStorage.setItem('webpush', JSON.stringify(store));
      return true;
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
          .then(response => response.subscription && that.updateWebpushState('enabled')) // update your UI
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
            return that.push_sendSubscriptionToServer(subscription, 'DELETE');
          })
          .then(response => response.subscription.unsubscribe())
          .then(() => that.updateWebpushState('disabled'))
          .catch(e => {
            // We failed to unsubscribe, this can lead to
            // an unusual state, so  it may be best to remove
            // the users data from your data store and
            // inform the user that you have done so
            console.error('Error when unsubscribing the user', e);
            that.updateWebpushState('disabled');
          });
    },

  };
})(jQuery, Drupal);