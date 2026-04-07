<?php

/**
 * @file
 * Form-related preprocess functions and theme suggestions.
 */

use Drupal\Component\Utility\Html;
use Drupal\Core\Entity\EntityFormInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Element;
use Drupal\Core\Template\Attribute;
use Symfony\Component\Yaml\Yaml;

/**
 * Returns the forms configuration from YAML file.
 *
 * Reads settings/settings.forms.yml and caches the result for the request.
 * All form-related settings (floating labels, icons, switches) are
 * centralized in this config file.
 *
 * @return array
 *   The parsed configuration array.
 */
function _brainsum_starterkit_get_forms_config(): array {
  static $config = NULL;

  if ($config === NULL) {
    $theme_path = \Drupal::service('extension.list.theme')->getPath('brainsum_starterkit');
    $config_file = $theme_path . '/settings/settings.forms.yml';

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
 * Checks if a form feature is enabled for the given form.
 *
 * Implements the unified toggle pattern used across all settings:
 *   enabled: true  → feature ON globally; listed forms are EXCLUDED
 *   enabled: false → feature OFF globally; listed forms are INCLUDED
 *
 * @param string $feature
 *   The feature key in settings.forms.yml (e.g., 'floating_labels').
 * @param string $form_id
 *   The form ID to check.
 *
 * @return bool
 *   TRUE if the feature is enabled for this form, FALSE otherwise.
 */
function _brainsum_starterkit_is_feature_enabled(string $feature, string $form_id): bool {
  $config = _brainsum_starterkit_get_forms_config();
  $global = !empty($config[$feature]['enabled']);
  $forms = $config[$feature]['forms'] ?? [];
  $in_list = in_array($form_id, $forms, TRUE);

  // Global ON → list is exclusions; Global OFF → list is inclusions.
  return $global ? !$in_list : $in_list;
}

/**
 * Checks if a form contains any element of the given type.
 *
 * Recursively scans the render array so that libraries like enhanced_select
 * or number_controls are only attached when the form actually contains
 * the relevant input type.
 *
 * @param array $elements
 *   The form or form element render array.
 * @param string $type
 *   The element #type to look for (e.g., 'select', 'number').
 *
 * @return bool
 *   TRUE if at least one element of that type is found.
 */
function _brainsum_starterkit_form_has_element_type(array $elements, string $type): bool {
  foreach (Element::children($elements) as $key) {
    if (isset($elements[$key]['#type']) && $elements[$key]['#type'] === $type) {
      return TRUE;
    }
    if (is_array($elements[$key]) && _brainsum_starterkit_form_has_element_type($elements[$key], $type)) {
      return TRUE;
    }
  }
  return FALSE;
}

/**
 * Determines if floating labels should be used for a given form.
 *
 * Uses the unified feature toggle, but additionally disables floating labels
 * for horizontal/inline form layouts (they are incompatible).
 *
 * @param string $form_id
 *   The form ID to check.
 * @param bool $is_inline
 *   Whether the form has horizontal/inline layout.
 *
 * @return bool
 *   TRUE if floating labels should be used, FALSE otherwise.
 */
function _brainsum_starterkit_use_floating_labels(string $form_id, bool $is_inline = FALSE): bool {
  if ($is_inline) {
    return FALSE;
  }

  return _brainsum_starterkit_is_feature_enabled('floating_labels', $form_id);
}

/**
 * Checks if a boolean field should be displayed inline based on config.
 *
 * Uses prefix matching for field names.
 *
 * @param string $name
 *   The field name to check.
 *
 * @return bool
 *   TRUE if the field should be inline, FALSE otherwise.
 */
function _brainsum_starterkit_is_inline_boolean(string $name): bool {
  $config = _brainsum_starterkit_get_forms_config();
  $inline_names = $config['inline_booleans']['names'] ?? [];

  foreach ($inline_names as $field_name) {
    if (str_starts_with($name, $field_name)) {
      return TRUE;
    }
  }

  return FALSE;
}

/**
 * Implements hook_preprocess_form().
 *
 * Sets form-level variables from config for the form template.
 */
function brainsum_starterkit_preprocess_form(&$variables) {
  $form_id = $variables['element']['#form_id'] ?? '';

  // Check if form has horizontal layout from config.
  $is_horizontal = _brainsum_starterkit_is_feature_enabled('horizontal_layout', $form_id);
  $variables['is_horizontal'] = $is_horizontal;

  // Check if floating labels should be used.
  $classes = $variables['attributes']['class'] ?? [];
  $is_inline = in_array('form--inline', $classes, TRUE) || $is_horizontal;
  $variables['use_floating_labels'] = _brainsum_starterkit_use_floating_labels($form_id, $is_inline);

  // Add modifier class for forms with no visible form items (e.g., tabledrag).
  // These forms only contain tables/hidden elements and shouldn't have gaps.
  $has_visible_form_items = FALSE;

  foreach (Element::children($variables['element']) as $key) {
    $element = $variables['element'][$key];
    $type = $element['#type'] ?? '';

    // Check if this is a visible form item (not table, hidden, token, etc.).
    if (!in_array($type, ['table', 'hidden', 'token', 'value'], TRUE)) {
      $has_visible_form_items = TRUE;
      break;
    }
  }

  if (!$has_visible_form_items) {
    $variables['attributes']['class'][] = 'has-no-visible-form-items';
  }
}

/**
 * Wraps AJAX buttons with a container to prevent layout shift.
 *
 * Recursively processes form elements looking for buttons with #ajax
 * and wraps them in a div.c-ajax-button-wrapper using #prefix/#suffix.
 *
 * @param array $elements
 *   The form or form elements array to process.
 */
function _brainsum_starterkit_wrap_ajax_buttons(array &$elements): void {
  foreach (Element::children($elements) as $key) {
    $element = &$elements[$key];

    // Check if this is a button/submit with #ajax.
    $is_button = isset($element['#type']) && in_array($element['#type'], [
      'button',
      'submit',
      'image_button',
    ], TRUE);
    $has_ajax = !empty($element['#ajax']);

    // Skip if inside a form-item (uses in-field spinner instead).
    $in_form_item = !empty($element['#theme_wrappers']) &&
      in_array('form_element', $element['#theme_wrappers'], TRUE);

    if ($is_button && $has_ajax && !$in_form_item) {
      $element['#prefix'] = ($element['#prefix'] ?? '') . '<div class="c-ajax-button-wrapper">';
      $element['#suffix'] = '</div>' . ($element['#suffix'] ?? '');
    }

    // Recurse into children.
    if (is_array($element)) {
      _brainsum_starterkit_wrap_ajax_buttons($element);
    }
  }
}

/**
 * Implements hook_form_alter().
 *
 * Adds classes and placeholder text to forms, attaches libraries based on
 * config, and passes floating labels setting to all form elements.
 */
function brainsum_starterkit_form_alter(&$form, FormStateInterface $form_state, $form_id) {
  if (isset($form['actions']['submit']) && (count($form['actions'])) <= 2) {
    $form['actions']['submit']['#attributes']['class'][] = 'c-button--primary';
  }

  // Wrap AJAX buttons with container to prevent layout shift when spinner appears.
  _brainsum_starterkit_wrap_ajax_buttons($form);

  // Check if form has horizontal/inline layout (from config or existing class).
  $classes = $form['#attributes']['class'] ?? [];
  $is_horizontal = _brainsum_starterkit_is_feature_enabled('horizontal_layout', $form_id);
  $is_inline = in_array('form--inline', $classes, TRUE) || $is_horizontal;

  // Pass floating labels setting to all child elements.
  // Floating labels are disabled for horizontal/inline form layouts.
  $use_floating_labels = _brainsum_starterkit_use_floating_labels($form_id, $is_inline);
  _brainsum_starterkit_set_floating_labels($form, $use_floating_labels);

  // Pass number controls setting to all child elements.
  // Library attachment happens in input--number.html.twig only when a number
  // input actually renders, so no wasted library loads.
  $use_number_controls = _brainsum_starterkit_is_feature_enabled('number_controls', $form_id)
    && _brainsum_starterkit_form_has_element_type($form, 'number');
  _brainsum_starterkit_set_element_property($form, '#use_number_controls', $use_number_controls);

  // Attach enhanced select library if enabled AND form contains <select>.
  if (_brainsum_starterkit_is_feature_enabled('enhanced_select', $form_id)
    && _brainsum_starterkit_form_has_element_type($form, 'select')) {
    $form['#attached']['library'][] = 'brainsum_starterkit/forms.select';
  }

  // Attach validation library if enabled for this form.
  if (_brainsum_starterkit_is_feature_enabled('validation', $form_id)) {
    $form['#attached']['library'][] = 'brainsum_starterkit/forms.validation';
  }

  switch ($form_id) {
    case 'search_block_form':
      // Add placeholder text to keys input.
      $form['keys']['#attributes']['placeholder'] = t(
        'Search by keyword or phrase.'
      );

      // Add classes to the search form submit input.
      $form['actions']['submit']['#attributes']['class'][] = 'c-search-form__submit';
      break;

    case 'search_form':
      $form['basic']['keys']['#attributes']['placeholder'] = t(
        'Search by keyword or phrase.'
      );
      $form['basic']['submit']['#attributes']['class'][] = 'c-button--primary';
      $form['advanced']['submit']['#attributes']['class'][] = 'c-button--primary';
      break;
  }
}

/**
 * Implements hook_theme_suggestions_HOOK_alter() for form templates.
 *
 * Adds form ID-based template suggestions (e.g., form--search-block-form.html.twig).
 */
function brainsum_starterkit_theme_suggestions_form_alter(array &$suggestions, array $variables) {
  if (isset($variables['element']['#form_id'])) {
    $form_id = $variables['element']['#form_id'];
    $suggestions[] = 'form__' . $form_id;
  }
}

/**
 * Helper function to recursively set #use_floating_labels on form elements.
 *
 * Detects horizontal/inline containers and disables floating labels for their
 * children, as floating labels are incompatible with horizontal form layouts.
 *
 * @param array $elements
 *   The form or form element array.
 * @param bool $use_floating_labels
 *   Whether to use floating labels.
 */
function _brainsum_starterkit_set_floating_labels(array &$elements, bool $use_floating_labels): void {
  foreach (Element::children($elements) as $key) {
    $child_use_floating = $use_floating_labels;

    // Detect horizontal/inline containers and disable floating labels.
    $classes = $elements[$key]['#attributes']['class'] ?? [];
    if (is_array($classes) && (in_array('c-form--horizontal', $classes, TRUE) || in_array('form--inline', $classes, TRUE))) {
      $child_use_floating = FALSE;
    }

    $elements[$key]['#use_floating_labels'] = $child_use_floating;

    // Recurse into children with the potentially modified setting.
    if (is_array($elements[$key])) {
      _brainsum_starterkit_set_floating_labels($elements[$key], $child_use_floating);
    }
  }
}

/**
 * Recursively sets a property on all child form elements.
 *
 * Generic counterpart to _brainsum_starterkit_set_floating_labels() for any
 * boolean property that needs to propagate down the render tree.
 *
 * @param array $elements
 *   The form or form element array.
 * @param string $property
 *   The render property name (e.g., '#use_number_controls').
 * @param bool $value
 *   The value to set.
 */
function _brainsum_starterkit_set_element_property(array &$elements, string $property, bool $value): void {
  foreach (Element::children($elements) as $key) {
    $elements[$key][$property] = $value;
    if (is_array($elements[$key])) {
      _brainsum_starterkit_set_element_property($elements[$key], $property, $value);
    }
  }
}

/**
 * Implements hook_preprocess_HOOK() for form-element.html.twig.
 *
 * Adds description classes, disabled state handling, exposes the actual HTML
 * input type, passes floating labels setting, and provides forms config.
 */
function brainsum_starterkit_preprocess_form_element(&$variables) {
  if (!empty($variables['description']['attributes'])) {
    $variables['description']['attributes']->addClass('c-form-item__description');
  }

  if ($variables['disabled']) {
    $variables['label']['#attributes']['class'][] = 'is-disabled';
  }

  // Expose the actual HTML input type when #attributes['type'] overrides #type
  // (e.g. #type => 'date' with #attributes => ['type' => 'time']).
  $element = $variables['element'];
  $variables['input_type'] = !empty($element['#attributes']['type'])
    ? $element['#attributes']['type']
    : $variables['type'];

  // Pass floating labels setting from form to template.
  $variables['use_floating_labels'] = !empty($element['#use_floating_labels']);

  // Pass forms config from YAML file to template.
  $variables['forms_config'] = _brainsum_starterkit_get_forms_config();

  // Provide container attributes object for the input wrapper element.
  $variables['container_attributes'] = new Attribute();
}

/**
 * Implements hook_theme_suggestions_HOOK_alter() for form_element.
 *
 * Adds per-type and per-name template suggestions so that individual form
 * elements can be themed with dedicated Twig files. For example:
 *   - form-element--checkbox.html.twig     (all checkboxes)
 *   - form-element--switch-off.html.twig   (element named "switch_off")
 */
function brainsum_starterkit_theme_suggestions_form_element_alter(array &$suggestions, array $variables) {
  $element = $variables['element'];

  if (!empty($element['#type'])) {
    $suggestions[] = 'form_element__' . $element['#type'];
  }

  if (!empty($element['#name'])) {
    $name = str_replace(['-', '[', ']'], ['_', '_', ''], $element['#name']);
    $suggestions[] = 'form_element__' . $name;
  }

  // Form switch: reuse a single shared template for all switch checkboxes.
  if (!empty($element['#form_switch'])) {
    $suggestions[] = 'form_element__form_switch';
  }
}

/**
 * Implements hook_preprocess_HOOK() for form-element-label.html.twig.
 *
 * Adds the c-form-item__label class to all form element labels.
 */
function brainsum_starterkit_preprocess_form_element_label(&$variables) {
  $variables['attributes']['class'][] = 'c-form-item__label';
}

/**
 * Implements hook_preprocess_HOOK() for input.html.twig.
 *
 * Adds BEM classes based on input type, handles title attributes, adds empty
 * placeholder for floating labels, and provides autocomplete loading message.
 */
function brainsum_starterkit_preprocess_input(&$variables) {
  if (
    !empty($variables['element']['#title_display']) &&
    $variables['element']['#title_display'] === 'attribute' &&
    !empty((string) $variables['element']['#title'])
  ) {
    $variables['attributes']['title'] = (string) $variables['element']['#title'];
  }

  $type_api = $variables['element']['#type'];
  $type_html = $variables['attributes']['type'];
  $text_types_html = [
    'text',
    'email',
    'tel',
    'number',
    'search',
    'password',
    'date',
    'time',
    'file',
    'color',
    'datetime-local',
    'url',
    'month',
    'week',
  ];

  if (in_array($type_html, $text_types_html, TRUE)) {
    $variables['attributes']['class'][] = 'c-form-element';
    $variables['attributes']['class'][] = Html::getClass(
      'c-form-element--type-' . $type_html
    );
    $variables['attributes']['class'][] = Html::getClass(
      'c-form-element--api-' . $type_api
    );

    // Add empty placeholder for floating labels (required for :placeholder-shown CSS).
    if (!isset($variables['attributes']['placeholder'])) {
      $variables['attributes']['placeholder'] = '';
    }

    // Add form label value as placeholder attribute.
    /* Uncomment this if you want to add the label as a placeholder.
    if (isset($variables['element']['#title'])) {
    $variables['attributes']['placeholder'] =
    (string) $variables['element']['#title'];
    }. */
    if (!empty($variables['element']['#autocomplete_route_name'])) {
      $variables['autocomplete_message'] = t('Loading…');
    }
  }

  // Drupal omits the required attribute on file inputs. Add it so
  // client-side validation (JustValidate) can discover the field.
  // Uncomment it if you needed
  /* if ($type_html === 'file' && !empty($variables['element']['#required'])) {
    $variables['attributes']['required'] = 'required';
  } */

  // Pass number controls settings to number input templates.
  if ($type_html === 'number') {
    $variables['use_number_controls'] = !empty($variables['element']['#use_number_controls']);
    $config = _brainsum_starterkit_get_forms_config();
    $variables['disable_at_limits'] = !empty($config['number_controls']['disable_at_limits']);
  }

  if (in_array($type_html, ['checkbox', 'radio'], TRUE)) {
    $variables['attributes']['class'][] = 'c-form-boolean';
    $variables['attributes']['class'][] = Html::getClass(
      'c-form-boolean--type-' . $type_html
    );

    // Remove c-form-inline from individual inputs — it belongs on the
    // boolean-group wrapper (promoted in preprocess_checkboxes/radios).
    $variables['attributes']['class'] = array_values(array_filter(
      $variables['attributes']['class'],
      fn($class) => $class !== 'c-form-inline',
    ));
  }
}

/**
 * Implements hook_preprocess_HOOK() for textarea.html.twig.
 *
 * Adds BEM classes and empty placeholder for floating labels support.
 */
function brainsum_starterkit_preprocess_textarea(&$variables) {
  $variables['attributes']['class'][] = 'c-form-element';
  $variables['attributes']['class'][] = 'c-form-element--type-textarea';
  $variables['attributes']['class'][] = 'c-form-element--api-textarea';

  // Add empty placeholder for floating labels (required for :placeholder-shown CSS).
  if (!isset($variables['attributes']['placeholder'])) {
    $variables['attributes']['placeholder'] = '';
  }

  // Pass floating labels flag to template (from element #attributes).
  if (!empty($variables['element']['#attributes']['use_floating_labels'])) {
    $variables['use_floating_labels'] = TRUE;
  }

  // Add form label value as placeholder attribute.
  /* Uncomment this if you want to add the label as a placeholder.
  if (isset($variables['element']['#title'])) {
  $variables['attributes']['placeholder'] =
  (string) $variables['element']['#title'];
  }. */
}

/**
 * Implements hook_preprocess_HOOK() for select.html.twig.
 *
 * Adds BEM classes differentiating single and multiple select elements.
 */
function brainsum_starterkit_preprocess_select(&$variables) {
  $variables['attributes']['class'][] = 'c-form-element';
  $variables['attributes']['class'][] = $variables['element']['#multiple'] ?
    'c-form-element--type-select-multiple' :
    'c-form-element--type-select';
}

/**
 * Implements hook_preprocess_HOOK() for checkboxes.html.twig.
 *
 * Adds boolean group class and checks config for inline display.
 */
function brainsum_starterkit_preprocess_checkboxes(&$variables) {
  $variables['attributes']['class'][] = 'c-form-boolean-group';

  // Check if field should be inline based on config.
  $element = $variables['element'];
  $name = $element['#name'] ?? '';
  if (_brainsum_starterkit_is_inline_boolean($name)) {
    $variables['attributes']['class'][] = 'c-form-inline';
  }
}

/**
 * Implements hook_preprocess_HOOK() for radios.html.twig.
 *
 * Adds boolean group class and checks config for inline display.
 */
function brainsum_starterkit_preprocess_radios(&$variables) {
  $variables['attributes']['class'][] = 'c-form-boolean-group';

  // Check if field should be inline based on config.
  $element = $variables['element'];
  $name = $element['#name'] ?? '';
  if (_brainsum_starterkit_is_inline_boolean($name)) {
    $variables['attributes']['class'][] = 'c-form-inline';
  }
}

/**
 * Implements hook_preprocess_HOOK() for fieldset.html.twig.
 *
 * Handles error/disabled states, converts composite fieldsets to accessible
 * div wrappers for CSS Grid compatibility, and manages inline container class.
 */
function brainsum_starterkit_preprocess_fieldset(&$variables) {
  $element = $variables['element'];
  $composite_types = ['checkboxes', 'radios'];

  if (
    !empty($element['#type']) && in_array($element['#type'], $composite_types)
    && !empty($variables['element']['#children_errors'])
  ) {
    $variables['legend_span']['attributes']->addClass('has-error');
  }

  if (!empty($element['#disabled'])) {
    $variables['legend_span']['attributes']->addClass('is-disabled');

    if (
      !empty($variables['description']) &&
      !empty($variables['description']['attributes'])
    ) {
      $variables['description']['attributes']->addClass('is-disabled');
    }
  }

  // Composite elements (radios, checkboxes): replace <fieldset>/<legend> with
  // <div role="group" aria-labelledby="..."> for better CSS Grid compatibility
  // while maintaining accessibility.
  $is_composite = !empty($element['#type'])
    && in_array($element['#type'], $composite_types, TRUE);
  $variables['is_composite'] = $is_composite;

  if ($is_composite && !empty($element['#id'])) {
    $variables['composite_label_id'] = Html::getUniqueId($element['#id'] . '-label');
  }

  // Remove 'container-inline' class from the main attributes and add a flag
  // instead.
  // @todo remove this after https://www.drupal.org/node/3059593 has been
  //   resolved.
  if (!empty($variables['attributes']['class'])) {
    $container_inline_key = array_search(
      'container-inline', $variables['attributes']['class']
    );

    if ($container_inline_key !== FALSE) {
      unset($variables['attributes']['class'][$container_inline_key]);
      $variables['inline_items'] = TRUE;
    }

    // Remove c-form-inline from fieldset - inline display is now controlled
    // via config/forms.config.yml only.
    $inline_key = array_search('c-form-inline', $variables['attributes']['class']);
    if ($inline_key !== FALSE) {
      unset($variables['attributes']['class'][$inline_key]);
    }
  }
}

/**
 * Implements hook_theme_suggestions_HOOK_alter() for fieldset.
 *
 * Adds ID-based and dropdown_language module suggestions.
 */
function brainsum_starterkit_theme_suggestions_fieldset_alter(
  array &$suggestions,
  array $variables,
  $hook,
) {
  if (isset($variables['element']['#id'])) {
    $id = str_replace("-", "_", $variables['element']['#id']);
    $suggestions[] = $hook . '__' . $id;
  }

  // Add a suggestion for the dropdown_language module's fieldset wrapper.
  if (isset($variables['element']['switch-language'])) {
    $suggestions[] = $hook . '__dropdown_language';
  }
}

/**
 * Implements hook_preprocess_HOOK() for text-format-wrapper.html.twig.
 *
 * Fixes inconsistencies of TextareaWidget and TextareaWithSummaryWidget form
 * elements by providing description_attributes for proper aria-describedby
 * association.
 *
 * @todo Remove when https://www.drupal.org/node/3016343 is fixed.
 */
function brainsum_starterkit_preprocess_text_format_wrapper(&$variables) {
  $description_attributes = [];
  if (!empty($variables['attributes']['id'])) {
    $description_attributes['id'] = $variables['attributes']['aria-describedby'] = $variables['attributes']['id'];
    unset($variables['attributes']['id']);
  }
  $variables['description_attributes'] = new Attribute($description_attributes);
}

/**
 * Implements hook_form_FORM_ID_alter() for comment_form.
 *
 * Changes submit button text based on whether it's a reply or new comment.
 */
function brainsum_starterkit_form_comment_form_alter(
  &$form,
  FormStateInterface $form_state,
  $form_id,
) {
  $form_object = $form_state->getFormObject();
  if (!$form_object instanceof EntityFormInterface) {
    return;
  }
  /** @var \Drupal\comment\Entity\Comment $comment */
  $comment = $form_object->getEntity();
  if ($comment->hasParentComment()) {
    $form['actions']['submit']['#value'] = t('Reply to comment');
  }
  else {
    $form['actions']['submit']['#value'] = t('Post comment');
  }
}

/**
 * Implements hook_form_FORM_ID_alter() for node_preview_form_select.
 *
 * Adds button and form element styling classes to the node preview form.
 */
function brainsum_starterkit_form_node_preview_form_select_alter(
  &$form,
  FormStateInterface $form_state,
  $form_id,
) {
  $form['backlink']['#options']['attributes']['class'][] = 'c-button';
  $form['backlink']['#options']['attributes']['class'][] = 'c-button--small';
  $form['backlink']['#options']['attributes']['class'][] = 'c-button--icon-back';
  $form['backlink']['#options']['attributes']['class'][] = 'c-button--primary';
  $form['view_mode']['#attributes']['class'][] = 'c-form-element--small';
}

/**
 * Implements hook_form_views_exposed_form_alter().
 *
 * Adds form--inline class for horizontal layout of Views exposed filters.
 */
function brainsum_starterkit_form_views_exposed_form_alter(&$form) {
  $form['#attributes']['class'][] = 'form--inline';
}
