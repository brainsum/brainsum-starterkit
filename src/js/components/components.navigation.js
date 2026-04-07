/**
 * @file
 * Navigation Component.
 *
 * Accessible navigation with:
 * - Mobile hamburger menu with focus trapping
 * - Desktop dropdown submenus with smooth animations
 * - Full keyboard navigation (Arrow keys, Escape, Tab)
 * - Click-outside to close dropdowns
 * - Responsive resize handling
 *
 * @param {object} Drupal Drupal object
 * @param {object} once Once object
 */

((Drupal, once) => {
  const activeClass = 'is-active';
  const openClass = 'is-open';

  /**
   * Read navigation breakpoint from CSS custom property (--navigation-breakpoint)
   * defined on .c-header__navigation, so CSS and JS stay in sync.
   * @return {MediaQueryList} A matchMedia object for the navigation breakpoint.
   */
  const getNavMediaQuery = () => {
    const nav = document.querySelector(
      '[data-drupal-selector="header__navigation"]'
    );

    if (!nav) {
      Drupal.throwError(
        new Error(
          'Navigation: [data-drupal-selector="header__navigation"] element not found.'
        )
      );
      return window.matchMedia('(min-width: 0)');
    }

    const breakpoint = getComputedStyle(nav)
      .getPropertyValue('--navigation-breakpoint')
      .trim();

    if (!breakpoint) {
      Drupal.throwError(
        new Error(
          'Navigation: --navigation-breakpoint CSS custom property is not defined.'
        )
      );
      return window.matchMedia('(min-width: 0)');
    }

    return window.matchMedia(`(min-width: ${breakpoint})`);
  };

  let navMediaQuery = null;

  /**
   * Check if we're on desktop viewport
   * @return {boolean} True if viewport is at or above navigation breakpoint.
   */
  const isDesktop = () => (navMediaQuery ? navMediaQuery.matches : false);

  /**
   * Initialize navigation
   * @param {HTMLElement} header The header element.
   */
  const initNavigation = (header) => {
    const hamburger = header.querySelector('.c-hamburger');
    const mainNav = document.querySelector(
      '[data-drupal-selector="header__navigation"]'
    );

    // Read breakpoint from CSS custom property — single source of truth
    navMediaQuery = getNavMediaQuery();

    /**
     * Mobile Menu Functions
     */

    /**
     * Get all focusable elements in mobile menu
     * @return {HTMLElement[]} Array of focusable elements.
     */
    const getMobileMenuFocusableElements = () => {
      const focusableSelectors =
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(mainNav.querySelectorAll(focusableSelectors)).filter(
        (el) => el.offsetParent !== null
      );
    };

    /**
     * Open mobile menu
     */
    const openMobileMenu = () => {
      hamburger.classList.add(activeClass);
      hamburger.setAttribute('aria-expanded', 'true');
      mainNav.classList.add(activeClass);
      document.body.classList.add('has-mobile-menu-open');

      // Focus first menu item after menu opens
      requestAnimationFrame(() => {
        const focusableElements = getMobileMenuFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      });
    };

    /**
     * Close mobile menu
     */
    const closeMobileMenu = () => {
      hamburger.classList.remove(activeClass);
      hamburger.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove(activeClass);
      document.body.classList.remove('has-mobile-menu-open');

      closeAllDropdowns();
    };

    /**
     * Toggle mobile menu
     */
    const toggleMobileMenu = () => {
      if (hamburger.classList.contains(activeClass)) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    };

    /**
     * Dropdown Functions
     */

    /**
     * Animate submenu height for mobile accordion
     * @param {HTMLElement} submenu The submenu element.
     * @param {number} startHeight Starting height in px.
     * @param {number} endHeight Ending height in px.
     */
    const animateHeight = (submenu, startHeight, endHeight) => {
      submenu.style.height = `${startHeight}px`;
      // Force reflow so the browser registers the start value
      void submenu.offsetHeight;
      submenu.style.height = `${endHeight}px`;

      const onTransitionEnd = () => {
        submenu.removeEventListener('transitionend', onTransitionEnd);
        if (endHeight > 0) {
          submenu.style.height = 'auto';
        }
      };

      submenu.addEventListener('transitionend', onTransitionEnd);
    };

    /**
     * Open a dropdown
     * @param {HTMLElement} button The toggle button element.
     */
    const openDropdown = (button) => {
      const menuItem = button.parentElement;
      const submenu = menuItem.querySelector('.c-menu--level-2');

      button.classList.add(openClass);
      button.setAttribute('aria-expanded', 'true');
      button.removeAttribute('aria-hidden');
      button.removeAttribute('tabindex');
      menuItem.classList.add(openClass);

      if (submenu) {
        submenu.classList.add(openClass);

        // Mobile: animate to measured height
        if (!isDesktop()) {
          // Temporarily set auto to measure
          submenu.style.height = 'auto';
          const fullHeight = submenu.offsetHeight;
          submenu.style.height = '0px';
          animateHeight(submenu, 0, fullHeight);
        }
      }
    };

    /**
     * Close a dropdown
     * @param {HTMLElement} button The toggle button element.
     */
    const closeDropdown = (button) => {
      const menuItem = button.parentElement;
      const submenu = menuItem.querySelector('.c-menu--level-2');

      button.classList.remove(openClass);
      button.setAttribute('aria-expanded', 'false');
      menuItem.classList.remove(openClass);

      if (submenu) {
        // Mobile: animate from current height to 0
        if (!isDesktop()) {
          const currentHeight = submenu.offsetHeight;
          animateHeight(submenu, currentHeight, 0);
        }

        submenu.classList.remove(openClass);
      }
    };

    /**
     * Close all open dropdowns
     * @param {HTMLElement|null} except Optional element to exclude from closing.
     */
    const closeAllDropdowns = (except = null) => {
      const buttons = document.querySelectorAll(
        '[data-drupal-selector="menu__submenu-toggle-button"]'
      );
      buttons.forEach((btn) => {
        if (btn !== except && btn.classList.contains(openClass)) {
          closeDropdown(btn);
        }
      });
    };

    /**
     * Event Handlers
     */

    /**
     * Toggle dropdown on button click (desktop only)
     * @param {Event} e The click event.
     */
    const handleToggleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const button = e.currentTarget;
      const isOpen = button.classList.contains(openClass);

      // Close other dropdowns first (accordion behavior)
      closeAllDropdowns(button);

      if (isOpen) {
        closeDropdown(button);
      } else {
        openDropdown(button);
      }
    };

    /**
     * Handle keyboard navigation on toggle buttons
     * @param {KeyboardEvent} e The keyboard event.
     */
    const handleButtonKeydown = (e) => {
      if (!isDesktop()) {
        return;
      }

      const button = e.currentTarget;
      const menuItem = button.parentElement;
      const submenu = menuItem.querySelector('.c-menu--level-2');
      const isOpen = button.classList.contains(openClass);

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen) {
            closeDropdown(button);
          } else {
            closeAllDropdowns(button);
            openDropdown(button);
            const firstLink = submenu?.querySelector('.c-menu__link');
            if (firstLink) {
              firstLink.focus();
            }
          }
          break;

        case 'Escape':
          if (isOpen) {
            e.preventDefault();
            closeDropdown(button);
            button.focus();
          }
          break;

        case 'ArrowDown':
          if (isOpen && submenu) {
            e.preventDefault();
            const firstLink = submenu.querySelector('.c-menu__link');
            if (firstLink) {
              firstLink.focus();
            }
          }
          break;

        case 'ArrowUp':
          if (isOpen && submenu) {
            e.preventDefault();
            const links = submenu.querySelectorAll('.c-menu__link');
            if (links.length) {
              links[links.length - 1].focus();
            }
          }
          break;
      }
    };

    /**
     * Handle keyboard navigation within submenu (desktop only)
     * @param {KeyboardEvent} e The keyboard event.
     */
    const handleSubmenuKeydown = (e) => {
      if (!isDesktop()) {
        return;
      }

      const submenu = e.currentTarget;
      const links = Array.from(submenu.querySelectorAll('.c-menu__link'));
      const currentIndex = links.indexOf(document.activeElement);
      const toggleButton = submenu.parentElement.querySelector(
        '[data-drupal-selector="menu__submenu-toggle-button"]'
      );

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          closeDropdown(toggleButton);
          toggleButton.focus();
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < links.length - 1) {
            links[currentIndex + 1].focus();
          } else {
            links[0].focus();
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            links[currentIndex - 1].focus();
          } else {
            links[links.length - 1].focus();
          }
          break;

        case 'Tab':
          if (!e.shiftKey && currentIndex === links.length - 1) {
            closeDropdown(toggleButton);
          }
          if (e.shiftKey && currentIndex === 0) {
            closeDropdown(toggleButton);
          }
          break;
      }
    };

    /**
     * Handle breakpoint change via matchMedia
     * @param {MediaQueryListEvent} e The change event.
     */
    const handleBreakpointChange = (e) => {
      if (e.matches) {
        // Switched to desktop
        closeMobileMenu();
      } else {
        // Switched to mobile
        closeAllDropdowns();
      }
    };

    /**
     * Handle focus trapping in mobile menu
     * @param {KeyboardEvent} e The keyboard event.
     */
    const handleMobileMenuFocusTrap = (e) => {
      if (isDesktop() || !mainNav.classList.contains(activeClass)) {
        return;
      }

      if (e.key !== 'Tab') {
        return;
      }

      const focusableElements = getMobileMenuFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        hamburger.focus();
        return;
      }

      if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        hamburger.focus();
        return;
      }

      if (!e.shiftKey && document.activeElement === hamburger) {
        e.preventDefault();
        firstElement.focus();
        return;
      }

      if (e.shiftKey && document.activeElement === hamburger) {
        e.preventDefault();
        lastElement.focus();
      }
    };

    /**
     * Handle global keydown events
     * @param {KeyboardEvent} e The keyboard event.
     */
    const handleGlobalKeydown = (e) => {
      handleMobileMenuFocusTrap(e);

      if (e.key === 'Escape') {
        if (!isDesktop() && mainNav.classList.contains(activeClass)) {
          closeMobileMenu();
          hamburger.focus();
          return;
        }

        if (isDesktop()) {
          closeAllDropdowns();
        }
      }
    };

    /**
     * Attach Event Listeners
     */
    if (hamburger) {
      hamburger.addEventListener('click', toggleMobileMenu);
    }

    document.addEventListener(
      'click',
      (e) => {
        if (!isDesktop()) return;

        // Don't close if clicking a toggle button or its children (let the button handler deal with it)
        const isToggleButton = e.target.closest(
          '[data-drupal-selector="menu__submenu-toggle-button"]'
        );
        if (isToggleButton) {
          return; // Just return, don't stop propagation
        }

        const isInsideMenu = e.target.closest('.c-menu--main');
        if (!isInsideMenu) {
          closeAllDropdowns();
        }
      },
      true
    );

    document.addEventListener('keydown', handleGlobalKeydown);

    navMediaQuery.addEventListener('change', handleBreakpointChange);

    // Enable transitions now that JS is ready (prevents FOUC)
    mainNav.classList.add('js-ready');

    /**
     * Attach event listeners to toggle buttons
     * @param {NodeList} toggleButtons The toggle button elements
     */
    const attachToggleButtonListeners = (toggleButtons) => {
      toggleButtons.forEach((button) => {
        // Ensure button is visible and interactive
        button.removeAttribute('aria-hidden');
        button.removeAttribute('tabindex');

        button.addEventListener('click', handleToggleClick);

        button.addEventListener('keydown', handleButtonKeydown);

        const submenu = button.parentElement.querySelector('.c-menu--level-2');
        if (submenu) {
          submenu.addEventListener('keydown', handleSubmenuKeydown);
        }
      });
    };

    // Function to find and attach listeners to toggle buttons
    const initToggleButtons = () => {
      const toggleButtons = document.querySelectorAll(
        '[data-drupal-selector="menu__submenu-toggle-button"]'
      );

      if (toggleButtons.length === 0) {
        console.warn(
          'Navigation: No toggle buttons found - menu may not have dropdowns'
        );
        return;
      }

      // Attach listeners to toggle buttons
      attachToggleButtonListeners(toggleButtons);

      // Attach focus listeners to main menu links (level 1)
      // Close all open submenus when focus moves to a main menu item
      // This helps VoiceOver users by closing submenus when navigating to the next main item
      const mainMenuItems = document.querySelectorAll(
        '.c-menu--level-1 > .c-menu__item--level-1'
      );
      mainMenuItems.forEach((item) => {
        const mainLink = item.querySelector(':scope > .c-menu__link');
        if (mainLink) {
          mainLink.addEventListener('focus', () => {
            if (isDesktop()) {
              closeAllDropdowns();
            }
          });
        }
      });
    };

    // Defer toggle button query to next frame to ensure DOM is fully rendered
    requestAnimationFrame(initToggleButtons);
  };

  Drupal.behaviors.brainsumStarterkitNavigation = {
    attach(context) {
      const header = once(
        'navigation',
        '[data-drupal-selector="header"]',
        context
      ).shift();

      if (header) {
        initNavigation(header);
      }
    }
  };
})(Drupal, once);
