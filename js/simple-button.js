(function ($, Drupal) {
  Drupal.behaviors.webPushSimpleButton = {
    attach: function (context, settings) {



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
            Drupal.behaviors.webPushApp.push_updateSubscription();
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
              Drupal.behaviors.webPushApp.push_unsubscribe({button: $button});
            }
            else {
              Drupal.behaviors.webPushApp.push_subscribe({button: $button});
            }
          });
        });

        return true;
      },





    },


  };
})(jQuery, Drupal);