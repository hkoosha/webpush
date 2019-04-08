<div id="webpush-topics-user-panel-wrapper"></div>

<div id="webpush-topics-panel">
  <?php
  foreach ($topics as $tid => $topic):
    ?>
      <label><input type="checkbox" class="webpush-topics" name="webpush-topic-<?php print $tid; ?>" value="<?php print $tid; ?>"><?php print $topic; ?>
      </label>
  <?php
  endforeach;
  ?>
    <div id="webpush-topics-subscribe" class="webpush-topics-button"><?php print t('Save', [], ['context' => 'webpush_topics']); ?></div>
    <div id="webpush-topics-unsubscribe" class="webpush-topics-button"><?php print t('Disable', [], ['context' => 'webpush_topics']); ?></div>
</div>
