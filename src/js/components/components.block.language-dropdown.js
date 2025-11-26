/**
 * @file
 * Language Dropdown Component.
 *
 * Override dropdown_language_selector.js for:
 * - no jQuery dependency
 * - active class change
 * - added aria-extended attribute
 *
 * @param {object} Drupal Drupal object
 * @param {object} once Once object
 */

((Drupal, once) => {
  const init = (el) => {
    const icon = el.querySelector('.c-dropbutton__icon');
    const dropdown = el.querySelector('.dropdown');
    const activeLanguage = el.querySelector('.active-language');

    activeLanguage.setAttribute('aria-expanded', 'true');

    const dropdownHandling = (e) => {
      const wrapper = e.currentTarget.closest('.c-dropbutton__wrapper');

      if (typeof wrapper !== 'undefined' && wrapper !== null) {
        e.preventDefault();
        e.stopPropagation();

        if (!wrapper.classList.contains('is-active')) {
          activeLanguage.setAttribute('aria-expanded', 'true');
          icon.setAttribute('aria-expanded', 'true');
          wrapper.classList.add('is-active');
          dropdown.classList.add('is-active');
        } else {
          activeLanguage.setAttribute('aria-expanded', 'false');
          icon.setAttribute('aria-expanded', 'false');
          wrapper.classList.remove('is-active');
          dropdown.classList.remove('is-active');
        }

        document.addEventListener('click', () => {
          el.setAttribute('aria-expanded', 'false');
          wrapper.classList.remove('is-active');
          dropdown.classList.remove('is-active');
        });

        dropdown.addEventListener('click', (event) => {
          event.stopPropagation();
        });
      }
    };

    activeLanguage.addEventListener('click', dropdownHandling);
    icon.addEventListener('click', dropdownHandling);
  };

  Drupal.behaviors.brainsumStarterkitLanguageDropdown = {
    attach(context) {
      const languageBlock = once(
        'languageDropdown',
        '[data-drupal-selector="block-dropdown-language"]',
        context
      );

      if (languageBlock) {
        context
          .querySelectorAll(
            '.js-block-dropdown-language .c-dropbutton__wrapper'
          )
          .forEach((el) => init(el));
      }
    }
  };
})(Drupal, once);
