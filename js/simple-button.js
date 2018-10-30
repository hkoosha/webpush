(function ($, Drupal) {
  Drupal.behaviors.webPushSimpleButton = {
    attach: function (context, settings) {

      // Initialize button
      let initializeSimpleButton = this.initializeSimpleButton();
      if (!initializeSimpleButton) {
        return;

        // @TODO do something here
      }

    },

    app: Drupal.behaviors.webPushApp,

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

  };
})(jQuery, Drupal);