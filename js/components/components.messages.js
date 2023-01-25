"use strict";

/**
 * @file
 * Messages Component.
 *
 * Add some interactions to Drupal's system messages.
 *
 * Borrowed from Olivero Theme.
 */

(function (Drupal) {
  var messages = document.querySelectorAll('.c-messages');
  messages.forEach(function (el) {
    var messageContainer = el.querySelector('.c-messages__container');
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
      el.classList.add('is-hidden');
    });
  });
})(Drupal);