"use strict";

/**
 * @file
 * Tabs Component.
 *
 * Better responsive Drupal's administration tab bar.
 *
 * Borrowed from Olivero Theme.
 */

/* global once */

(function (Drupal, once) {
  /**
   * Initialize the primary tabs.
   *
   * @param { HTMLElement } el
    * The DOM element containing the primary tabs.
   */
  function init(el) {
    var tabs = el.querySelector('.c-tabs');
    var expandedClass = 'is-expanded';
    var activeTab = tabs.querySelector('.is-active');

    /**
     * Determines if primary tabs are expanded for mobile layouts.
     *
     * @return { boolean }
      * Whether the tabs trigger element is expanded.
     */
    function isTabsMobileLayout() {
      return tabs.querySelector('.c-tabs__trigger').clientHeight > 0;
    }

    /**
     * Controls primary tab visibility on click events.
     *
     * @param {Event} e
     *   The event object.
     */
    function handleTriggerClick(e) {
      if (!tabs.classList.contains(expandedClass)) {
        e.currentTarget.setAttribute('aria-expanded', 'true');
        tabs.classList.add(expandedClass);
      } else {
        e.currentTarget.setAttribute('aria-expanded', 'false');
        tabs.classList.remove(expandedClass);
      }
    }
    if (isTabsMobileLayout() && !activeTab.matches('.c-tabs__tab:first-child')) {
      var newActiveTab = activeTab.cloneNode(true);
      var firstTab = tabs.querySelector('.c-tabs__tab:first-child');
      tabs.insertBefore(newActiveTab, firstTab);
      tabs.removeChild(activeTab);
    }
    tabs.querySelector('.c-tabs__trigger').addEventListener('click', handleTriggerClick);
  }

  /**
   * Initialize the primary tabs.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Display primary tabs according to the screen width.
   */
  Drupal.behaviors.brainsumStarterkitTabs = {
    attach: function attach(context) {
      once('starter_theme-tabs', '[data-drupal-nav-primary-tabs]', context).forEach(init);
    }
  };
})(Drupal, once);