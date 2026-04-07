<?php

/**
 * @file
 * Page and maintenance page preprocess functions.
 */

use Drupal\Component\Utility\Html;
use Drupal\node\NodeInterface;

/**
 * Implements hook_preprocess_HOOK() for maintenance-page.html.twig.
 *
 * Clears site name during installation and attaches maintenance page library.
 */
function brainsum_starterkit_preprocess_maintenance_page(&$variables) {
  // By default, site_name is set to Drupal if no db connection is available
  // or during site installation. Setting site_name to an empty string makes
  // the site and update pages look cleaner.
  // @see template_preprocess_maintenance_page
  if (!$variables['db_is_active']) {
    $variables['site_name'] = '';
  }
}

/**
 * Implements hook_theme_suggestions_HOOK_alter() for page.
 *
 * Adds node bundle-based page template suggestions.
 */
function brainsum_starterkit_suggestions_page_alter(
  array &$suggestions,
  array $variables,
) {
  $node = \Drupal::routeMatch()->getParameter('node');

  if ($node instanceof NodeInterface) {
    $suggestions[] = 'page__' . $node->bundle();
    $suggestions[] = 'page__node_' . $node->bundle();
  }
}

/**
 * Implements hook_preprocess_HOOK() for page.html.twig.
 *
 * Provides path info variable and attaches admin/gin toolbar libraries.
 */
function brainsum_starterkit_preprocess_page(array &$variables) {
  // Provide the path as a variable to the page template.
  $path = \Drupal::request()->getPathInfo();
  $trimmed_path = Html::cleanCssIdentifier(ltrim($path, '/'));
  $variables['path_info'] = $trimmed_path;

  // Load layout settings and make available to template.
  $layout_settings = _brainsum_starterkit_get_layout_settings();
  $variables['component_containers'] = $layout_settings['component_containers'];

  // Load header settings and make available to template.
  $header_settings = _brainsum_starterkit_get_header_settings();
  $variables['sticky_header'] = $header_settings['sticky_header'];

  // Attach auto-hide header library if enabled.
  if ($header_settings['sticky_header'] === 'auto-hide') {
    $variables['#attached']['library'][] = 'brainsum_starterkit/header.auto-hide';
  }

  // Skip toolbar fixes if the new navigation module is active.
  $moduleHandler = \Drupal::moduleHandler();
  if ($moduleHandler->moduleExists('navigation')) {
    return;
  }

  $current_user = \Drupal::currentUser();

  // Attach admin toolbar library if toolbar is installed and user has access.
  if ($moduleHandler->moduleExists('toolbar') && $current_user->hasPermission('access toolbar')) {
    $variables['#attached']['library'][] = 'brainsum_starterkit/admin.toolbar';
  }

  // Attach gin toolbar library if gin_toolbar is installed and user has access.
  if ($moduleHandler->moduleExists('gin_toolbar') && $current_user->hasPermission('access toolbar')) {
    $variables['#attached']['library'][] = 'brainsum_starterkit/gin.toolbar';
  }
}
