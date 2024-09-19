/**
 * @file
 * Messages Component.
 *
 * Add some interactions to Drupal's system messages.
 *
 * Borrowed from Olivero Theme.
 */

((Drupal, once) => {
  /**
   * brainsumStarterkit helper functions.
   * @namespace
   */
  Drupal.brainsumStarterkit = {};
  /**
   * Adds a close button to the message.
   *
   * @param {object} message
   *   The message object.
   */
  const closeMessage = (message) => {
    const messageContainer = message.querySelector(
      '[data-drupal-selector="messages-container"]'
    );
    if (!messageContainer.querySelector('.c-messages__button')) {
      const closeBtnWrapper = document.createElement('div');
      closeBtnWrapper.setAttribute('class', 'c-messages__button');

      const closeBtn = document.createElement('button');
      closeBtn.setAttribute('type', 'button');
      closeBtn.setAttribute('class', 'c-messages__close');

      const closeBtnText = document.createElement('span');
      closeBtnText.setAttribute('class', 'u-visually-hide');
      closeBtnText.innerText = Drupal.t('Close message');

      messageContainer.appendChild(closeBtnWrapper);
      closeBtnWrapper.appendChild(closeBtn);
      closeBtn.appendChild(closeBtnText);

      closeBtn.addEventListener('click', () => {
        message.classList.add('is-hidden');
      });
    }
  };

  /**
   * Get messages from context.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the close button behavior for messages.
   */
  Drupal.behaviors.brainsumStarterkitMessages = {
    attach(context) {
      once('messages', '[data-drupal-selector="messages"]', context).forEach(
        closeMessage
      );
    }
  };

  Drupal.brainsumStarterkit.closeMessage = closeMessage;
})(Drupal, once);
