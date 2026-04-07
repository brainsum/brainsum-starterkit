/**
 * @file
 * Drag Scroll Utility.
 *
 * Horizontal drag-to-scroll with mouse and touch support plus momentum/inertia.
 * Vanilla JS port of the Vue useDragScroll composable.
 *
 * Apply `data-drupal-selector="drag-scroll"` to any horizontally-overflowing
 * container and pair it with the `u-drag-scroll` utility class.
 *
 * @example
 * ```html
 * <div class="u-drag-scroll" data-drupal-selector="drag-scroll">
 *   <button>Item 1</button>
 *   <button>Item 2</button>
 *   <button>Item 3</button>
 * </div>
 * ```
 *
 * @param {object} Drupal Drupal object
 * @param {object} once Once object
 */

((Drupal, once) => {
  const DRAG_THRESHOLD = 3;
  const FRICTION = 0.92;
  const MIN_VELOCITY = 0.5;
  const FRAME_MS = 16;
  const grabbingClass = 'is-grabbing';

  const init = (el) => {
    let isDown = false;
    let hasDragged = false;
    let startX = 0;
    let lastPageX = 0;
    let lastTime = 0;
    let velocityX = 0;
    let momentumId = null;

    const stopMomentum = () => {
      if (momentumId) {
        cancelAnimationFrame(momentumId);
        momentumId = null;
      }
    };

    const momentumLoop = () => {
      el.scrollLeft += velocityX;
      velocityX *= FRICTION;

      if (Math.abs(velocityX) > MIN_VELOCITY) {
        momentumId = requestAnimationFrame(momentumLoop);
      }
    };

    const onDocumentMouseMove = (event) => {
      if (!isDown) return;
      event.preventDefault();

      const dx = event.pageX - lastPageX;

      if (!hasDragged && Math.abs(event.pageX - startX) > DRAG_THRESHOLD) {
        hasDragged = true;
      }

      const now = Date.now();
      const dt = now - lastTime;

      if (dt > 0) {
        velocityX = (-dx / dt) * FRAME_MS;
      }

      lastPageX = event.pageX;
      lastTime = now;
      el.scrollLeft -= dx;
    };

    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove(grabbingClass);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      document.removeEventListener('mouseup', endDrag);

      if (Math.abs(velocityX) > MIN_VELOCITY) {
        momentumId = requestAnimationFrame(momentumLoop);
      }
    };

    const onMouseDown = (event) => {
      stopMomentum();
      isDown = true;
      hasDragged = false;
      startX = event.pageX;
      lastPageX = event.pageX;
      lastTime = Date.now();
      velocityX = 0;
      el.classList.add(grabbingClass);

      document.addEventListener('mousemove', onDocumentMouseMove);
      document.addEventListener('mouseup', endDrag);
    };

    const onClick = (event) => {
      if (hasDragged) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const onTouchStart = (event) => {
      stopMomentum();
      isDown = true;
      hasDragged = false;
      startX = event.touches[0].pageX;
      lastPageX = event.touches[0].pageX;
      lastTime = Date.now();
      velocityX = 0;
    };

    const onTouchMove = (event) => {
      if (!isDown) return;

      const dx = event.touches[0].pageX - lastPageX;

      if (
        !hasDragged &&
        Math.abs(event.touches[0].pageX - startX) > DRAG_THRESHOLD
      ) {
        hasDragged = true;
      }

      const now = Date.now();
      const dt = now - lastTime;

      if (dt > 0) {
        velocityX = (-dx / dt) * FRAME_MS;
      }

      lastPageX = event.touches[0].pageX;
      lastTime = now;
      el.scrollLeft -= dx;
    };

    const onTouchEnd = () => {
      isDown = false;

      if (Math.abs(velocityX) > MIN_VELOCITY) {
        momentumId = requestAnimationFrame(momentumLoop);
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('click', onClick, true);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
  };

  Drupal.behaviors.brainsumStarterkitDragScroll = {
    attach(context) {
      once(
        'dragScroll',
        '[data-drupal-selector="drag-scroll"]',
        context
      ).forEach((el) => init(el));
    }
  };
})(Drupal, once);
