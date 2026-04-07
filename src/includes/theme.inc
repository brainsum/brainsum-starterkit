<?php

/**
 * @file
 * Theme preprocess functions.
 */

/**
 * Implements hook_theme_registry_alter().
 *
 * Overrides Claro's toolbar template with our custom version.
 */
function brainsum_starterkit_theme_registry_alter(&$theme_registry) {
  $theme_registry['toolbar']['path'] = \Drupal::request()->getBasePath() . '/' .
  \Drupal::service('extension.list.theme')->getPath('brainsum_starterkit') .
  '/templates/navigation';
}
