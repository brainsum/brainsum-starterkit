"use strict";

/**
 * @file
 * Language Dropdown Component.
 *
 * Override dropdown_language_selector.js for:
 * - no jQuery dependency
 * - active class change
 * - added aria-extended attribute
 */

(function (Drupal, once) {
  var init = function init(el) {
    var icon = el.querySelector('.c-dropbutton__icon');
    var dropdown = el.querySelector('.dropdown');
    var activeLanguage = el.querySelector('.active-language');
    activeLanguage.setAttribute('aria-expanded', 'true');
    var dropdownHandling = function dropdownHandling(e) {
      var wrapper = e.currentTarget.closest('.c-dropbutton__wrapper');
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
        document.addEventListener('click', function () {
          el.setAttribute('aria-expanded', 'false');
          wrapper.classList.remove('is-active');
          dropdown.classList.remove('is-active');
        });
        dropdown.addEventListener('click', function (event) {
          event.stopPropagation();
        });
      }
    };
    activeLanguage.addEventListener('click', dropdownHandling);
    icon.addEventListener('click', dropdownHandling);
  };
  Drupal.behaviors.brainsumStarterkitLanguageDropdown = {
    attach: function attach(context) {
      var languageBlock = once('languageDropdown', '[data-drupal-selector="block-dropdown-language"]', context);
      if (languageBlock) {
        context.querySelectorAll('.js-block-dropdown-language .c-dropbutton__wrapper').forEach(function (el) {
          return init(el);
        });
      }
    }
  };
})(Drupal, once);