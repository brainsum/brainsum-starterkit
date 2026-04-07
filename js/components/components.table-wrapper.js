/**
 * @file
 * Table Wrapper Component.
 *
 * @param {object} Drupal Drupal object
 * @param {object} once Once object
 */

((Drupal, once) => {
  const init = (el) => {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'c-table__wrapper');
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  };

  Drupal.behaviors.brainsumStarterkitTableWrapper = {
    attach(context) {
      once(
        'formattedText',
        '[data-drupal-selector="text-formatted"]',
        context
      ).forEach((field) => {
        const tables = field.querySelectorAll('table');
        if (tables.length) {
          tables.forEach((el) => init(el));
        }
      });
    }
  };
})(Drupal, once);
