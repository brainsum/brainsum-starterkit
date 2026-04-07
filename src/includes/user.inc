<?php

/**
 * @file
 * User-related theme suggestions.
 */

/**
 * Implements hook_theme_suggestions_HOOK_alter() for user.
 *
 * Adds view mode-based template suggestions (e.g., user--compact.html.twig).
 */
function brainsum_starterkit_theme_suggestions_user_alter(&$suggestions, $variables) {
  $suggestions[] = 'user__' . $variables['elements']['#view_mode'];
}
