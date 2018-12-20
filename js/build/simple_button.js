'use strict';

(function ($, Drupal) {
  Drupal.behaviors.webPushSimpleButton = {
    attach: function attach(context, settings) {

      if (Drupal.behaviors.webPushApp === undefined) {
        return;
      }

      // Initialize
      this.app = Drupal.behaviors.webPushApp;
      // Assign the button to the app property.
      var buttonID = Drupal.settings.webpush.buttons.simple_button_id;
      var $button = $('#' + buttonID);
      if (!$button.length) {
        return; // Just in case...
      }

      // Handle the click event.
      $button.once('webpush-subscription-click', function () {
        $(this).click(function () {
          var state = $button.attr('data-webpush-state');
          if (state === 'enabled' || state === 'disabled') {
            if (Drupal.behaviors.webPushApp.isPushEnabled) {
              Drupal.behaviors.webPushApp.push_unsubscribe({});
            } else {
              Drupal.behaviors.webPushApp.push_subscribe({});
            }
          }
        });
      });

      return true;
    },

    app: Drupal.behaviors.webPushApp

  };
})(jQuery, Drupal);