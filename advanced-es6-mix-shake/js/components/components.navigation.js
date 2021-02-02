/**
 * @file
 * Navigation Component.
 */
(function (Drupal) {
  function init(el) {
    var mainNav = document.querySelector('#block-starter_theme-main-menu');
    var parentItem = document.querySelectorAll('.c-menu__item--has-children');
    var activeClass = 'is-active';
    /**
     * Toggling mobile menu with hamburger icon
     * @param {object} e The Event object.
     */

    function mobileMenu(e) {
      if (!e.currentTarget.classList.contains(activeClass)) {
        e.currentTarget.classList.add(activeClass);
        e.currentTarget.setAttribute('aria-expanded', 'true');
        mainNav.classList.add(activeClass);
        document.body.classList.add('has-mobile-menu-open');
      } else {
        e.currentTarget.classList.remove(activeClass);
        e.currentTarget.setAttribute('aria-expanded', 'false');
        mainNav.classList.remove(activeClass);
        document.body.classList.remove('has-mobile-menu-open');
      }
    }
    /**
     * Open/close submenus
     * @param {object} e The Event object.
     */


    function dropdown(e) {
      if (!e.currentTarget.classList.contains(activeClass)) {
        e.currentTarget.classList.add(activeClass);
        e.currentTarget.querySelector('ul').classList.add(activeClass);
      } else {
        e.currentTarget.classList.remove(activeClass);
        e.currentTarget.querySelector('ul').classList.remove(activeClass);
      }
    } // activate mobile menu


    el.addEventListener('click', mobileMenu); // activate submenus on mobile

    parentItem.forEach(function (link) {
      return link.addEventListener('click', dropdown);
    });
  }

  Drupal.behaviors.starterThemeNavigation = {
    attach: function attach(context) {
      context.querySelectorAll('.c-hamburger').forEach(function (el) {
        return init(el);
      });
    }
  };
})(Drupal);
