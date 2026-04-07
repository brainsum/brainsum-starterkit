/**
 * @file
 * Header Component.
 *
 * Auto-hide sticky header functionality.
 * Hides header when scrolling down, shows when scrolling up.
 *
 * @param {object} Drupal Drupal object
 * @param {object} once Once object
 */

((Drupal, once) => {
  /**
   * Initialize auto-hide header
   * @param {HTMLElement} header The header element.
   */
  const initAutoHideHeader = (header) => {
    // Tracks previous scroll position to determine scroll direction
    let lastScrollTop = 0;

    // Minimum scroll distance (px) to trigger hide/show - increase for less sensitivity, decrease for more
    const scrollThreshold = 20;

    /**
     * Debounce function to limit scroll event frequency
     * @param {Function} func Function to debounce
     * @param {number} wait Wait time in milliseconds
     * @return {Function} Debounced function
     */
    function debounce(func, wait) {
      let timeout;
      return function debounceFunction(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
      };
    }

    /**
     * Handle scroll events
     */
    function onScroll() {
      let currentScrollTop = document.documentElement.scrollTop;

      // Prevent negative scroll (iOS bouncing)
      currentScrollTop = Math.max(0, currentScrollTop);

      // Only react if scroll distance exceeds threshold
      if (Math.abs(currentScrollTop - lastScrollTop) <= scrollThreshold) {
        return;
      }

      const isScrollingDown = currentScrollTop > lastScrollTop;
      const isHeaderVisible = currentScrollTop < header.offsetHeight;

      // Hide header when scrolling down (but not if we're at the top)
      header.classList.toggle('is-hidden', isScrollingDown && !isHeaderVisible);

      // Add fixed state when scrolled past header height
      header.classList.toggle(
        'is-fixed',
        !isHeaderVisible && currentScrollTop > 0
      );

      // Add body class for layout adjustments
      document.body.classList.toggle(
        'has-fixed-header',
        !isHeaderVisible && currentScrollTop > 0
      );

      lastScrollTop = currentScrollTop;
    }

    // Attach debounced scroll listener (16ms ≈ 60fps)
    document.addEventListener('scroll', debounce(onScroll, 16));
  };

  Drupal.behaviors.brainsumStarterkitHeader = {
    attach(context) {
      const headers = once(
        'auto-hide-header',
        '.c-header.is-sticky--auto-hide',
        context
      );

      headers.forEach((header) => {
        initAutoHideHeader(header);
      });
    }
  };
})(Drupal, once);
