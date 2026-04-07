/**
 * @file
 * Smooth animated tabledrag implementation.
 *
 * Replaces Drupal core's drag behavior with smooth FLIP animations.
 * Uses the exact drag-to-reorder approach but updates Drupal's weight fields.
 *
 * @see https://tahazsh.com/blog/seamless-ui-with-js-drag-to-reorder-example/
 *
 * ENHANCEMENTS (beyond core /core/misc/tabledrag.js):
 * - Keyboard accessibility: Space to grab/release, Arrow keys to move, Escape to cancel
 * - Smooth auto-scrolling: Velocity-based scrolling with cursor-following dragged element
 * - Screen reader actions menu: Accessible menu with Move Up/Down/Top/Bottom options
 *   (toggleable via settings/settings.tabledrag.yml)
 *
 * MISSING FEATURES (compared to core /core/misc/tabledrag.js):
 * - Hierarchical/indentation support (indent(), findChildren(), validIndentInterval())
 * - Toggle weight column button (uses SCSS variable instead)
 * - Table striping (restripeTable() - use CSS :nth-child instead)
 * - Advanced field relationships (parent/sibling references)
 * - Extension hooks (onDrag, onDrop, onSwap, onIndent stubs)
 * - Row swap validation (isValidSwap() for hierarchical tables)
 * - Drupal.detachBehaviors/attachBehaviors integration on row swap
 *
 * @param {object} Drupal - The Drupal global object.
 * @param {Function} once - The once utility for ensuring single attachment.
 */

(function (Drupal, once) {
  'use strict';

  /**
   * Attaches smooth tabledrag to tables.
   */
  Drupal.behaviors.smoothTableDrag = {
    attach: function (context) {
      const tables = once('smooth-tabledrag', 'table.draggable-table', context);

      tables.forEach((table) => {
        new SmoothTableDrag(table);
      });
    }
  };

  /**
   * Smooth TableDrag - tutorial's approach adapted for Drupal.
   */
  class SmoothTableDrag {
    constructor(table) {
      this.table = table;
      this.tbody = table.querySelector('tbody');
      this.draggableRow = null;
      this.pointerStartX = 0;
      this.pointerStartY = 0;
      this.rowsGap = 0;
      this.rows = [];

      // Auto-scroll settings (based on Sortable.js approach)
      this.scrollSensitivity = 30; // Distance from edge to trigger scroll
      this.scrollSpeed = 10; // Pixels to scroll per interval
      this.scrollInterval = null;
      this.currentPointerY = 0;

      // Get settings from drupalSettings
      this.settings = drupalSettings?.brainsum_starterkit?.tabledrag || {
        screenReaderSupport: true
      };

      if (!this.tbody) return;

      // Initialize after a brief delay to ensure DOM is ready
      setTimeout(() => {
        this.init();
      }, 50);
    }

    init() {
      // Add BEM classes to table structure
      this.addTableClasses();

      // Add class to form to remove flexbox gaps
      const form = this.table.closest('form');
      if (form) {
        form.classList.add('has-no-visible-form-items');
      }

      // Create drag handles for each row
      this.createDragHandles();

      // Initialize weight column hiding (like core tabledrag)
      this.initColumns();

      // Add mouse/touch event listeners
      this.tbody.addEventListener('mousedown', this.dragStart.bind(this));
      this.tbody.addEventListener('touchstart', this.dragStart.bind(this));
      document.addEventListener('mouseup', this.dragEnd.bind(this));
      document.addEventListener('touchend', this.dragEnd.bind(this));

      // Add keyboard event listeners for accessibility
      this.tbody.addEventListener('keydown', this.handleKeyDown.bind(this));

      // Add click event listeners for VoiceOver/screen reader users
      // VoiceOver's VO+Space triggers click events, not keydown
      this.tbody.addEventListener('click', this.handleClick.bind(this));

      // Initialize rows with is-idle class
      this.getAllRows().forEach((row) => {
        row.classList.add('is-idle');
      });

      // Track keyboard dragging state
      this.keyboardDragging = false;
      this.keyboardDraggedRow = null;

      // Track changed rows
      this.changedRows = new Set();
    }

    addTableClasses() {
      // Add class to table element
      this.table.classList.add('c-tabledrag');

      // Add class to tbody
      if (this.tbody) {
        this.tbody.classList.add('c-tabledrag__items');
      }

      // Add class to thead
      const thead = this.table.querySelector('thead');
      if (thead) {
        thead.classList.add('c-tabledrag__head');

        // Add class to thead tr
        const headRow = thead.querySelector('tr');
        if (headRow) {
          headRow.classList.add('c-tabledrag__head-row');

          // Add classes to th elements
          const headCells = headRow.querySelectorAll('th');
          headCells.forEach((cell, index) => {
            cell.classList.add('c-tabledrag__head-cell');

            // Add modifier class based on position
            if (index === 0) {
              cell.classList.add('c-tabledrag__head-cell--name');
              cell.classList.add('c-tabledrag-hide');
            } else if (index === 1) {
              cell.classList.add('c-tabledrag__head-cell--weight');
            }
          });
        }
      }

      // Add classes to tbody rows and cells
      this.getAllRows().forEach((row) => {
        row.classList.add('c-tabledrag__item');

        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
          cell.classList.add('c-tabledrag__cell');

          // Add modifier class based on position
          if (index === 0) {
            cell.classList.add('c-tabledrag__cell--name');
          } else if (index === 1) {
            cell.classList.add('c-tabledrag__cell--id');
          } else if (index === 2) {
            cell.classList.add('c-tabledrag__cell--weight');
          }
        });
      });
    }

    initColumns() {
      // Find ID and weight columns using the classes we already added
      const idCells = this.table.querySelectorAll('.c-tabledrag__cell--id');
      const weightCells = this.table.querySelectorAll(
        '.c-tabledrag__cell--weight'
      );

      // Also find header cells for these columns
      const firstRow = this.tbody.querySelector('tr');
      if (!firstRow) return;

      const columnsToHide = new Set();

      // Get ID column index
      if (idCells.length > 0) {
        const cells = Array.from(firstRow.querySelectorAll('td'));
        const idCell = Array.from(idCells).find((cell) =>
          firstRow.contains(cell)
        );
        if (idCell) {
          const columnIndex = cells.indexOf(idCell);
          if (columnIndex !== -1) {
            columnsToHide.add(columnIndex);
          }
        }
      }

      // Get weight column index
      if (weightCells.length > 0) {
        const cells = Array.from(firstRow.querySelectorAll('td'));
        const weightCell = Array.from(weightCells).find((cell) =>
          firstRow.contains(cell)
        );
        if (weightCell) {
          const columnIndex = cells.indexOf(weightCell);
          if (columnIndex !== -1) {
            columnsToHide.add(columnIndex);
          }
        }
      }

      // Mark all cells in these columns with c-tabledrag-hide class and hide them
      const allRows = this.table.querySelectorAll('thead > tr, tbody > tr, tr');
      allRows.forEach((row) => {
        const cells = row.querySelectorAll('td, th');
        columnsToHide.forEach((columnIndex) => {
          const cell = cells[columnIndex];
          if (cell) {
            // Check for colspan
            if (cell.colSpan && cell.colSpan > 1) {
              cell.classList.add('c-tabledrag-has-colspan');
              cell.colSpan -= 1;
            } else {
              cell.classList.add('c-tabledrag-hide');
            }
          }
        });
      });
    }

    hideColumns() {
      // Hide weight/parent cells and headers
      const hiddenElements = this.table.querySelectorAll('.c-tabledrag-hide');
      hiddenElements.forEach((element) => {
        element.style.display = 'none';
      });

      // Show TableDrag handles
      const handles = this.table.querySelectorAll('.c-tabledrag-handle');
      handles.forEach((handle) => {
        handle.style.display = '';
      });
    }

    checkScroll(clientY) {
      const windowHeight = window.innerHeight;
      const sens = this.scrollSensitivity;

      // Calculate scroll velocity: -1 (up), 0 (no scroll), or 1 (down)
      let vy = 0;

      // Check if near bottom edge (scroll down)
      if (windowHeight - clientY <= sens) {
        vy = 1;
      }
      // Check if near top edge (scroll up)
      else if (clientY <= sens) {
        vy = -1;
      }

      return vy;
    }

    setScroll(vy) {
      // Clear any existing scroll interval
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
      }

      // Only set up interval if there's a velocity
      if (vy === 0) return;

      // Disable transitions on idle rows for better performance during auto-scroll
      this.getIdleRows().forEach((row) => {
        row.classList.add('no-transition');
      });

      // Set up scroll interval (24ms like Sortable.js)
      this.scrollInterval = setInterval(() => {
        // Calculate scroll offset: velocity × speed
        const scrollOffset = vy * this.scrollSpeed;

        // Get table boundaries
        const tableRect = this.table.getBoundingClientRect();
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const aboveTable = scrollY > tableRect.top + scrollY;
        const belowTable = scrollY + windowHeight < tableRect.bottom + scrollY;

        // Only scroll if within table bounds
        if (
          (scrollOffset > 0 && belowTable) ||
          (scrollOffset < 0 && aboveTable)
        ) {
          window.scrollBy(0, scrollOffset);
        }
      }, 24);
    }

    markChanged(row) {
      // Add asterisk marker to the row if not already present
      const firstCell = row.querySelector('td:first-of-type');
      if (!firstCell) return;

      if (!firstCell.querySelector('abbr.c-tabledrag-changed')) {
        const marker = document.createElement('abbr');
        marker.className = 'warning c-tabledrag-changed';
        marker.title = Drupal.t('Changed');
        marker.textContent = '*';

        // Insert before the actions button if it exists, otherwise append to end
        const actionsButton = firstCell.querySelector('.c-tabledrag__actions');
        if (actionsButton) {
          firstCell.insertBefore(marker, actionsButton);
        } else {
          firstCell.appendChild(marker);
        }
      }

      // Track this row as changed
      if (row.id) {
        this.changedRows.add(row.id);
      }

      // Add warning message if not already present
      this.addChangedWarning();
    }

    addChangedWarning() {
      // Check if warning already exists
      const existingWarning = this.table.parentElement.querySelector(
        '.c-tabledrag-changed-warning'
      );
      if (existingWarning) return;

      // Create warning message
      const warning = document.createElement('div');
      warning.className =
        'c-tabledrag-changed-warning c-messages c-messages--warning';
      warning.setAttribute('role', 'alert');

      const marker = document.createElement('abbr');
      marker.className = 'warning c-tabledrag-changed';
      marker.title = Drupal.t('Changed');
      marker.textContent = '*';

      warning.appendChild(marker);
      warning.appendChild(
        document.createTextNode(' ' + Drupal.t('You have unsaved changes.'))
      );

      // Insert before table
      this.table.parentElement.insertBefore(warning, this.table);
    }

    createDragHandles() {
      // SVG icon for drag handle (grip-dots-vertical from Font Awesome)
      // To customize, replace this variable with a different inline SVG
      const handleIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="8" height="13" aria-hidden="true"><title>${Drupal.t('Vertical drag handle')}</title><path d="M128 64A64 64 0 1 0 0 64 64 64 0 1 0 128 64zm0 192a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zM0 448c0 35.3 28.7 64 64 64s64-28.7 64-64-28.7-64-64-64-64 28.7-64 64zM320 64a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zM192 256a64 64 0 1 0 128 0 64 64 0 1 0 -128 0zM320 448c0-35.3-28.7-64-64-64s-64 28.7-64 64 28.7 64 64 64 64-28.7 64-64z"/></svg>`;

      // Create drag handle for each draggable row
      this.getAllRows().forEach((row) => {
        // Check if handle already exists
        if (row.querySelector('.c-tabledrag-handle')) return;

        // Create accessible handle using abbr element
        const handle = document.createElement('abbr');
        handle.className = 'c-tabledrag-handle';
        handle.title = Drupal.t('Drag to re-order');

        // ARIA attributes for accessibility
        // Hide from screen readers - they'll use the actions menu instead
        handle.setAttribute('aria-hidden', 'true');
        handle.setAttribute('role', 'button');
        handle.setAttribute('tabindex', '0');

        // Add SVG icon as innerHTML
        handle.innerHTML = handleIconSvg;

        // Add classes to the SVG element
        const svg = handle.querySelector('svg');
        if (svg) {
          svg.classList.add('c-icon', 'c-tabledrag-handle__icon');
        }

        // Insert handle at the beginning of the first cell
        const firstCell = row.querySelector('td');
        if (firstCell) {
          firstCell.insertBefore(handle, firstCell.firstChild);

          // Create actions menu button for screen readers (if enabled)
          if (this.settings.screenReaderSupport) {
            const actionsButton = this.createActionsButton(row);

            // Insert after the changed marker if it exists, otherwise append to end
            const changedMarker = firstCell.querySelector(
              '.c-tabledrag-changed'
            );
            if (changedMarker) {
              changedMarker.parentNode.insertBefore(
                actionsButton,
                changedMarker.nextSibling
              );
            } else {
              firstCell.appendChild(actionsButton);
            }
          }
        }
      });
    }

    createActionsButton(row) {
      // SVG icon for actions button (ellipsis-vertical from Font Awesome)
      const buttonIconSvg = `<svg class="c-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512" width="4" height="16" aria-hidden="true"><title>${Drupal.t('Vertical dots')}</title><path d="M64 144a56 56 0 1 1 0-112 56 56 0 1 1 0 112zm0 224c30.9 0 56 25.1 56 56s-25.1 56-56 56-56-25.1-56-56 25.1-56 56-56zm56-112c0 30.9-25.1 56-56 56s-56-25.1-56-56 25.1-56 56-56 56 25.1 56 56z"/></svg>`;

      // Create button
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'c-tabledrag__actions-button';
      button.setAttribute('aria-label', Drupal.t('Row actions'));
      button.setAttribute('aria-haspopup', 'menu');
      button.setAttribute('aria-expanded', 'false');
      button.innerHTML = buttonIconSvg;

      // Create menu
      const menu = document.createElement('ul');
      menu.className = 'c-tabledrag__actions-menu';
      menu.setAttribute('role', 'menu');

      // Wrapper for button and menu
      const wrapper = document.createElement('span');
      wrapper.className = 'c-tabledrag__actions';
      wrapper.appendChild(button);
      wrapper.appendChild(menu);

      // Toggle menu on button click
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        // Close all other menus
        document
          .querySelectorAll(
            '.c-tabledrag__actions-button[aria-expanded="true"]'
          )
          .forEach((btn) => {
            if (btn !== button) {
              btn.setAttribute('aria-expanded', 'false');
              btn.nextElementSibling.classList.remove('is-open');
            }
          });

        if (!isExpanded) {
          // Update menu items based on current row position before showing
          this.updateActionsMenu(row, menu);
        }

        // Toggle this menu
        button.setAttribute('aria-expanded', !isExpanded);
        menu.classList.toggle('is-open', !isExpanded);

        if (!isExpanded) {
          // Focus first menu item
          menu.querySelector('.c-tabledrag__actions-menu-item')?.focus();
        }
      });

      // Handle menu item clicks
      menu.addEventListener('click', (e) => {
        const menuItem = e.target.closest('.c-tabledrag__actions-menu-item');
        if (!menuItem) return;

        const action = menuItem.dataset.action;
        this.performAction(row, action);

        // Close menu
        button.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
        button.focus();
      });

      // Close menu on Escape
      menu.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          button.setAttribute('aria-expanded', 'false');
          menu.classList.remove('is-open');
          button.focus();
        }
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
          button.setAttribute('aria-expanded', 'false');
          menu.classList.remove('is-open');
        }
      });

      return wrapper;
    }

    performAction(row, action) {
      const allRows = this.getAllRows();
      const currentIndex = allRows.indexOf(row);

      switch (action) {
        case 'moveToTop':
          if (currentIndex > 0) {
            this.tbody.insertBefore(row, allRows[0]);
            this.markChanged(row);
            this.updateWeightFields();
          }
          break;

        case 'moveUp':
          if (currentIndex > 0) {
            this.tbody.insertBefore(row, allRows[currentIndex - 1]);
            this.markChanged(row);
            this.updateWeightFields();
          }
          break;

        case 'moveDown':
          if (currentIndex < allRows.length - 1) {
            this.tbody.insertBefore(allRows[currentIndex + 1], row);
            this.markChanged(row);
            this.updateWeightFields();
          }
          break;

        case 'moveToBottom':
          if (currentIndex < allRows.length - 1) {
            this.tbody.appendChild(row);
            this.markChanged(row);
            this.updateWeightFields();
          }
          break;
      }

      // Refresh rows cache
      this.rows = [];
    }

    updateActionsMenu(row, menu) {
      // Clear existing menu items
      menu.innerHTML = '';

      // Get current position
      const allRows = this.getAllRows();
      const currentIndex = allRows.indexOf(row);
      const isFirst = currentIndex === 0;
      const isLast = currentIndex === allRows.length - 1;

      // Define all possible actions
      const allActions = [
        {
          label: Drupal.t('Move to top'),
          action: 'moveToTop',
          hideWhen: isFirst
        },
        { label: Drupal.t('Move up'), action: 'moveUp', hideWhen: isFirst },
        { label: Drupal.t('Move down'), action: 'moveDown', hideWhen: isLast },
        {
          label: Drupal.t('Move to bottom'),
          action: 'moveToBottom',
          hideWhen: isLast
        }
      ];

      // Add only applicable actions
      allActions.forEach((actionDef) => {
        if (actionDef.hideWhen) return;

        const li = document.createElement('li');
        li.setAttribute('role', 'none');

        const menuItem = document.createElement('button');
        menuItem.type = 'button';
        menuItem.className = 'c-tabledrag__actions-menu-item';
        menuItem.setAttribute('role', 'menuitem');
        menuItem.textContent = actionDef.label;
        menuItem.dataset.action = actionDef.action;

        li.appendChild(menuItem);
        menu.appendChild(li);
      });
    }

    getAllRows() {
      if (!this.rows?.length) {
        this.rows = Array.from(this.tbody.querySelectorAll('tr.draggable'));
      }
      return this.rows;
    }

    getIdleRows() {
      return this.getAllRows().filter((row) =>
        row.classList.contains('is-idle')
      );
    }

    isRowAbove(row) {
      return row.hasAttribute('data-is-above');
    }

    isRowToggled(row) {
      return row.hasAttribute('data-is-toggled');
    }

    handleClick(e) {
      // Handle VoiceOver/screen reader activation (VO+Space triggers click)
      const handle = e.target.closest('.c-tabledrag-handle');
      if (!handle) return;

      const row = handle.closest('tr.draggable');
      if (!row) return;

      // Prevent default and stop propagation to avoid conflicts with mouse drag
      e.preventDefault();
      e.stopPropagation();

      if (!this.keyboardDragging) {
        // Start keyboard drag
        this.keyboardDragging = true;
        this.keyboardDraggedRow = row;
        row.classList.add('is-draggable');
        row.classList.remove('is-idle');
        handle.setAttribute('aria-grabbed', 'true');
        handle.setAttribute(
          'aria-label',
          Drupal.t('Dragging. Use arrow keys to move, Space or Enter to drop')
        );
      } else if (this.keyboardDraggedRow === row) {
        // Drop
        this.keyboardDragEnd();
      }
    }

    handleKeyDown(e) {
      const handle = e.target.closest('.c-tabledrag-handle');
      if (!handle) return;

      const row = handle.closest('tr.draggable');
      if (!row) return;

      // Space bar: grab or drop
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();

        if (!this.keyboardDragging) {
          // Start keyboard drag
          this.keyboardDragging = true;
          this.keyboardDraggedRow = row;
          row.classList.add('is-draggable');
          row.classList.remove('is-idle');
          handle.setAttribute('aria-grabbed', 'true');
          handle.setAttribute(
            'aria-label',
            Drupal.t('Dragging. Use arrow keys to move, Space to drop')
          );
        } else if (this.keyboardDraggedRow === row) {
          // Drop
          this.keyboardDragEnd();
        }
      }

      // Enter key: also grab or drop (for consistency)
      if (e.key === 'Enter') {
        e.preventDefault();

        if (!this.keyboardDragging) {
          this.keyboardDragging = true;
          this.keyboardDraggedRow = row;
          row.classList.add('is-draggable');
          row.classList.remove('is-idle');
          handle.setAttribute('aria-grabbed', 'true');
          handle.setAttribute(
            'aria-label',
            Drupal.t('Dragging. Use arrow keys to move, Enter to drop')
          );
        } else if (this.keyboardDraggedRow === row) {
          this.keyboardDragEnd();
        }
      }

      // Arrow keys: move row
      if (this.keyboardDragging && this.keyboardDraggedRow === row) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.moveRowUp(row);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.moveRowDown(row);
        }
      }

      // Escape: cancel keyboard drag
      if (
        e.key === 'Escape' &&
        this.keyboardDragging &&
        this.keyboardDraggedRow === row
      ) {
        e.preventDefault();
        this.keyboardDragCancel();
      }
    }

    moveRowUp(row) {
      const prevRow = row.previousElementSibling;
      if (prevRow && prevRow.classList.contains('draggable')) {
        this.tbody.insertBefore(row, prevRow);
        this.updateWeightFields();
        // Keep focus on handle
        row.querySelector('.c-tabledrag-handle')?.focus();
      }
    }

    moveRowDown(row) {
      const nextRow = row.nextElementSibling;
      if (nextRow && nextRow.classList.contains('draggable')) {
        this.tbody.insertBefore(nextRow, row);
        this.updateWeightFields();
        // Keep focus on handle
        row.querySelector('.c-tabledrag-handle')?.focus();
      }
    }

    keyboardDragEnd() {
      if (!this.keyboardDraggedRow) return;

      const handle = this.keyboardDraggedRow.querySelector(
        '.c-tabledrag-handle'
      );
      this.keyboardDraggedRow.classList.remove('is-draggable');
      this.keyboardDraggedRow.classList.add('is-idle');

      if (handle) {
        handle.setAttribute('aria-grabbed', 'false');
        handle.setAttribute('aria-label', Drupal.t('Drag to reorder'));
      }

      // Mark row as changed
      this.markChanged(this.keyboardDraggedRow);

      this.updateWeightFields();
      this.keyboardDragging = false;
      this.keyboardDraggedRow = null;
    }

    keyboardDragCancel() {
      if (!this.keyboardDraggedRow) return;

      const handle = this.keyboardDraggedRow.querySelector(
        '.c-tabledrag-handle'
      );
      this.keyboardDraggedRow.classList.remove('is-draggable');
      this.keyboardDraggedRow.classList.add('is-idle');

      if (handle) {
        handle.setAttribute('aria-grabbed', 'false');
        handle.setAttribute('aria-label', Drupal.t('Drag to reorder'));
      }

      this.keyboardDragging = false;
      this.keyboardDraggedRow = null;
    }

    dragStart(e) {
      // Only start drag if clicking on or inside the handle
      const handle = e.target.closest('.c-tabledrag-handle');
      if (!handle) return;

      // Prevent default link behavior
      e.preventDefault();

      // Get the draggable row
      this.draggableRow = handle.closest('tr.draggable');

      if (!this.draggableRow) return;

      this.pointerStartX = e.clientX || e.touches[0].clientX;
      this.pointerStartY = e.clientY || e.touches[0].clientY;
      this.scrollStartY = window.scrollY; // Track initial scroll position

      this.setRowsGap();
      this.disablePageScroll();
      this.initDraggableRow();
      this.initRowsState();

      // Store bound functions to properly remove them later
      this.boundDrag = this.drag.bind(this);
      this.boundDragTouch = this.drag.bind(this);

      document.addEventListener('mousemove', this.boundDrag);
      document.addEventListener('touchmove', this.boundDragTouch, {
        passive: false
      });
    }

    setRowsGap() {
      const idleRows = this.getIdleRows();
      if (idleRows.length <= 1) {
        this.rowsGap = 0;
        return;
      }

      const row1 = idleRows[0];
      const row2 = idleRows[1];
      const row1Rect = row1.getBoundingClientRect();
      const row2Rect = row2.getBoundingClientRect();
      this.rowsGap = Math.abs(row1Rect.bottom - row2Rect.top);
    }

    disablePageScroll() {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.userSelect = 'none';
    }

    initRowsState() {
      const allRows = this.getAllRows();
      const draggableIndex = allRows.indexOf(this.draggableRow);

      this.getIdleRows().forEach((row, i) => {
        if (draggableIndex > i) {
          row.dataset.isAbove = '';
        }
      });
    }

    initDraggableRow() {
      this.draggableRow.classList.remove('is-idle');
      this.draggableRow.classList.add('is-draggable');
    }

    drag(e) {
      if (!this.draggableRow) return;

      e.preventDefault();

      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;
      const pointerOffsetX = clientX - this.pointerStartX;
      const pointerOffsetY = clientY - this.pointerStartY;

      // Compensate for scroll changes so element follows cursor during auto-scroll
      const scrollDelta = window.scrollY - this.scrollStartY;
      const adjustedOffsetY = pointerOffsetY + scrollDelta;

      this.draggableRow.style.transform = `translate(${pointerOffsetX}px, ${adjustedOffsetY}px)`;

      // Check if window should auto-scroll (use clientY - viewport coordinates)
      const vy = this.checkScroll(clientY);
      if (vy !== 0) {
        this.setScroll(vy);
      } else {
        // Stop scrolling if not near edge
        if (this.scrollInterval) {
          clearInterval(this.scrollInterval);
          this.scrollInterval = null;
          // Re-enable transitions
          this.getIdleRows().forEach((row) => {
            row.classList.remove('no-transition');
          });
        }
      }

      this.updateIdleRowsStateAndPosition();
    }

    updateIdleRowsStateAndPosition() {
      const draggableRowRect = this.draggableRow.getBoundingClientRect();
      const draggableRowY = draggableRowRect.top + draggableRowRect.height / 2;

      // Update state
      this.getIdleRows().forEach((row) => {
        const rowRect = row.getBoundingClientRect();
        const rowY = rowRect.top + rowRect.height / 2;

        if (this.isRowAbove(row)) {
          if (draggableRowY <= rowY) {
            row.dataset.isToggled = '';
          } else {
            delete row.dataset.isToggled;
          }
        } else {
          if (draggableRowY >= rowY) {
            row.dataset.isToggled = '';
          } else {
            delete row.dataset.isToggled;
          }
        }
      });

      // Update position
      this.getIdleRows().forEach((row) => {
        if (this.isRowToggled(row)) {
          const direction = this.isRowAbove(row) ? 1 : -1;
          row.style.transform = `translateY(${direction * (draggableRowRect.height + this.rowsGap)}px)`;
        } else {
          row.style.transform = '';
        }
      });
    }

    dragEnd() {
      if (!this.draggableRow) return;

      // Stop auto-scrolling
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
        this.scrollInterval = null;
      }

      // Re-enable transitions on all idle rows
      this.getIdleRows().forEach((row) => {
        row.classList.remove('no-transition');
      });

      this.applyNewRowsOrder();

      // Mark row as changed
      this.markChanged(this.draggableRow);

      this.updateWeightFields();
      this.cleanup();
    }

    applyNewRowsOrder() {
      const reorderedRows = [];
      const allRows = this.getAllRows();

      allRows.forEach((row, index) => {
        if (row === this.draggableRow) return;
        if (!this.isRowToggled(row)) {
          reorderedRows[index] = row;
          return;
        }
        const newIndex = this.isRowAbove(row) ? index + 1 : index - 1;
        reorderedRows[newIndex] = row;
      });

      for (let index = 0; index < allRows.length; index++) {
        if (typeof reorderedRows[index] === 'undefined') {
          reorderedRows[index] = this.draggableRow;
        }
      }

      reorderedRows.forEach((row) => {
        this.tbody.appendChild(row);
      });
    }

    updateWeightFields() {
      // Get fresh row order from DOM (not cached)
      const currentRows = Array.from(
        this.tbody.querySelectorAll('tr.draggable')
      );

      currentRows.forEach((row, index) => {
        const weightField = row.querySelector(
          'select[class*="weight"], input[type="weight"]'
        );
        if (weightField) {
          weightField.value = index;
          const event = new Event('change', { bubbles: true });
          weightField.dispatchEvent(event);
        }
      });

      // Show Drupal's changed warning
      const tableDragObject = Drupal.tableDrag?.[this.table.id];
      if (tableDragObject) {
        tableDragObject.changed = true;
        if (tableDragObject.showChangedWarning) {
          tableDragObject.showChangedWarning();
        }
      }
    }

    cleanup() {
      this.rowsGap = 0;
      this.rows = [];
      this.unsetDraggableRow();
      this.unsetRowState();
      this.enablePageScroll();

      // Remove event listeners using stored bound functions
      if (this.boundDrag) {
        document.removeEventListener('mousemove', this.boundDrag);
      }
      if (this.boundDragTouch) {
        document.removeEventListener('touchmove', this.boundDragTouch);
      }
    }

    unsetDraggableRow() {
      this.draggableRow.style = null;
      this.draggableRow.classList.remove('is-draggable');
      this.draggableRow.classList.add('is-idle');
      this.draggableRow = null;
    }

    unsetRowState() {
      this.getIdleRows().forEach((row) => {
        delete row.dataset.isAbove;
        delete row.dataset.isToggled;
        row.style.transform = '';
      });
    }

    enablePageScroll() {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.userSelect = '';
    }
  }
})(Drupal, once);
