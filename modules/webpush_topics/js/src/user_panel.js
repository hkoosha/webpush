(function ($, Drupal) {
  Drupal.behaviors.webPushUserPanel = {
    attach: function (context, settings) {

      const that = this;

      // Initialize
      this.app = Drupal.behaviors.webPushApp;
      // Assign the button to the app property.
      const buttonID = Drupal.settings.webpush.buttons.topics_button_id;
      const $button = $('#' + buttonID);
      if (!$button.length) {
        return;
      }
      this.initializeBellIcon();

      this.initializeCheckboxes();

      $button[0].addEventListener("webpush-state-update", function (event) {
        that.handleStateUpdate(event.detail.state, event.detail.message);
      });

      // Handle the subscribe button click event.
      $button.once('webpush-subscription-click', function () {
        $(this).click(function () {
          const $checked = document.querySelectorAll('input.webpush-topics');
          const topics = [...$checked].map(i => {
            return i.checked ? i.value : false;
          }).filter(i => i !== false);

          // If nothing got selected, there's nothing to send to the backend.
          if (topics.length !== 0) {
            Drupal.behaviors.webPushApp.push_subscribe({webpush_topics: topics});
          }

          const $panel = $('#webpush-topics-panel');
          $panel.removeClass('expanded');
        });
      });

      // Handle the unsubscribe button click event.
      const $buttonDisable = $('#webpush-topics-unsubscribe');
      $buttonDisable.once('webpush-subscription-click', function () {
        $(this).click(function () {
          if (Drupal.behaviors.webPushApp.isPushEnabled) {
            Drupal.behaviors.webPushApp.push_unsubscribe();
            that.uncheckEverything();
          }
          const $panel = $('#webpush-topics-panel');
          $panel.removeClass('expanded');
        });
      });

      return true;
    },

    app: Drupal.behaviors.webPushApp,

    initializeBellIcon: function () {
      const $toggler = $('#webpush-topics-user-panel-wrapper');
      const $panel = $('#webpush-topics-panel');
      $toggler.click(function () {
        let state = Drupal.behaviors.webPushApp.getWebpushState();
        if (state === 'enabled' || state === 'disabled') {
          $panel.toggleClass('expanded');
        }
      });
    },

    initializeCheckboxes: function () {
      const that = this;

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


      // Precheck the checkboxes
      navigator.serviceWorker.ready
          .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
          .then(subscription => {
            if (subscription) {

              that.app.updateWebpushState('enabled');

              const localStoredTopics = this.app.getLocalData('webpush_topics');
              if (localStoredTopics !== null) {

                // If there are values, precheck the relevant buttons.
                if (localStoredTopics.length) {
                  for (let i = 0, len = localStoredTopics.length; i < len; i++) {
                    let tid = localStoredTopics[i];
                    let name = 'webpush-topic-' + tid;
                    let $chk = $('input[type="checkbox"][name="' + name + '"]');
                    $chk.prop("checked", true);
                  }
                }
                // If there are no values (aka empty array), then suppose that
                // "all" had been clicked
                else {
                  $checkboxAll.click();
                }
              }
              return;
            }
          });
    },

    uncheckEverything: function () {
      const $panel = $('#webpush-topics-panel');
      const $checkboxes = $panel.find('input[type="checkbox"]');
      $checkboxes.prop("checked", false).removeAttr("disabled");
    },

    handleStateUpdate: function (state, message) {
      const $toggler = $('#webpush-topics-user-panel-wrapper');
      $toggler.attr('data-webpush-state', state);
      $toggler.attr('data-webpush-message', message);
    }
  };
})(jQuery, Drupal);
