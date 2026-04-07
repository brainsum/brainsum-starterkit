# Forms Component System

This directory contains all form-related SCSS components for the theme. The system provides a modular, customizable approach to form styling with optional features that can be enabled per-form.

## File Structure

| File | Description | Auto-attached |
| ---- | ----------- | ------------- |
| `forms.base.scss` | Core form styles, custom properties, inputs, labels, descriptions | Always (via form.html.twig) |
| `forms.boolean.scss` | Checkboxes, radios, inline boolean layout | When checkbox/radio used |
| `forms.icons.scss` | Icon fields (select arrows, search, date/time icons) | When select/search used or field in config |
| `forms.floating-labels.scss` | Bootstrap-style floating labels | When form ID in config |
| `forms.switch.scss` | Toggle switch (lightswitch) styling | When field name in config |
| `forms.range.scss` | Range/slider input styling | When range input used |
| `forms.number.scss` | Custom +/- buttons for number inputs | When enabled in config and form has number inputs |
| `forms.layouts.scss` | Fieldset, composite, horizontal/inline layout | When form ID in config |
| `forms.select.scss` | Enhanced selects with Choices.js | When form ID in config |
| `forms.validation.scss` | Error/success states, validation messages | When form ID in config |

_**Note:** Libraries are automatically attached based on element type or `settings/settings.forms.yml` settings. See settings sections below for details._

## Related Files

### Settings

- `settings/settings.forms.yml` — Centralized form settings (floating labels, icons, switches, layouts, etc.)

### PHP (Preprocess Functions)

- `src/includes/form.inc` — Form preprocessing, config reader, form alterations

### JavaScript

- `src/js/components/components.forms.select.js` — Choices.js initialization
- `src/js/components/components.forms.validation.js` — JustValidate client-side validation
- `src/js/components/components.forms.number.js` — Custom number input controls
- `src/js/components/components.forms.ajax.js` — AJAX form enhancements

### Templates

- `templates/form/form.html.twig` — Main form wrapper
- `templates/form/form-element.html.twig` — Individual form element wrapper
- `templates/form/select.html.twig` — Select element template
- `templates/form/input.html.twig` — Input element template
- `templates/form/input--number.html.twig` — Number input with custom controls

### Libraries

- `brainsum_starterkit.libraries.yml` — Library definitions

---

## Core Features (Always Active)

### Custom Properties

All form styling uses CSS custom properties defined in `forms.base.scss`. Override these at the `form` level to customize:

```scss
form {
  // Layout
  --border-radius: 0.2rem;
  --item-gap: var(--unit-12x);
  --label-gap: var(--unit-2x);
  --description-gap: var(--unit-2x);
  --inline-gap: var(--unit-3x);
  --horizontal-label-width: 25%;
  --input-height: 3.6rem;

  // Paddings
  --padding-block: var(--unit-2x);
  --padding-inline: var(--unit-2x);

  // Colors
  --color-input: var(--color-black);
  --color-input-background: var(--color-light);
  --color-input-border: var(--color-border-dark);
  --color-placeholder: var(--color-grey-40);
  --color-label: var(--color-text-primary);
  --color-description: var(--color-grey-40);
  --color-required: var(--color-error);

  // Sizing
  --icon-size: 1.6rem;
}
```

### Form Elements

Standard form elements are styled automatically:

- Text inputs (text, email, password, number, tel, url, search)
- Textarea
- Select (native styling)
- Checkboxes and radios
- Labels and descriptions
- Required field indicators

---

## Auto-Attached Features

These libraries are automatically attached by `form-element.html.twig` when the corresponding element type is used. No configuration required.

### Boolean Elements (Checkboxes/Radios)

Custom styled checkboxes and radios using `appearance: none`.

**Auto-attached:** When any checkbox or radio element is used.

### Range Input

Custom styling for range/slider inputs.

**Auto-attached:** When a range input is used.

### Number Input Controls

Replaces native browser spinners with custom +/- buttons for number inputs. Buttons are positioned like right-side icon fields.

**Enable globally or per-form:** Edit `settings/settings.forms.yml`:

```yaml
number_controls:
  enabled: true           # Global toggle (true = ON, forms list = exclusions)
  disable_at_limits: false # Disable buttons at min/max boundaries
  forms:
    # - excluded_form_id  # Exclude specific forms when enabled: true
```

**Auto-attached:** When enabled for the form AND the form contains number inputs. Library is only loaded when needed.

**Features:**

- Accessible increment/decrement buttons with proper ARIA labels
- Respects `min`, `max`, and `step` attributes
- Works with floating labels
- Hover effect persists when hovering buttons (no flashing)
- Optional per-button disabling at min/max boundaries

**Options:**

- `disable_at_limits: false` (default) — Browser-like behavior, whole field disabled or not
- `disable_at_limits: true` — Individual buttons disabled when value reaches min/max

### Form Icons

Icons for select arrows, search fields, date/time pickers.

**Auto-attached:** When select or search inputs are used.

**Icon positions:**

- `.has-icon--end` — Icon on the right (default: select)
- `.has-icon--start` — Icon on the left (default: search)

**Enable for other fields:** Edit `settings/settings.forms.yml`:

```yaml
icons:
  end:
    types:
      - select
    names:
      - field_website
  start:
    types:
      - search
    names:
      - field_phone
```

Field names use prefix matching (e.g., `field_phone` matches `field_phone[0][value]`).

Then add the icon in `forms.icons.scss`:

1. Add variable in Settings section:

```scss
// Per-type icon images
$website-icon: "link-solid";
```

2. Add selector in "Per-type icon images" section:

```scss
&-item-field-website .has-icon::after {
  background-image: svg-load("images/icons/#{$website-icon}.svg", fill=$color-icon);
}
```

### Toggle Switch

Converts checkboxes into iOS-style toggle switches.

**Auto-attached:** When a checkbox field name matches config.

**Enable for fields:** Edit `settings/settings.forms.yml`:

```yaml
switch:
  names:
    - field_newsletter
    - field_notifications
```

Field names use prefix matching (e.g., `field_newsletter` matches `field_newsletter[value]`).

**Or enable in PHP** (for dynamic cases):

```php
$form['my_checkbox']['#is_form_switch'] = TRUE;
```

### Inline Booleans

Display checkboxes/radios in a horizontal row instead of stacked.

**Enable for fields:** Edit `settings/settings.forms.yml`:

```yaml
inline_booleans:
  names:
    - field_categories
    - field_tags
```

Field names use prefix matching.

### Floating Labels

Bootstrap-inspired floating labels that animate above the input on focus or when the field has a value.

**Enable globally or per-form:** Edit `settings/settings.forms.yml`:

```yaml
floating_labels:
  enabled: false          # Global toggle (true = ON, forms list = exclusions)
  forms:
    - user_login_form     # Include these when enabled: false
    - user_register_form
```

**Auto-attached:** When enabled for the form ID.

**Limitations:**

- Not compatible with horizontal/inline form layouts
- Works with: text inputs, textarea, select (single only)

**Custom Properties:**

```scss
.c-form-floating {
  --input-height: 5.8rem; // Taller inputs for floating labels
  --padding-block: calc(var(--unit-4x) + 0.2rem);
}
```

---

## Additional Features

These features are attached per-form via config.

### Horizontal/Inline Form Layout

Two-column layout with labels on the left and inputs on the right.

#### Option 1: Whole form via settings

Edit `settings/settings.forms.yml`:

```yaml
horizontal_layout:
  enabled: false          # Global toggle (true = ON, forms list = exclusions)
  forms:
    - my_settings_form    # Include these when enabled: false
```

The `.c-form--horizontal` class and library are automatically added.

#### Option 2: Subsection of a form via PHP

Add the class to a container element in your form:

```php
$form['settings_section'] = [
  '#type' => 'container',
  '#attributes' => ['class' => ['c-form--horizontal']],
];

$form['settings_section']['username'] = [
  '#type' => 'textfield',
  '#title' => $this->t('Username'),
];
```

**Note:** When using subsection approach, manually attach the library:

```php
$form['#attached']['library'][] = 'brainsum_starterkit/forms.layouts';
```

**Customize label width:**

```scss
form {
  --horizontal-label-width: 25%; // Adjust as needed
}
```

**Note:** Floating labels are automatically disabled for horizontal layouts.

---

### Enhanced Selects (Choices.js)

Provides searchable, styleable select fields with improved UX.

**Install dependency:**

```bash
composer require npm-asset/choices.js
```

**Enable globally or per-form:** Edit `settings/settings.forms.yml`:

```yaml
enhanced_select:
  enabled: false          # Global toggle (true = ON, forms list = exclusions)
  forms:
    - contact_message_feedback_form
    - user_register_form
```

**Auto-attached:** When enabled for the form AND the form contains `<select>` elements. Library is only loaded when needed.

**Features:**

- Search functionality (auto-enabled when >5 options)
- Custom styling matching theme design
- Keyboard navigation
- Multiple select with tag-style items and remove buttons
- Placeholder text for empty multiple selects
- Works with floating labels

**Configuration (JS):** Edit `src/js/components/components.forms.select.js`:

```javascript
const choices = new Choices(select, {
  searchEnabled: select.options.length > 5, // When to show search
  searchResultLimit: 10,                    // Max search results
  removeItemButton: isMultiple,             // Show remove buttons
  // ... other options
});
```

---

### Client-Side Validation (JustValidate)

Modern client-side validation with smooth error animations.

**Install dependency:**

```bash
composer require npm-asset/just-validate
```

**Enable globally or per-form:** Edit `settings/settings.forms.yml`:

```yaml
validation:
  enabled: false          # Global toggle (true = ON, forms list = exclusions)
  forms:
    - contact_message_feedback_form
    - user_login_form
```

**Features:**

- Auto-discovers HTML5 validation attributes
- Translatable error messages via Drupal.t()
- Smooth scroll to first error
- Works with all form element types

**Styling:** Edit `forms.validation.scss` to customize error/success states:

```scss
.c-form {
  --color-error: var(--color-danger);
  --color-success: var(--color-success);
}
```
