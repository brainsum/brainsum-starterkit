<?php

/**
 * @file
 * Block-related theme suggestions and preprocess functions.
 */

/**
 * Implements hook_theme_suggestions_HOOK_alter() for block.
 *
 * Adds region-based block template suggestions.
 */
function brainsum_starterkit_theme_suggestions_block_alter(&$suggestions, array $variables) {
  if (!empty($variables['elements']['#id'])) {

    /** @var \Drupal\block\BlockInterface $block */
    $block = \Drupal::entityTypeManager()
      ->getStorage('block')
      ->load($variables['elements']['#id']);
    if ($block) {

      // Add region-specific block theme suggestions.
      $region = $block->getRegion();
      $base_plugin_id = $variables['elements']['#base_plugin_id'];
      $derivative_plugin_id = $variables['elements']['#derivative_plugin_id'];

      $suggestions[] = 'block__' . $region;

      // Add suggestion with base plugin ID.
      if ($base_plugin_id) {
        $suggestions[] = 'block__' . $region . '__' . strtr($base_plugin_id, '-', '_');

        // Add suggestion with base plugin ID and derivative.
        if ($derivative_plugin_id) {
          $suggestions[] = 'block__' . $region . '__' . strtr($base_plugin_id, '-', '_') . '__' . strtr($derivative_plugin_id, '-', '_');
        }
      }

      $suggestions[] = 'block__' . $region . '__' . $variables['elements']['#id'];
    }
  }
}

/**
 * Implements hook_preprocess_HOOK() for page-title.html.twig.
 *
 * Wraps title with shortcut link and hides shortcut on front page.
 */
function brainsum_starterkit_preprocess_page_title(&$variables) {
  // Since the title and the shortcut link are both block level elements,
  // positioning them next to each other is much simpler with a wrapper div.
  if (
    !empty($variables['title_suffix']['add_or_remove_shortcut']) && $variables['title']
  ) {
    // Add a wrapper div using the title_prefix and title_suffix render
    // elements.
    $variables['title_prefix']['shortcut_wrapper'] = [
      '#markup' => '<div class="c-shortcut__wrapper">',
      '#weight' => 100,
    ];
    $variables['title_suffix']['shortcut_wrapper'] = [
      '#markup' => '</div>',
      '#weight' => -99,
    ];

    // Make sure the shortcut link is the first item in title_suffix.
    $variables['title_suffix']['add_or_remove_shortcut']['#weight'] = -100;
  }

  // Unset shortcut link on front page.
  $variables['is_front'] = \Drupal::service('path.matcher')->isFrontPage();
  if ($variables['is_front'] === TRUE) {
    unset($variables['title_suffix']['add_or_remove_shortcut']);
  }
}

/**
 * Implements hook_preprocess_HOOK() for region.html.twig.
 *
 * Makes layout and header settings available to region templates.
 */
function brainsum_starterkit_preprocess_region(&$variables) {
  // Load layout settings and make available to template.
  $layout_settings = _brainsum_starterkit_get_layout_settings();
  $variables['component_containers'] = $layout_settings['component_containers'];

  // Load header settings and make available to template.
  $header_settings = _brainsum_starterkit_get_header_settings();
  $variables['sticky_header'] = $header_settings['sticky_header'];
}

/**
 * Implements hook_preprocess_HOOK() for block.html.twig.
 *
 * Makes layout and header settings available to block templates.
 */
function brainsum_starterkit_preprocess_block(&$variables) {
  // Load layout settings and make available to template.
  $layout_settings = _brainsum_starterkit_get_layout_settings();
  $variables['component_containers'] = $layout_settings['component_containers'];

  // Load header settings and make available to template.
  $header_settings = _brainsum_starterkit_get_header_settings();
  $variables['sticky_header'] = $header_settings['sticky_header'];
}
