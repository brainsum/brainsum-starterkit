<?php

/**
 * @file
 * Any type of media related preprocess functions.
 */

/**
 * Implements hook_preprocess_HOOK() for filter-caption.html.twig.
 *
 * Adds caption class to filter caption elements.
 */
function brainsum_starterkit_preprocess_filter_caption(&$variables) {
  $variables['classes'] = isset($variables['classes']) && !empty(
    $variables['classes']
  ) ? $variables['classes'] . ' caption' : 'caption';
}
