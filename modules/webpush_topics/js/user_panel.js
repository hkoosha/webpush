(function ($, Drupal) {
  Drupal.behaviors.webPushUserPanel = {
    attach: function (context, settings) {

      this.initializeCheckboxes();

      const buttonID = Drupal.settings.webpush.topics_button_id;
      const $button = $('#' + buttonID);

      // Assign it to the app property.
      Drupal.behaviors.webPushApp.subButton = $button;

      // Handle the click event.
      $button.once('webpush-subscription-click', function () {
        $(this).click(function () {
          const $button = $(this);
          const $checked = document.querySelectorAll('input.webpush-topics');
          const topics = [...$checked].map(i => { return i.checked ? i.value : false; }).filter(i => i !== false);
          console.log(topics);
          if (Drupal.behaviors.webPushApp.isPushEnabled) {
            Drupal.behaviors.webPushApp.push_unsubscribe();
          }
          else {
            Drupal.behaviors.webPushApp.push_subscribe({field_topics: topics});
          }
        });
      });

      return true;
    },

    app: Drupal.behaviors.webPushApp,

    initializeCheckboxes: function () {
      const $panel = $('#webpush-topics-panel');
      const $checkboxAll = $panel.find('input[name="webpush-topic-0"]');
      const $checkboxes = $panel.find('input[type="checkbox"]').not('[name="webpush-topic-0"]');
      $checkboxAll.change(function () {
        if (this.checked) {
          $checkboxes.prop("checked", true).attr("disabled", true);
        }
        else {
          $checkboxes.prop("checked", false).removeAttr("disabled");
        }
      });
    },

  };
})(jQuery, Drupal);
