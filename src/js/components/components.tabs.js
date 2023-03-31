/**
 * @file
 * Tabs Component.
 *
 * Better responsive Drupal's administration tab bar.
 *
 * Borrowed from Olivero Theme.
 */

((Drupal, once) => {
  /**
   * Initialize the primary tabs.
   *
   * @param { HTMLElement } el
    * The DOM element containing the primary tabs.
   */
  function init(el) {
    const tabs = el.querySelector('.c-tabs');
    const expandedClass = 'is-expanded';
    const activeTab = tabs.querySelector('.is-active');

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
      const newActiveTab = activeTab.cloneNode(true);
      const firstTab = tabs.querySelector('.c-tabs__tab:first-child');
      tabs.insertBefore(newActiveTab, firstTab);
      tabs.removeChild(activeTab);
    }

    tabs
      .querySelector('.c-tabs__trigger')
      .addEventListener('click', handleTriggerClick);
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
    attach(context) {
      once('tabs', '[data-drupal-nav-primary-tabs]', context)
        .forEach(
          init,
        );
    },
  };
})(Drupal, once);
