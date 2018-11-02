(function ($, Drupal) {
  Drupal.behaviors.webPushSimpleButton = {
    attach: function (context, settings) {

      // Initialize
      this.app = Drupal.behaviors.webPushApp;
      // Assign the button to the app property.
      const buttonID = Drupal.settings.webpush.simple_button_id;
      const $button = $('#' + buttonID);
      if (!$button.length) {
        return;
      }
      Drupal.behaviors.webPushApp.subscriptionButtons.push($button);

      // Handle the click event.
      $button.once('webpush-subscription-click', function () {
        $(this).click(function () {
          const state = $button.attr('data-webpush-state');
          if ( state === 'enabled' || state === 'disabled' ) {
            if (Drupal.behaviors.webPushApp.isPushEnabled) {
              Drupal.behaviors.webPushApp.push_unsubscribe({});
            }
            else {
              Drupal.behaviors.webPushApp.push_subscribe({});
            }
          }
        });
      });

      return true;
    },

    app: Drupal.behaviors.webPushApp,

  };
})(jQuery, Drupal);
