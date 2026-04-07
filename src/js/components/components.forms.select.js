/**
 * @file
 * Enhanced Select Fields with Choices.js
 *
 * Provides enhanced select fields with search, custom styling, and improved UX
 * using the Choices.js library.
 *
 * Third-party library: Choices.js v11
 *   Install : composer require npm-asset/choices.js
 *   Docs    : https://choices-js.github.io/Choices/
 *   GitHub  : https://github.com/Choices-js/Choices
 *
 * How it works:
 *   1. Auto-discovers select elements with the `.js-select` class.
 *   2. Initializes Choices.js with sensible defaults.
 *   3. Integrates with Drupal's translation system for UI strings.
 *
 * Configuration (settings/settings.forms.yml):
 *   enhanced_select:
 *     enabled: false        # Global toggle (true = ON, forms = exclusions)
 *     forms:
 *       - my_form_id        # Include these when enabled: false
 *
 * Auto-attached when enabled for the form AND it contains <select> elements.
 *
 * @param {object} Drupal - The Drupal object.
 * @param {object} once - The once utility.
 */

/* global Choices */

((Drupal, once) => {
  'use strict';

  /**
   * Initialize Choices.js on a select element.
   *
   * @param {HTMLSelectElement} select
   *   The select element to enhance.
   */
  const init = (select) => {
    // Check if first option is a placeholder (empty value).
    const firstOption = select.options[0];
    const hasPlaceholder = firstOption && firstOption.value === '';
    const placeholderValue = hasPlaceholder ? firstOption.text : '';
    const isMultiple = select.multiple;

    // For multiple selects, show a placeholder when empty.
    const multiplePlaceholder = isMultiple ? Drupal.t('Select options...') : '';

    const choices = new Choices(select, {
      itemSelectText: '',
      shouldSort: false,
      position: 'auto',
      searchEnabled: select.options.length > 5,
      searchResultLimit: 10,
      searchPlaceholderValue: Drupal.t('Search...'),
      placeholder: isMultiple,
      placeholderValue: isMultiple ? multiplePlaceholder : placeholderValue,
      removeItemButton: isMultiple,
      removeItems: isMultiple,
      noResultsText: Drupal.t('No results found'),
      noChoicesText: Drupal.t('No choices to choose from'),
      loadingText: Drupal.t('Loading...')
    });

    // Add class to container to hide original icon.
    const container = select.closest('.c-form-element__container');
    if (container) {
      container.classList.add('has-choices');
    }

    // Store instance reference for cleanup.
    select._choicesInstance = choices;
  };

  /**
   * Drupal behavior: Initialize Choices.js on select elements.
   */
  Drupal.behaviors.formSelect = {
    attach(context) {
      once('choices', 'select.js-select', context).forEach((select) => {
        if (!select.disabled) {
          init(select);
        }
      });
    },

    detach(context, settings, trigger) {
      if (trigger === 'unload') {
        const selects = context.querySelectorAll
          ? context.querySelectorAll('select.js-select')
          : [];

        selects.forEach((select) => {
          if (select._choicesInstance) {
            select._choicesInstance.destroy();
            delete select._choicesInstance;

            // Remove class from container.
            const container = select.closest('.c-form-element__container');
            if (container) {
              container.classList.remove('has-choices');
            }
          }
        });
      }
    }
  };
})(Drupal, once);
