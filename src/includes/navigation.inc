<?php

/**
 * @file
 * Navigation and menu-related preprocess functions.
 */

use Drupal\Core\Render\Element;
use Symfony\Component\Yaml\Yaml;

/**
 * Get layout settings from YAML configuration.
 *
 * @return array
 *   Layout settings array with keys:
 *   - component_containers: Whether to use per-component containers
 *     (default: TRUE). TRUE means each section/component has its own container.
 *     FALSE means single container wrapper for entire page.
 */
function _brainsum_starterkit_get_layout_settings() {
  $theme_path = \Drupal::service('extension.list.theme')->getPath('brainsum_starterkit');
  $settings_file = DRUPAL_ROOT . '/' . $theme_path . '/settings/settings.layout.yml';

  if (file_exists($settings_file)) {
    $settings = Yaml::parseFile($settings_file);
    return [
      'component_containers' => $settings['component_containers'] ?? TRUE,
    ];
  }

  // Default settings if file doesn't exist.
  return [
    'component_containers' => TRUE,
  ];
}

/**
 * Get header settings from YAML configuration.
 *
 * @return array
 *   Header settings array with keys:
 *   - sticky_header: Header sticky behavior. Options: FALSE (normal),
 *     'sticky' (always visible), 'auto-hide' (hides on scroll down, shows on scroll up).
 */
function _brainsum_starterkit_get_header_settings() {
  $theme_path = \Drupal::service('extension.list.theme')->getPath('brainsum_starterkit');
  $settings_file = DRUPAL_ROOT . '/' . $theme_path . '/settings/settings.header.yml';

  if (file_exists($settings_file)) {
    $settings = Yaml::parseFile($settings_file);
    return [
      'sticky_header' => $settings['sticky_header'] ?? FALSE,
    ];
  }

  // Default settings if file doesn't exist.
  return [
    'sticky_header' => FALSE,
  ];
}

/**
 * Get pager settings from YAML configuration.
 *
 * @return array
 *   Pager settings array with keys:
 *   - use_heading: Whether to use heading element (default: FALSE).
 *     FALSE uses <div> with aria-labelledby (recommended for navigation).
 *     TRUE uses Drupal's admin heading level setting.
 *   - use_link_labels: Whether to use text labels or SVG icons.
 */
function _brainsum_starterkit_get_pager_settings() {
  $theme_path = \Drupal::service('extension.list.theme')->getPath('brainsum_starterkit');
  $settings_file = DRUPAL_ROOT . '/' . $theme_path . '/settings/settings.pager.yml';

  if (file_exists($settings_file)) {
    $settings = Yaml::parseFile($settings_file);
    return [
      'use_heading' => $settings['use_heading'] ?? FALSE,
      'use_link_labels' => $settings['use_link_labels'] ?? TRUE,
    ];
  }

  // Default settings if file doesn't exist.
  return [
    'use_heading' => FALSE,
    'use_link_labels' => TRUE,
  ];
}

/**
 * Implements hook_preprocess_HOOK() for pager.html.twig.
 *
 * Loads pager settings from YAML and passes them to the template.
 */
function brainsum_starterkit_preprocess_pager(&$variables) {
  $settings = _brainsum_starterkit_get_pager_settings();
  $variables['use_heading'] = $settings['use_heading'];
  $variables['use_link_labels'] = $settings['use_link_labels'];
}

/**
 * Implements hook_preprocess_HOOK() for views-mini-pager.html.twig.
 *
 * Loads pager settings from YAML and passes them to the template.
 */
function brainsum_starterkit_preprocess_views_mini_pager(&$variables) {
  $settings = _brainsum_starterkit_get_pager_settings();
  $variables['use_heading'] = $settings['use_heading'];
  $variables['use_link_labels'] = $settings['use_link_labels'];
}

/**
 * Implements hook_theme_suggestions_HOOK_alter() for menu.
 *
 * Adds region-based menu template suggestions (e.g., menu--header.html.twig).
 */
function brainsum_starterkit_theme_suggestions_menu_alter(&$suggestions, array $variables) {
  if (isset($variables['attributes']['region'])) {
    $suggestions[] = 'menu__' . $variables['attributes']['region'];
  }
}

/**
 * Implements hook_preprocess_HOOK() for menu-local-tasks.html.twig.
 *
 * Adds level identifier (primary/secondary) to each local task for styling.
 */
function brainsum_starterkit_preprocess_menu_local_tasks(&$variables) {
  foreach (Element::children($variables['primary']) as $key) {
    $variables['primary'][$key]['#level'] = 'primary';
  }
  foreach (Element::children($variables['secondary']) as $key) {
    $variables['secondary'][$key]['#level'] = 'secondary';
  }
}

/**
 * Implements hook_preprocess_HOOK() for menu-local-task.html.twig.
 *
 * Adds tab link classes, ensures is-active state, and exposes level variable.
 */
function brainsum_starterkit_preprocess_menu_local_task(&$variables) {
  $variables['link']['#options']['attributes']['class'][] = 'c-tabs__link';
  $variables['link']['#options']['attributes']['class'][] = 'js-tabs-link';

  // Ensure is-active class is set when the tab is active. The generic active
  // link handler applies stricter comparison rules than what is necessary for
  // tabs.
  if (isset($variables['is_active']) && $variables['is_active'] === TRUE) {
    $variables['link']['#options']['attributes']['class'][] = 'is-active';
  }

  if (isset($variables['element']['#level'])) {
    $variables['level'] = $variables['element']['#level'];
  }
}
