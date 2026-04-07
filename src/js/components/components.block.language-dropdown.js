/**
 * @file
 * Language Dropdown Component.
 *
 * Accessible language dropdown:
 * - Toggle with button click
 * - Keyboard navigation (Escape to close, arrow keys)
 * - Close on outside click
 *
 * @param {object} Drupal Drupal object
 * @param {object} once Once object
 */

((Drupal, once) => {
  const openClass = 'is-open';

  /**
   * Initialize language dropdown
   * @param {HTMLElement} block The language dropdown block element.
   */
  const initLanguageDropdown = (block) => {
    const toggleButton = block.querySelector(
      '[data-drupal-selector="language-dropdown-toggle"]'
    );
    const panel = block.querySelector('.c-language-dropdown__panel');

    if (!toggleButton || !panel) {
      return;
    }

    const panelLinks = panel.querySelectorAll('.language-link');

    /**
     * Open the dropdown
     */
    const openDropdown = () => {
      toggleButton.classList.add(openClass);
      toggleButton.setAttribute('aria-expanded', 'true');
      panel.classList.add(openClass);
    };

    /**
     * Close the dropdown
     */
    const closeDropdown = () => {
      toggleButton.classList.remove(openClass);
      toggleButton.setAttribute('aria-expanded', 'false');
      panel.classList.remove(openClass);
    };

    /**
     * Toggle the dropdown
     */
    const toggleDropdown = () => {
      if (toggleButton.classList.contains(openClass)) {
        closeDropdown();
      } else {
        openDropdown();
      }
    };

    /**
     * Handle toggle button click
     * @param {Event} e The click event.
     */
    const handleToggleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown();
    };

    /**
     * Handle keyboard navigation on toggle button
     * @param {KeyboardEvent} e The keyboard event.
     */
    const handleToggleKeydown = (e) => {
      const isOpen = toggleButton.classList.contains(openClass);

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          toggleDropdown();
          // Focus first link when opening
          if (!isOpen && panelLinks.length > 0) {
            requestAnimationFrame(() => panelLinks[0].focus());
          }
          break;

        case 'Escape':
          if (isOpen) {
            e.preventDefault();
            closeDropdown();
            toggleButton.focus();
          }
          break;

        case 'ArrowDown':
          if (isOpen && panelLinks.length > 0) {
            e.preventDefault();
            panelLinks[0].focus();
          }
          break;

        case 'ArrowUp':
          if (isOpen && panelLinks.length > 0) {
            e.preventDefault();
            panelLinks[panelLinks.length - 1].focus();
          }
          break;
      }
    };

    /**
     * Handle keyboard navigation within dropdown panel
     * @param {KeyboardEvent} e The keyboard event.
     */
    const handlePanelKeydown = (e) => {
      const links = Array.from(panelLinks);
      const currentIndex = links.indexOf(document.activeElement);

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          closeDropdown();
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
            closeDropdown();
          }
          if (e.shiftKey && currentIndex === 0) {
            closeDropdown();
          }
          break;
      }
    };

    /**
     * Handle click outside to close dropdown
     * @param {Event} e The click event.
     */
    const handleOutsideClick = (e) => {
      const isInsideDropdown = e.target.closest('.c-language-dropdown');
      if (!isInsideDropdown && toggleButton.classList.contains(openClass)) {
        closeDropdown();
      }
    };

    /**
     * Handle global Escape key
     * @param {KeyboardEvent} e The keyboard event.
     */
    const handleGlobalKeydown = (e) => {
      if (e.key === 'Escape' && toggleButton.classList.contains(openClass)) {
        closeDropdown();
        toggleButton.focus();
      }
    };

    // Set role="menuitem" on panel links for proper ARIA semantics
    panelLinks.forEach((link) => {
      link.setAttribute('role', 'menuitem');
    });

    toggleButton.addEventListener('click', handleToggleClick);
    toggleButton.addEventListener('keydown', handleToggleKeydown);
    panel.addEventListener('keydown', handlePanelKeydown);
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleGlobalKeydown);
  };

  Drupal.behaviors.brainsumStarterkitLanguageDropdown = {
    attach(context) {
      // Target the toggle button directly to avoid issues with contextual links
      // wrapping the block for admin users
      const toggleButtons = once(
        'languageDropdownToggle',
        '[data-drupal-selector="language-dropdown-toggle"]',
        context
      );

      if (toggleButtons.length) {
        toggleButtons.forEach((toggleButton) => {
          // Find the parent block by traversing up
          const block =
            toggleButton.closest(
              '[data-drupal-selector="block-dropdown-language"]'
            ) ||
            toggleButton.closest('.c-block-dropdown-language') ||
            toggleButton.closest('.c-language-dropdown')?.parentElement;

          if (block) {
            initLanguageDropdown(block);
          }
        });
      }
    }
  };
})(Drupal, once);
