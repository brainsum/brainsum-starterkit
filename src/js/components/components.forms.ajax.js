/**
 * @file
 * AJAX progress indicator override for form fields.
 *
 * Replaces Drupal's default throbber (inserted after the element) with an
 * in-field spinning icon using the theme's .has-icon / .is-loading system.
 *
 * For fields that already have an icon (.has-icon), the icon is swapped to a
 * spinner. For fields without an icon, a temporary container and icon classes
 * are added dynamically and removed on completion.
 *
 * Note: AJAX buttons are wrapped with .c-ajax-button-wrapper in PHP
 * (form_alter) to prevent layout shift when the throbber appears.
 *
 * @param {object} Drupal - The Drupal object.
 * @param {object} $ - jQuery.
 */

((Drupal, $) => {
  /**
   * Theme override: return a hidden element for in-field spinners.
   *
   * Drupal's internal cleanup (this.progress.element removal) still works
   * without showing the default throbber.
   *
   * @param {string} message - The progress message.
   * @return {string} The hidden throbber markup.
   */
  Drupal.theme.ajaxProgressThrobber = (message) => {
    const messageMarkup =
      typeof message === 'string'
        ? `<div class="message">${message}</div>`
        : '';
    return `<div class="ajax-progress ajax-progress-throbber" hidden><div class="throbber">&nbsp;</div>${messageMarkup}</div>`;
  };

  const originalSuccess = Drupal.Ajax.prototype.success;
  const originalError = Drupal.Ajax.prototype.error;

  /**
   * Find the closest .c-form-item ancestor of the AJAX-triggering element.
   *
   * @param {HTMLElement} element - The triggering element.
   * @return {HTMLElement|null} The form item element or null.
   */
  const findFormItem = (element) => element?.closest('.c-form-item');

  /**
   * Add loading state to a form item.
   *
   * @param {Drupal.Ajax} ajax - The Ajax instance.
   * @param {HTMLElement} formItem - The form item element.
   */
  const startLoading = (ajax, formItem) => {
    formItem.classList.add('is-loading');
    ajax._loadingFormItem = formItem;

    // For items without an existing icon, add icon support dynamically.
    if (!formItem.classList.contains('has-icon')) {
      formItem.classList.add('has-icon', 'has-icon--end');
      ajax._addedIconClasses = true;

      // Wrap the input in a container so the ::after icon can render.
      const input = formItem.querySelector(
        '.c-form-element, input, select, textarea'
      );

      if (input && !input.closest('[class*="__container"]')) {
        const container = document.createElement('div');
        container.className = 'c-form-element--type-loading__container';
        input.parentNode.insertBefore(container, input);
        container.appendChild(input);
        ajax._loadingContainer = container;
      }
    }
  };

  /**
   * Remove loading state from a form item and clean up any dynamically
   * added elements/classes.
   *
   * @param {Drupal.Ajax} ajax - The Ajax instance.
   */
  const stopLoading = (ajax) => {
    const formItem = ajax._loadingFormItem;

    if (!formItem) {
      return;
    }

    formItem.classList.remove('is-loading');

    // Remove dynamically added icon classes.
    if (ajax._addedIconClasses) {
      formItem.classList.remove('has-icon', 'has-icon--end');
      ajax._addedIconClasses = false;
    }

    // Unwrap dynamically created container.
    if (ajax._loadingContainer) {
      const container = ajax._loadingContainer;
      const child = container.firstElementChild;

      if (child) {
        container.parentNode.insertBefore(child, container);
      }

      container.remove();
      ajax._loadingContainer = null;
    }

    ajax._loadingFormItem = null;
  };

  /**
   * Override: use in-field spinner instead of the default throbber element.
   */
  Drupal.Ajax.prototype.setProgressIndicatorThrobber = function () {
    const formItem = findFormItem(this.element);

    if (formItem) {
      // Inside a form item — use in-field spinner.
      startLoading(this, formItem);

      // Create a hidden progress element for Drupal's internal tracking.
      this.progress.element = $(
        Drupal.theme('ajaxProgressThrobber', this.progress.message)
      );
      formItem.appendChild(this.progress.element[0]);
      return;
    }

    // Not inside a form item — show visible throbber next to the element.
    // PHP wraps form buttons; this handles edge cases like .use-ajax links.
    const $element = $(this.element);
    const message = this.progress.message;
    const messageMarkup =
      typeof message === 'string'
        ? `<div class="message">${message}</div>`
        : '';
    const throbberMarkup = `<div class="ajax-progress ajax-progress-throbber"><div class="throbber">&nbsp;</div>${messageMarkup}</div>`;

    this.progress.element = $(throbberMarkup);

    // Append to existing wrapper (from PHP) or insert after element.
    const $wrapper = $element.parent('.c-ajax-button-wrapper');
    if ($wrapper.length) {
      $wrapper.append(this.progress.element);
    } else {
      $element.after(this.progress.element);
    }
  };

  /**
   * Override success: clean up loading state, then call original.
   *
   * @param {Array} response - Array of AJAX command objects returned from the server.
   * @param {string} status - HTTP status text (e.g., 'success').
   */
  Drupal.Ajax.prototype.success = function (response, status) {
    stopLoading(this);
    return originalSuccess.call(this, response, status);
  };

  /**
   * Override error: clean up loading state, then call original.
   *
   * @param {XMLHttpRequest} xmlhttprequest - The XMLHttpRequest object.
   * @param {string} uri - The URI that was requested.
   * @param {string} customMessage - Custom error message to display.
   */
  Drupal.Ajax.prototype.error = function (xmlhttprequest, uri, customMessage) {
    stopLoading(this);
    return originalError.call(this, xmlhttprequest, uri, customMessage);
  };
})(Drupal, jQuery);
