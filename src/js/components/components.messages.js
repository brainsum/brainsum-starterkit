/**
 * @file
 * Messages Component.
 *
 * Add some interactions to Drupal's system messages.
 *
 * Borrowed from Olivero Theme.
 */

((Drupal) => {
  const messages = document.querySelectorAll('.c-messages');

  messages.forEach((el) => {
    const messageContainer = el.querySelector('.c-messages__container');

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
      el.classList.add('is-hidden');
    });
  });
})(Drupal);
