/**
 * @file
 * Client-side Form Validation.
 *
 * Provides client-side form validation using the JustValidate library,
 * replacing native HTML5 browser validation bubbles with custom, themable
 * error messages integrated into Drupal's translation system.
 *
 * Third-party library: JustValidate v4
 *   Install : composer require npm-asset/just-validate
 *   Docs    : https://just-validate.dev/
 *   GitHub  : https://github.com/horprogs/Just-validate
 *
 * How it works in this theme:
 *
 *   1. Disables native HTML5 validation (adds `novalidate` to `.c-form`).
 *   2. Auto-discovers form fields that carry HTML5 validation attributes
 *      (required, type="email", type="url", type="number", pattern,
 *       min, max, minlength, maxlength).
 *   3. Maps each attribute to a JustValidate rule and provides the error
 *      message through Drupal.t() so every string is translatable via
 *      Drupal's standard interface (/admin/config/regional/translate).
 *   4. Validates on blur (before the first submit) and on form submission.
 *   5. On submit failure, scrolls to the topmost invalid field.
 *   6. Applies CSS classes:
 *        - .is-error / .is-success  on the field element
 *        - .has-error / .has-success on the parent .c-form-item wrapper
 *
 * Configuration (settings/settings.forms.yml):
 *   validation:
 *     enabled: false        # Global toggle (true = ON, forms = exclusions)
 *     forms:
 *       - my_form_id        # Include these when enabled: false
 *
 * Auto-attached when enabled for the form.
 *
 * @param {object} Drupal - The Drupal object.
 * @param {object} once - The once utility.
 */

/* global JustValidate */

((Drupal, once) => {
  'use strict';

  /**
   * Translatable validation messages.
   *
   * Every string passes through Drupal.t() so it can be translated via
   * the standard Drupal interface or .po files.
   */
  const messages = {
    required: Drupal.t('This field is required.'),
    email: Drupal.t('Please enter a valid email address.'),
    url: Drupal.t('Please enter a valid URL.'),
    number: Drupal.t('Please enter a valid number.'),
    tel: Drupal.t('Please enter a valid phone number.'),
    date: Drupal.t(
      'Please enter a valid date (year must be 4 digits or fewer).'
    ),
    minLength: Drupal.t('This value is too short.'),
    minNumber: Drupal.t('The value is too low.'),
    maxNumber: Drupal.t('The value is too high.'),
    pattern: Drupal.t('Please match the requested format.'),
    minChecked: Drupal.t('Please select at least one option.')
  };

  /**
   * Build JustValidate rules from a field's HTML5 validation attributes.
   *
   * @param {HTMLElement} field
   *   The form field element (input, select, or textarea).
   *
   * @return {Array}
   *   An array of JustValidate rule objects.
   */
  function buildRules(field) {
    const rules = [];
    const type = (field.getAttribute('type') || '').toLowerCase();

    // Required.
    if (field.hasAttribute('required')) {
      if (type === 'file') {
        // JustValidate returns elem.files (FileList) for file inputs.
        // An empty FileList is truthy, so the built-in 'required' rule
        // always passes. Use a custom validator to check files.length.
        rules.push({
          validator: (value) => value && value.length > 0,
          errorMessage: messages.required
        });
      } else {
        rules.push({
          rule: 'required',
          errorMessage: messages.required
        });
      }
    }

    // Email type.
    if (type === 'email') {
      rules.push({
        rule: 'email',
        errorMessage: messages.email
      });
    }

    // Number type.
    if (type === 'number') {
      rules.push({
        rule: 'number',
        errorMessage: messages.number
      });
    }

    // Date / datetime-local type: the value is always ISO format
    // (YYYY-MM-DD or YYYY-MM-DDTHH:MM). Reject years longer than
    // 4 digits — practically a typo, not a valid date.
    if (type === 'date' || type === 'datetime-local') {
      rules.push({
        rule: 'customRegexp',
        value: /^\d{1,4}-/,
        errorMessage: messages.date
      });
    }

    // Phone type: optional leading +, at least 5 digits, with
    // formatting characters (-, space, parens, dot, #) in between.
    if (type === 'tel') {
      rules.push({
        rule: 'customRegexp',
        value: /^\+?([-()\s.#]*\d){5,}[-()\s.#]*$/,
        errorMessage: messages.tel
      });
    }

    // URL type.
    if (type === 'url') {
      rules.push({
        rule: 'customRegexp',
        value: /^https?:\/\/.+/,
        errorMessage: messages.url
      });
    }

    // minlength.
    if (field.hasAttribute('minlength')) {
      const val = parseInt(field.getAttribute('minlength'), 10);
      if (!isNaN(val)) {
        rules.push({
          rule: 'minLength',
          value: val,
          errorMessage: Drupal.t('Must be at least @count characters.', {
            '@count': val
          })
        });
      }
    }

    // min (for number, range, date, etc.).
    if (field.hasAttribute('min') && (type === 'number' || type === 'range')) {
      const val = parseFloat(field.getAttribute('min'));
      if (!isNaN(val)) {
        rules.push({
          rule: 'minNumber',
          value: val,
          errorMessage: Drupal.t('Value must be at least @min.', {
            '@min': val
          })
        });
      }
    }

    // max (for number, range, date, etc.).
    if (field.hasAttribute('max') && (type === 'number' || type === 'range')) {
      const val = parseFloat(field.getAttribute('max'));
      if (!isNaN(val)) {
        rules.push({
          rule: 'maxNumber',
          value: val,
          errorMessage: Drupal.t('Value must be no more than @max.', {
            '@max': val
          })
        });
      }
    }

    // pattern.
    if (field.hasAttribute('pattern')) {
      const pat = field.getAttribute('pattern');
      rules.push({
        rule: 'customRegexp',
        value: new RegExp(pat),
        errorMessage: field.getAttribute('title') || messages.pattern
      });
    }

    return rules;
  }

  /**
   * Scroll smoothly to the topmost invalid field.
   *
   * @param {HTMLFormElement} form
   *   The form element.
   * @param {object} fields
   *   JustValidate fields state object from onFail callback.
   */
  function scrollToFirstError(form, fields) {
    let topElement = null;
    let topOffset = Infinity;

    Object.keys(fields).forEach((selector) => {
      if (!fields[selector].isValid) {
        const el = form.querySelector(selector);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < topOffset) {
            topOffset = rect.top;
            topElement = el;
          }
        }
      }
    });

    if (topElement) {
      topElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      topElement.focus();
    }
  }

  /**
   * Initialize JustValidate on a form.
   *
   * Called lazily on first user interaction — not on page load.
   *
   * @param {HTMLFormElement} form
   *   The form element to initialize validation on.
   */
  function initValidator(form) {
    // Guard: don't initialize twice.
    if (form._justValidateInit) {
      return;
    }
    form._justValidateInit = true;

    const validator = new JustValidate(form, {
      errorFieldStyle: {},
      successFieldStyle: {},
      errorLabelCssClass: ['c-form-item__error-message'],
      errorLabelStyle: {},
      focusInvalidField: false,
      validateBeforeSubmitting: true
    });

    // Discover and register validatable fields.
    const validatedFields = discoverFields(form, validator);

    // Discover required checkbox/radio groups.
    discoverRequiredGroups(form, validator);

    // Blur handler: revalidate on blur so errors show before submit.
    validatedFields.forEach(({ selector }) => {
      const el = form.querySelector(selector);
      if (el) {
        el.addEventListener('blur', () => {
          validator.revalidateField(selector);
        });
      }
    });

    // On submit failure: scroll to first error.
    validator.onFail((fields) => scrollToFirstError(form, fields));
  }

  /**
   * Drupal behavior: prepare forms for lazy validation.
   *
   * On page load, only disables native HTML5 validation and adds a
   * lightweight focusin listener. JustValidate is initialized on the
   * first user interaction (focus or submit), not on page load.
   */
  Drupal.behaviors.formValidation = {
    attach(context) {
      once('just-validate', '.c-form', context).forEach((form) => {
        // Disable native HTML5 validation immediately.
        form.setAttribute('novalidate', '');

        // Initialize on first field focus (bubbles from any child).
        form.addEventListener('focusin', () => initValidator(form), {
          once: true
        });

        // Also initialize on submit in case user submits without
        // focusing a field first (e.g. keyboard Enter on a button).
        form.addEventListener(
          'submit',
          (e) => {
            if (!form._justValidateInit) {
              e.preventDefault();
              initValidator(form);
              // Re-trigger submit so JustValidate can intercept it.
              form.requestSubmit();
            }
          },
          { once: true }
        );
      });
    }
  };

  /**
   * Discover all validatable fields in a form and register them.
   *
   * @param {HTMLFormElement} form
   *   The form element.
   * @param {JustValidate} validator
   *   The JustValidate instance.
   *
   * @return {Array}
   *   Array of { selector, field } objects for each registered field.
   */
  function discoverFields(form, validator) {
    const registered = [];
    const fields = form.querySelectorAll('input, select, textarea');

    fields.forEach((field) => {
      // Skip fields that can't or shouldn't be validated.
      if (
        !field.id ||
        field.type === 'hidden' ||
        field.type === 'submit' ||
        field.type === 'button' ||
        field.type === 'reset' ||
        field.disabled
      ) {
        return;
      }

      const rules = buildRules(field);
      if (rules.length === 0) {
        return;
      }

      const selector = `#${CSS.escape(field.id)}`;
      const config = {};

      // Place error message inside the .c-form-item parent so it
      // appears at the end of the form item, below the input.
      const formItem = field.closest('.c-form-item');
      if (formItem) {
        config.errorsContainer = formItem;
      }

      validator.addField(selector, rules, config);
      registered.push({ selector, field });
    });

    return registered;
  }

  /**
   * Discover required checkbox/radio groups and register them.
   *
   * Drupal does not add the `required` attribute to individual checkboxes
   * or radios in a group. Instead, the group label receives the
   * `.js-form-required` class. This function finds those groups and
   * uses JustValidate's addRequiredGroup() to validate that at least
   * one option is selected.
   *
   * @param {HTMLFormElement} form
   *   The form element.
   * @param {JustValidate} validator
   *   The JustValidate instance.
   */
  function discoverRequiredGroups(form, validator) {
    const groups = form.querySelectorAll('.c-form-boolean-group');

    groups.forEach((group) => {
      if (!group.id) {
        return;
      }

      // Check if the parent form-item's label has the required marker.
      const formItem = group.closest('.c-form-item');
      if (!formItem) {
        return;
      }

      const label = formItem.querySelector('.js-form-required');
      if (!label) {
        return;
      }

      const selector = `#${CSS.escape(group.id)}`;
      const config = {
        // Workaround: JustValidate's clearErrors() nests classList.remove
        // inside Object.keys(style).forEach(). With an empty style object
        // the loop never runs and error/success classes are never removed.
        // Providing a dummy key ensures the cleanup executes. The inputs
        // are visually hidden so there is no visual side-effect.
        errorFieldStyle: { color: '' },
        successFieldStyle: { color: '' }
      };

      if (formItem) {
        config.errorsContainer = formItem;
      }

      validator.addRequiredGroup(selector, messages.minChecked, config);
    });
  }
})(Drupal, once);
