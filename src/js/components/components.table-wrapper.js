/**
 * @file
 * Table Wrapper Component.
 */

((Drupal, once) => {
  const init = (el) => {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'c-table__wrapper');
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  }

  Drupal.behaviors.brainsumStarterkitTableWrapper = {
    attach (context) {
      const content = once('[data-drupal-selector="text-formatted"]', context);

      if (content) {
        context.querySelectorAll('table').forEach((el) => init(el));
      }
      }
    }
})(Drupal, once);
