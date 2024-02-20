/**
 * @file
 * Table Wrapper Component.
 */

(function (Drupal, once) {
  var init = function init(el) {
    var wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'c-table__wrapper');
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  };
  Drupal.behaviors.brainsumStarterkitTableWrapper = {
    attach: function attach(context) {
      var content = once('[data-drupal-selector="text-formatted"]', context);
      if (content) {
        context.querySelectorAll('table').forEach(function (el) {
          return init(el);
        });
      }
    }
  };
})(Drupal, once);