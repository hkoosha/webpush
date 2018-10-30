(function ($, Drupal) {
  Drupal.behaviors.webPushSimpleButton = {
    attach: function (context, settings) {

      const buttonID = Drupal.settings.webpush.simple_button_id;
      const $button = $('#' + buttonID);

      // Assign it to the app property.
      Drupal.behaviors.webPushApp.subButton = $button;

      // Handle the click event.
      $button.once('webpush-subscription-click', function () {
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

    app: Drupal.behaviors.webPushApp,

  };
})(jQuery, Drupal);
