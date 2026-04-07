<?php

/**
 * @file
 * Table related preprocess functions.
 */

use Drupal\Core\Template\Attribute;
use Symfony\Component\Yaml\Yaml;

/**
 * Returns the tables configuration from YAML file.
 *
 * Reads settings/settings.tables.yml and caches the result for the request.
 * All table-related settings (responsive, modifiers) are centralized in this
 * config file.
 *
 * @return array
 *   The parsed configuration array, or empty array if file doesn't exist.
 */
function _brainsum_starterkit_get_table_settings() {
  static $config = NULL;

  if ($config === NULL) {
    $theme_path = \Drupal::service('extension.list.theme')->getPath('brainsum_starterkit');
    $config_file = $theme_path . '/settings/settings.tables.yml';

    if (file_exists($config_file)) {
      $config = Yaml::parseFile($config_file);
    }
    else {
      $config = [];
    }
  }

  return $config;
}

/**
 * Returns the tabledrag configuration from YAML file.
 *
 * Reads settings/settings.tabledrag.yml and caches the result for the request.
 * All tabledrag-related settings (screen reader support, keyboard navigation)
 * are centralized in this config file.
 *
 * @return array
 *   The parsed configuration array, or empty array if file doesn't exist.
 */
function _brainsum_starterkit_get_tabledrag_settings() {
  static $config = NULL;

  if ($config === NULL) {
    $theme_path = \Drupal::service('extension.list.theme')->getPath('brainsum_starterkit');
    $config_file = $theme_path . '/settings/settings.tabledrag.yml';

    if (file_exists($config_file)) {
      $config = Yaml::parseFile($config_file);
    }
    else {
      $config = [];
    }
  }

  return $config;
}

/**
 * Check if a feature should be enabled globally.
 *
 * Supports dot-notation for nested paths (e.g., 'modifiers.striped').
 *
 * @param string $feature_path
 *   The feature key in settings.tables.yml (e.g., 'responsive' or 'modifiers.striped').
 *
 * @return bool
 *   TRUE if the feature should be enabled, FALSE otherwise.
 */
function _brainsum_starterkit_table_feature_enabled($feature_path) {
  $config = _brainsum_starterkit_get_table_settings();
  $parts = explode('.', $feature_path);

  // Navigate to nested config
  $feature_config = $config;
  foreach ($parts as $part) {
    if (!isset($feature_config[$part])) {
      return FALSE;
    }
    $feature_config = $feature_config[$part];
  }

  // Handle both direct boolean values and nested 'enabled' property for backwards compatibility
  if (is_bool($feature_config)) {
    return $feature_config;
  }

  return $feature_config['enabled'] ?? FALSE;
}

/**
 * Get table modifier classes based on global configuration.
 *
 * @return array
 *   Array of modifier class names to add.
 */
function _brainsum_starterkit_get_table_modifiers() {
  $config = _brainsum_starterkit_get_table_settings();
  $modifiers = [];

  if (isset($config['modifiers'])) {
    foreach ($config['modifiers'] as $modifier => $modifier_config) {
      if (_brainsum_starterkit_table_feature_enabled("modifiers.{$modifier}")) {
        $modifiers[] = "c-table--{$modifier}";
      }
    }
  }

  return $modifiers;
}

/**
 * Implements hook_theme_suggestions_HOOK_alter() for table.
 *
 * Adds template suggestion for draggable tables.
 */
function brainsum_starterkit_theme_suggestions_table_alter(array &$suggestions, array $variables) {
  // Check if any row has the draggable class
  if (!empty($variables['rows'])) {
    foreach ($variables['rows'] as $row) {
      if (isset($row['attributes']) && $row['attributes'] instanceof Attribute) {
        if ($row['attributes']->hasClass('draggable')) {
          $suggestions[] = 'table__draggable';
          break;
        }
      }
    }
  }
}

/**
 * Implements hook_preprocess_HOOK() for table.html.twig.
 *
 * Adds draggable-table class when rows have drag handles.
 * Applies responsive table component and modifiers based on global settings.
 */
function brainsum_starterkit_preprocess_table(&$variables) {
  $config = _brainsum_starterkit_get_table_settings();

  // Ensure attributes is an Attribute object
  if (!($variables['attributes'] instanceof Attribute)) {
    $variables['attributes'] = new Attribute($variables['attributes'] ?? []);
  }

  // Remove core responsive-enabled class if configured
  if (!empty($config['remove_classes']['responsive_enabled'])) {
    $variables['attributes']->removeClass('responsive-enabled');
  }

  // Get responsive type: none, stack, or scroll
  $responsive_type = $config['responsive']['type'] ?? 'none';
  $variables['table_responsive_type'] = $responsive_type;

  // For backwards compatibility, also set boolean for 'stack' type
  $variables['table_responsive'] = ($responsive_type === 'stack');

  // For scroll type, we need a wrapper
  $variables['table_needs_wrapper'] = ($responsive_type === 'scroll');

  // Get modifier classes based on global settings
  $variables['table_modifiers'] = _brainsum_starterkit_get_table_modifiers();

  // Mark the whole table and the first cells if rows are draggable.
  if (!empty($variables['rows'])) {
    $draggable_row_found = FALSE;

    foreach ($variables['rows'] as &$row) {
      if ($row['attributes'] instanceof Attribute && $row['attributes']->hasClass('draggable')) {
        if (!$draggable_row_found) {
          $variables['attributes']['class'][] = 'draggable-table';
          $draggable_row_found = TRUE;

          // Pass tabledrag settings to JavaScript
          $tabledrag_config = _brainsum_starterkit_get_tabledrag_settings();
          $variables['#attached']['drupalSettings']['brainsum_starterkit']['tabledrag'] = [
            'screenReaderSupport' => $tabledrag_config['screen_reader_support'] ?? TRUE,
          ];
        }
      }
    }
  }
}
