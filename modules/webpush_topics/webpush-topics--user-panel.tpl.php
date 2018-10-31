<div id="webpush-topics-user-panel-wrapper">

    <div id="webpush-topics-toggle"></div>

    <div id="webpush-topics-panel">
      <?php
        foreach ($topics as $tid => $topic):
       ?>
          <label><input type="checkbox" class="webpush-topics" name="webpush-topic-<?php print $tid; ?>" value="<?php print $tid; ?>"><?php print $topic; ?></label>
      <?php
        endforeach;
      ?>
          <button id="webpush-topics-subscribe"><?php print t('Save'); ?></button>

          <span id="webpush-subscription-message"></span>
    </div>

</div>
