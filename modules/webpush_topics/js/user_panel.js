(function ($, Drupal) {
  Drupal.behaviors.webPushUserPanel = {
    attach: function (context, settings) {

      // Initialize
      this.app = Drupal.behaviors.webPushApp;
      // Assign the button to the app property.
      const buttonID = Drupal.settings.webpush.topics_button_id;
      const $button = $('#' + buttonID);
      if (!$button.length) {
        return;
      }
      Drupal.behaviors.webPushApp.subscriptionButtons.push($button);

      this.initializeCheckboxes();

      // Handle the click event.
      $button.once('webpush-subscription-click', function () {
        $(this).click(function () {
          const $checked = document.querySelectorAll('input.webpush-topics');
          const topics = [...$checked].map(i => { return i.checked ? i.value : false; }).filter(i => i !== false);
          // @TODO: This is wrong! First click unsubs, and second subs.
          if (Drupal.behaviors.webPushApp.isPushEnabled) {
            Drupal.behaviors.webPushApp.push_unsubscribe();
          }
          else {
            Drupal.behaviors.webPushApp.push_subscribe({webpush_topics: topics});
          }
        });
      });

      return true;
    },

    app: Drupal.behaviors.webPushApp,

    initializeCheckboxes: function () {

      // Precheck the checkboxes
      const localStoredTopics = this.app.getLocalData('webpush_topics');
      if (localStoredTopics) {
        for (let i = 0, len = localStoredTopics.length; i < len; i++) {
          let tid = localStoredTopics[i];
          let name = 'webpush-topic-' + tid;
          let $chk = $('input[type="checkbox"][name="' + name + '"]');
          $chk.prop("checked", true);
        }
      }

      const $panel = $('#webpush-topics-panel');
      const $checkboxAll = $panel.find('input[name="webpush-topic-all"]');
      const $checkboxes = $panel.find('input[type="checkbox"]').not('[name="webpush-topic-all"]');
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
