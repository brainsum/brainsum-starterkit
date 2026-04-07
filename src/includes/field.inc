<?php

/**
 * @file
 * Field-related preprocess functions.
 */

use Drupal\Core\Render\Element;

/**
 * Implements hook_preprocess_HOOK() for field.html.twig.
 *
 * Adds text-content class to rich text field types for typography styling.
 */
function brainsum_starterkit_preprocess_field(&$variables) {
  $rich_field_types = ['text_with_summary', 'text', 'text_long'];

  if (in_array($variables['field_type'], $rich_field_types, TRUE)) {
    $variables['attributes']['class'][] = 'text-content';
  }
}

/**
 * Implements hook_preprocess_HOOK() for field-multiple-value-form.html.twig.
 *
 * Adds label classes, required state handling, and disabled state styling
 * for multi-value field widgets with draggable table rows.
 */
function brainsum_starterkit_preprocess_field_multiple_value_form(&$variables) {
  // Make disabled available for the template.
  $variables['disabled'] = !empty($variables['element']['#disabled']);

  if (!empty($variables['multiple'])) {
    // Add an additional CSS class for the field label table cell.
    // This repeats the logic of template_preprocess_field_multiple_value_form()
    // without using '#prefix' and '#suffix' for the wrapper element.
    //
    // If the field is multiple, we don't have to check the existence of the
    // table header cell.
    //
    // @see template_preprocess_field_multiple_value_form().
    $header_attributes = [
      'class' => [
        'c-form-item__label',
        'c-form-item__label--multiple-value-form',
      ],
    ];
    if (!empty($variables['element']['#required'])) {
      $header_attributes['class'][] = 'js-form-required';
      $header_attributes['class'][] = 'form-required';
      $header_attributes['class'][] = 'is-required';
    }
    // Using array_key_first() for addressing the first header cell would be
    // more elegant here, but we can rely on the related theme.inc preprocess.
    // @todo change this after https://www.drupal.org/node/3099026 has landed.
    $variables['table']['#header'][0]['data'] = [
      '#type' => 'html_tag',
      '#tag' => 'h4',
      '#value' => $variables['element']['#title'],
      '#attributes' => $header_attributes,
    ];

    if ($variables['disabled']) {
      $variables['table']['#attributes']['class'][] = 'tabledrag-disabled';
      $variables['table']['#attributes']['class'][] = 'js-tabledrag-disabled';

      // We will add the 'is-disabled' CSS class to the disabled table header
      // cells.
      $header_attributes['class'][] = 'is-disabled';
      foreach ($variables['table']['#header'] as &$cell) {
        if (is_array($cell) && isset($cell['data'])) {
          $cell = $cell + ['class' => []];
          $cell['class'][] = 'is-disabled';
        }
        else {
          // We have to modify the structure of this header cell.
          $cell = [
            'data' => $cell,
            'class' => ['is-disabled'],
          ];
        }
      }
    }
  }
}

/**
 * Implements hook_preprocess_HOOK() for field--node--created.html.twig.
 *
 * Removes the "Submitted by" prefix from the created date field.
 */
function brainsum_starterkit_preprocess_field__node__created(&$variables) {
  foreach (Element::children($variables['items']) as $item) {
    unset($variables['items'][$item]['content']['#prefix']);
  }
}
