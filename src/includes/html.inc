<?php

/**
 * @file
 * HTML preprocess functions.
 */

use Drupal\Component\Utility\Html;

/**
 * Implements hook_preprocess_HOOK() for html.html.twig.
 *
 * Adds path-based and language classes to html element, exposes theme path.
 */
function brainsum_starterkit_preprocess_html(&$variables) {
  $path = \Drupal::request()->getPathInfo();
  $path_args = explode('/', $path);
  $language = \Drupal::languageManager()->getCurrentLanguage()->getId();
  // Store theme's path in a variable to access it from any Twig templates.
  $variables['current_theme_path'] = \Drupal::request()->getBasePath() . '/' .
  \Drupal::service('extension.list.theme')->getPath('brainsum_starterkit');

  $variables['path_info']['args'] = FALSE;

  // Generating class name from current path and added to html element.
  if (count($path_args) >= 3) {
    $variables['path_info']['args'] = Html::cleanCssIdentifier(ltrim($path, '/'));
  }

  // Added current ID as class to html element.
  if ($node = \Drupal::request()->attributes->get('node')) {
    $variables['attributes']['class'][] = 'page-node-' . $node->id();
  }

  // Added a class to html element according to current language.
  $variables['attributes']['class'][] = 'page--language-' . $language;

  // Load layout settings and make available to template.
  $layout_settings = _brainsum_starterkit_get_layout_settings();
  $variables['component_containers'] = $layout_settings['component_containers'];

  // Load header settings and make available to template and JavaScript.
  $header_settings = _brainsum_starterkit_get_header_settings();
  $variables['sticky_header'] = $header_settings['sticky_header'];

  // Pass header settings to JavaScript via drupalSettings.
  $variables['#attached']['drupalSettings']['brainsumStarterkit']['header']['stickyHeader'] = $header_settings['sticky_header'];
}
