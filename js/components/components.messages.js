/**
 * @file
 * Messages Component.
 *
 * Adds close button functionality to Drupal's system messages.
 *
 * @param {Drupal} Drupal - Drupal object.
 * @param {once} once - Once object.
 */

((Drupal, once) => {
  /**
   * Attaches click handler to close button.
   *
   * @param {HTMLElement} message
   *   The message element.
   */
  const initCloseButton = (message) => {
    const closeBtn = message.querySelector('.c-messages__close');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        message.classList.add('is-closing');
        message.addEventListener(
          'animationend',
          () => {
            message.classList.add('is-hidden');
          },
          { once: true }
        );
      });
    }
  };

  /**
   * Attaches close button behavior for messages.
   */
  Drupal.behaviors.brainsumStarterkitMessages = {
    attach(context) {
      once('messages', '[data-drupal-selector="messages"]', context).forEach(
        initCloseButton
      );
    }
  };
})(Drupal, once);
