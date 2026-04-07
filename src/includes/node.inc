<?php

/**
 * @file
 * Node-related preprocess functions.
 */

/**
 * Implements hook_preprocess_HOOK() for node.html.twig.
 *
 * Removes "Add new comment" link on teasers or when comment form is displayed.
 */
function brainsum_starterkit_preprocess_node(&$variables) {
  // Remove the "Add new comment" link on teasers or when the comment form is
  // displayed on the page.
  if (
    $variables['teaser'] || !empty(
      $variables['content']['comments']['comment_form']
    )
  ) {
    unset($variables['content']['links']['comment']['#links']['comment-add']);
  }
}
