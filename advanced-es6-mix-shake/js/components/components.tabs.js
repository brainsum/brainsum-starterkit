"use strict";

/**
 * @file
 * Tabs Component.
 *
 * Better responsive Drupal's administration tab bar.
 *
 * Borrowed from Olivero Theme.
 */
(function (Drupal) {
  function init(el) {
    var tabs = el.querySelector('.tabs');
    var expandedClass = 'is-expanded';
    var activeTab = tabs.querySelector('.is-active');

    function isTabsMobileLayout() {
      return tabs.querySelector('.tabs__trigger').clientHeight > 0;
    }

    function handleTriggerClick(e) {
      if (!tabs.classList.contains(expandedClass)) {
        e.currentTarget.setAttribute('aria-expanded', 'true');
        tabs.classList.add(expandedClass);
      } else {
        e.currentTarget.setAttribute('aria-expanded', 'false');
        tabs.classList.remove(expandedClass);
      }
    }

    if (isTabsMobileLayout() && !activeTab.matches('.tabs__tab:first-child')) {
      var newActiveTab = activeTab.cloneNode(true);
      var firstTab = tabs.querySelector('.tabs__tab:first-child');
      tabs.insertBefore(newActiveTab, firstTab);
      tabs.removeChild(activeTab);
    }

    tabs.querySelector('.tabs__trigger').addEventListener('click', handleTriggerClick);
  }

  Drupal.behaviors.starterThemeTabs = {
    attach: function attach(context) {
      context.querySelectorAll('[data-drupal-nav-tabs]').forEach(function (el) {
        return init(el);
      });
    }
  };
})(Drupal);
