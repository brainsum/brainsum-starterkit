"use strict";

/**
 * @file
 * Messages Component.
 *
 * Add some interactions to Drupal's system messages.
 *
 * Borrowed from Olivero Theme.
 */

/* global once */

(function (Drupal, once) {
  /**
   * Adds a close button to the message.
   *
   * @param {object} message
   *   The message object.
   */
  var closeMessage = function closeMessage(message) {
    var messageContainer = message.querySelector('[data-drupal-selector="messages-container"]');
    var closeBtnWrapper = document.createElement('div');
    closeBtnWrapper.setAttribute('class', 'c-messages__button');
    var closeBtn = document.createElement('button');
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('class', 'c-messages__close');
    var closeBtnText = document.createElement('span');
    closeBtnText.setAttribute('class', 'u-visually-hide');
    closeBtnText.innerText = Drupal.t('Close message');
    messageContainer.appendChild(closeBtnWrapper);
    closeBtnWrapper.appendChild(closeBtn);
    closeBtn.appendChild(closeBtnText);
    closeBtn.addEventListener('click', function () {
      message.classList.add('is-hidden');
    });
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
    attach: function attach(context) {
      once('messages', '[data-drupal-selector="messages"]', context).forEach(closeMessage);
    }
  };

  // Drupal.olivero.closeMessage = closeMessage;
})(Drupal, once);