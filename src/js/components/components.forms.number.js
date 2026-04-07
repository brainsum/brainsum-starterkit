/**
 * @file
 * Custom Number Input Controls
 *
 * Replaces native browser spinners with accessible +/- buttons for number
 * input fields. Respects min, max, and step attributes.
 *
 * How it works:
 *   1. Auto-discovers .c-number-input wrappers via once().
 *   2. Reads min/max/step from the <input> attributes.
 *   3. Clamps values and dispatches native change events for Drupal form handling.
 *   4. Observes the disabled attribute for dynamic state changes.
 *
 * Configuration (settings/settings.forms.yml):
 *   number_controls:
 *     enabled: false          # Global toggle (true = ON, forms = exclusions)
 *     disable_at_limits: false # Disable buttons at min/max boundaries
 *     forms:
 *       - my_form_id          # Include these when enabled: false
 *
 * Options (via data attributes on wrapper):
 *   data-disable-at-limits: Disable individual buttons at min/max boundaries.
 *     Without this attribute, buttons only disabled when input is disabled.
 *
 * Auto-attached when enabled for the form AND it contains number inputs.
 *
 * @param {object} Drupal - The Drupal object.
 * @param {object} once - The once utility.
 */

((Drupal, once) => {
  'use strict';

  /**
   * Initialize custom controls on a number input wrapper.
   *
   * @param {HTMLElement} wrapper
   *   The .c-number-input container element.
   */
  const init = (wrapper) => {
    const input = wrapper.querySelector('.c-number-input__field');
    const incrementButton = wrapper.querySelector(
      '.c-number-input__button--increment'
    );
    const decrementButton = wrapper.querySelector(
      '.c-number-input__button--decrement'
    );

    if (!input || !incrementButton || !decrementButton) {
      return;
    }

    const min = parseFloat(input.getAttribute('min'));
    const max = parseFloat(input.getAttribute('max'));
    const step = parseFloat(input.getAttribute('step')) || 1;
    const hasMin = !Number.isNaN(min);
    const hasMax = !Number.isNaN(max);
    const disableAtLimits = wrapper.hasAttribute('data-disable-at-limits');

    /**
     * Clamp and set a new value, then dispatch a change event.
     *
     * @param {number} newValue
     *   The new value to set.
     */
    const updateValue = (newValue) => {
      let clamped = newValue;
      if (hasMin) clamped = Math.max(min, clamped);
      if (hasMax) clamped = Math.min(max, clamped);
      input.value = clamped;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };

    /**
     * Sync disabled state of both buttons based on current value.
     *
     * When disableAtLimits is false (default), buttons only disabled when
     * the input itself is disabled (browser-like behavior).
     */
    const updateButtonStates = () => {
      if (disableAtLimits) {
        const currentValue = parseFloat(input.value) || 0;
        decrementButton.disabled =
          input.disabled || (hasMin && currentValue <= min);
        incrementButton.disabled =
          input.disabled || (hasMax && currentValue >= max);
      } else {
        decrementButton.disabled = input.disabled;
        incrementButton.disabled = input.disabled;
      }
    };

    incrementButton.addEventListener('click', (event) => {
      event.preventDefault();
      const currentValue = parseFloat(input.value) || 0;
      updateValue(currentValue + step);
    });

    decrementButton.addEventListener('click', (event) => {
      event.preventDefault();
      const currentValue = parseFloat(input.value) || 0;
      updateValue(currentValue - step);
    });

    updateButtonStates();
    input.addEventListener('input', updateButtonStates);
    input.addEventListener('change', updateButtonStates);

    // Watch for programmatic disabled-attribute changes.
    const observer = new MutationObserver(() => updateButtonStates());
    observer.observe(input, {
      attributes: true,
      attributeFilter: ['disabled']
    });

    // Store observer for cleanup.
    wrapper._numberObserver = observer;
  };

  /**
   * Drupal behavior: Initialize custom number input controls.
   */
  Drupal.behaviors.numberInputControls = {
    attach(context) {
      once('number-controls', '.c-number-input', context).forEach(init);
    },

    detach(context, settings, trigger) {
      if (trigger === 'unload') {
        const wrappers = context.querySelectorAll
          ? context.querySelectorAll('.c-number-input')
          : [];

        wrappers.forEach((wrapper) => {
          if (wrapper._numberObserver) {
            wrapper._numberObserver.disconnect();
            delete wrapper._numberObserver;
          }
        });
      }
    }
  };
})(Drupal, once);
