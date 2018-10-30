<div id="webpush-topics-user-panel-wrapper">

    <div id="webpush-topics-toggle"></div>

    <div id="webpush-topics-panel">
      <?php
        foreach ($topics as $tid => $topic):
       ?>
          <label><input type="checkbox" name="webpush-topic-<?php print $tid; ?>" value="<?php print $tid; ?>"><?php print $topic; ?></label>
      <?php
        endforeach;
      ?>
    </div>

</div>
