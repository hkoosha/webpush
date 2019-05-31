'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function ($, Drupal) {
  Drupal.behaviors.webPushUserPanel = {
    attach: function attach(context, settings) {

      var that = this;

      // Initialize
      this.app = Drupal.behaviors.webPushApp;
      // Assign the button to the app property.
      var buttonID = Drupal.settings.webpush.buttons.topics_button_id;
      var $button = $('#' + buttonID);
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
          var $checked = document.querySelectorAll('input.webpush-topics');
          var topics = [].concat(_toConsumableArray($checked)).map(function (i) {
            return i.checked ? i.value : false;
          }).filter(function (i) {
            return i !== false;
          });

          // If nothing got selected, there's nothing to send to the backend.
          if (topics.length !== 0) {
            Drupal.behaviors.webPushApp.push_subscribe({ webpush_topics: topics });
          }

          var $panel = $('#webpush-topics-panel');
          $panel.removeClass('expanded');
        });
      });

      // Handle the unsubscribe button click event.
      var $buttonDisable = $('#webpush-topics-unsubscribe');
      $buttonDisable.once('webpush-subscription-click', function () {
        $(this).click(function () {
          if (Drupal.behaviors.webPushApp.isPushEnabled) {
            Drupal.behaviors.webPushApp.push_unsubscribe();
            that.uncheckEverything();
          }
          var $panel = $('#webpush-topics-panel');
          $panel.removeClass('expanded');
        });
      });

      return true;
    },

    app: Drupal.behaviors.webPushApp,

    initializeBellIcon: function initializeBellIcon() {
      var $toggler = $('#webpush-topics-user-panel-wrapper');
      var $panel = $('#webpush-topics-panel');
      $toggler.click(function () {
        var state = Drupal.behaviors.webPushApp.getWebpushState();
        if (state === 'enabled' || state === 'disabled') {
          $panel.toggleClass('expanded');
        }
      });
    },

    initializeCheckboxes: function initializeCheckboxes() {
      var _this = this;

      var that = this;

      var $panel = $('#webpush-topics-panel');
      var $checkboxAll = $panel.find('input[name="webpush-topic-all"]');
      var $checkboxes = $panel.find('input[type="checkbox"]').not('[name="webpush-topic-all"]');
      $checkboxAll.change(function () {
        if (this.checked) {
          $checkboxes.prop("checked", true).attr("disabled", true);
        } else {
          $checkboxes.prop("checked", false).removeAttr("disabled");
        }
      });

      // Precheck the checkboxes
      navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
        return serviceWorkerRegistration.pushManager.getSubscription();
      }).then(function (subscription) {
        if (subscription) {

          that.app.updateWebpushState('enabled');

          var localStoredTopics = _this.app.getLocalData('webpush_topics');
          if (localStoredTopics !== null) {

            // If there are values, precheck the relevant buttons.
            if (localStoredTopics.length) {
              for (var i = 0, len = localStoredTopics.length; i < len; i++) {
                var tid = localStoredTopics[i];
                var name = 'webpush-topic-' + tid;
                var $chk = $('input[type="checkbox"][name="' + name + '"]');
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

    uncheckEverything: function uncheckEverything() {
      var $panel = $('#webpush-topics-panel');
      var $checkboxes = $panel.find('input[type="checkbox"]');
      $checkboxes.prop("checked", false).removeAttr("disabled");
    },

    handleStateUpdate: function handleStateUpdate(state, message) {
      var $toggler = $('#webpush-topics-user-panel-wrapper');
      $toggler.attr('data-webpush-state', state);
      $toggler.attr('data-webpush-message', message);
    }
  };
})(jQuery, Drupal);