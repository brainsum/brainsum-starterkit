# BRAINSUM starterkit

- Created by: [Krisztian Pinter](kpinter@brainsum.com)
- Created in: 2020.
- Updated on: 2026.04.08.

## Table of Contents

- [Introduction](#introduction)
- [What will you need to work with this theme?](#what-will-you-need-to-work-with-this-theme?)
- [Theme installation](#theme-installation)
- [Theme overview](#theme-overview)
- [Third party libraries](#third-party-libraries)
- [Working with this theme (commands)](#working-with-this-theme)

## Introduction

BRAINSUM starterkit is a modern, responsive, mobile-first Drupal 11 starterkit.
It doesn't use any base theme but inspired by
[Olivero](https://www.drupal.org/project/olivero), the default core frontend
theme.

Every part of this theme follows the Drupal standards, so it's fully
component-based (libraries), and compatible 100% with ES6, SMACSS, ITCSS, and
BEMit.

For building css and javascript we use DDEV, yarn and native node.js commands.

In this version of the starterkit the [Shake.sass](https://keeteean.github.io/shake.sass)
was also incorporated witch is a ITCSS- and BEMit-based Sass-only framework.

## What will you need to work with this theme?

- Installed DDEV
- Installed Drupal 11 with DDEV
- [Set asset-packagist to composer.json](https://www.drupal.org/docs/develop/using-composer/using-composer-to-install-drupal-and-manage-dependencies#third-party-libraries)
  of Drupal

_Note: the required node.js version will be set by the install process._

## Theme installation

### Step 1: Install the BrowserSync add-on

```bash
ddev add-on get ddev/ddev-browsersync
```

### Step 2: Get this theme

Clone this theme to `/themes/contrib`.

```bash
cd themes/contrib
git clone https://github.com/keeteean/brainsum_starterkit.git
```

### Step 3: Generate a new theme

CD to the `web`
directory then run the theme generate command:

```bash
ddev php ./web/core/scripts/drupal generate-theme --starterkit brainsum_starterkit [your_theme] --path themes/custom
```

This will generate a new theme named `your_theme` to the `/themes/custom`
directory and add extra DDEV config files.

### Step 4: optionally: remove the BRAINSUM Starterkit

You can remove the BRAINSUM Starterkit theme now.

### Step 5: install npm modules

#### Option A: Using DDEV: install then build

```bash
ddev build
```

#### Option B: Using yarn: only install

```bash
cd themes/custom/[your_theme]/
ddev yarn install
```

### Step 4: setup IDE plugins

Set code quality tools in your code editor / IDE (all config files are in the
theme's root):

- StyleLint
- ESlint
- Prettier
- CSS Var Complete

#### In VS Code

After installed the corresponding extensions, put these lines to your
user/workspace config file:

```json
"editor.formatOnPaste": true,
"editor.codeActionsOnSave": {
  "source.fixAll.stylelint": true
},
"eslint.format.enable": true,
"eslint.ignoreUntitled": true,
"eslint.packageManager": "yarn",
"eslint.validate": [
  "javascript",
  "typescript",
  "json",
],
"stylelint.packageManager": "yarn",
"stylelint.customSyntax": "postcss-scss",
"stylelint.validate": [
  "css",
  "less",
  "postcss",
  "scss"
],
"stylelint.snippet": [
  "css",
  "less",
  "postcss",
  "scss"
],
"[css]": {
    "editor.defaultFormatter": "stylelint.vscode-stylelint"
  },
"[scss]": {
  "editor.defaultFormatter": "esbenp.prettier-vscode"
},
"[javascript]": {
  "editor.defaultFormatter": "esbenp.prettier-vscode"
},
```

Checkout all extensions can find their config file. Example put
these lines to the workspace config file:

```json
"stylelint.configBasedir": "web/themes/custom/your_theme",
"stylelint.configFile": "web/themes/custom/your_theme/.stylelintrc.json",
"prettier.configPath": "web/themes/custom/your_theme/.prettierrc",
```

## Theme overview

### Optional modules

Some modules are optional and can be removed if not needed. These modules even
provide settings that can be adjusted in the related settings yaml files:
`settings/*.settings.yml`.

- __Forms:__ `settings/forms.settings.yml` See [Forms readme](src/sass/5.components/forms/README.md).
- __Header:__ `settings/header.settings.yml`
- __Layout:__ `settings/layout.settings.yml`
- __Pager:__ `settings/pager.settings.yml`
- __Tabledrag:__ `settings/tabledrag.settings.yml`
- __Tables:__ `settings/tables.settings.yml`

_*For the forms module, you may need to install additional libraries. See the
[Bundled libraries into this theme](#bundled-libraries-into-this-theme) section
below._

### CSS

#### SASS/CSS architecture

To generate CSS files, we use Sass. You can find all source Sass files in the
`src/sass/` directory. We organize all Sass files according to ITCSS and
SMACSS, such as:

1. __settings:__ we store all _global_ variables here,
2. __tools:__ all _global_ functions, mixins,
3. __base:__ CSS reset, collecting all CSS custom properties and theming HTML
   elements,
4. __objects:__ layout and non-content related very generic items,
5. __components:__ all content-related items,
6. __utilities:__ class-based _global_ tools (pls, prefer classes over mixins),
7. __pages:__ page specific theming rules, avoid to use them, use components
   whenever you can

Because we have use Drupal libraries, we generate CSS files __from the most Sass
files.__ If you create a new Sass file, don't forget to add the generated SMACSS
categorized CSS to the appropriated library.

#### Modular SASS

Because we use modular SASS, we can't use `@import` to import Sass files. You'll
need to use `@use` instead. See in the
[official documentation](https://sass-lang.com/documentation/at-rules/use).
The main difference between `@import` and `@use` is that you can't access all
variables, mixins and functions globally. If you want to use one of them, first
you have to import via `@use` - with an optional namespace - the Sass file where
it is defined. To make it easier there are two main importer files in the SASS
root: `_settings.scss` and `_tools.scss`.

You can import all SASS variables via `@use "../settings";`. And you can use all
global variables from the 1.settings folder with the settings namespace, like:
`settings.$variable-name`. For example: `settings.$prefers-reduced-motion`.
Similarly, you can import all mixins and functions via `@use "../tools";` from
the 2.tools folder with the tools namespace, like: `tools.mixin-name()`.
For example: `@include tools.breakpoint(medium, settings.$max-width) {}`.

#### CSS Custom Properties

We use CSS custom properties for theme variables except for the ones that are
used in SASS control structures like `@if`, `@for`, `@each`, etc.

All global CSS custom properties are defined in the `1.settings/` layer, inside
`:root{}` blocks. For all local CSS custom properties, place the new (or the
same ones to override their default values) variables inside component classes.
like: `.c-message--warning { --color-text-primary: #ebb504; }`.

### CSS vs. SASS

Whenever is possible, please use vanilla CSS instead of SASS. SASS should only
be used when it provides a clear advantage over vanilla CSS. So if there is a
css and sass version of the same thing, use the css version. For example, for
50% lighter color shade, use:

```sass
color: hsl(from var(--color-primary) h s l / 50%);
```

instead of:

```sass
@use "sass:color";

color: color.scale($color-primary, $lightness: 50%);
```

#### CSS Logical Properties

For the better exotic language support (RTL and Asian languages) we use and
required to use logical properties instead of physical properties. For example:
use `margin-inline-start` instead of `margin-left`.
There is a Stylelint plugin to warn and correct you if you use physical
properties (except `float`). If you don't want to use it, you can disable it in
the `.stylelintrc.json` file: `csstools/use-logical`.

#### Breakpoints: CSS Custom Media Queries

Breakpoints are defined using the [CSS Custom Media Queries](https://www.w3.org/TR/mediaqueries-5/#custom-mq)
specification in `src/sass/1.settings/_settings.breakpoints.css`. While this
feature is in working draft state, we should use PostCSS to process it.
This settings file uses the `@custom-media` syntax processed by PostCSS's
`postcss-custom-media` plugin, which transforms custom media queries into
standard media queries during build.

The file is pure CSS (not SCSS) because these breakpoints need to be globally
available across all compiled CSS files. This ensures consistent breakpoint
usage throughout the entire project without Sass variable scope limitations.

#### Inline SVGs

Whenever possible, use inline SVGs instead of `<img>` tag or background images.
For inlining SVG icons, you can use the Icon [SDC](#drupal-single-directory-components)
(`components/icon`). For example:

```twig
{{ include('brainsum_starterkit:icon', {
  icon: 'angle-down-solid',
  size: 16,
  class: 'c-menu__toggle-icon',
  alt: 'Down angle'|t,
}) }}
```

If it's not possible (e.g. `<input>` element), you can also inline SVG icons
into CSS via [postcss-inline-svg](https://github.com/TrySound/postcss-inline-svg)
plugin. For example place the __colorable__* SVG icon into the images/icons
directory, then:

```scss
.checkmark {
  background: svg-load("../../../images/icons/check-solid.svg",
  fill=$color-checkmark) no-repeat center center;
}
```

_*Colorable means: the SVG can be recolored by CSS using the `fill` property,
if the SVG doesn't have any inline `fill` attributes (like `fill="#000"`).
In that case you can't override it by CSS._

_Note: you can use color codes or local SASS variables, but not CSS variables
in the `fill` properties. (the inline svg from CSS not supports CSS variables)_

### JavaScript

All JavaScript files should be written in ES6 syntax. All source JavaScript
files must go to `src/js/` directory. Then we transform them with Babel.js into
ES5 form to the `js/` directory. All JS files are categorized according to
SMACSS/ITCSS rules:

- __base:__ for very generic functions
- __tools:__ functions to solve a specific problem but not related a
  component/block
- __objects:__ very generic, layout-related functions
- __components:__ components related functions (the most will come here)
- __theme:__ theming related functions

Because we have use Drupal libraries, __we must create JS files for each
library.__

### Template files

As mentioned above this Starterkit doesn't base on any base theme.
All functions, templates are stand-alone: originally copied from core/contrib
modules, from the core's Starterkit theme or from Olivero.

All templates should be organized in subdirectory according to core/contrib
modules. If you need to create a custom template, what you want to include
multiple places place them into the `templates/_patterns/` directory.

### Drupal Single Directory Components

Place your own components here: `components/`. By default there is the Icon
component which is used to display inline SVG icons in the Twig files,
generated from the `/images/icons/` directory.

### Fonts

All custom/local hosted webfonts should go to the `fonts/` directory.
By default as sample some Open Sans font files has been generated here.

### Images

All theme related images should be stored and organized in the `images/`
directory. __Before place any image file here, please optimize that!__

#### Icons

Icons should be stored in the `images/icons/` directory in SVG format. They can
be used in the Icon component from here.

## Third party libraries

### Install libraries

If you need to install any third party library please install that via composer
and attach as a library.

If not setup in your project, you can follow this guide:
[How to manage front-end JavaScript libraries with composer in Drupal](https://harivenu.com/article/how-manage-front-end-javascript-libraries-composer-drupal)

For example, if you want to install [Lity](https://sorgalla.com/lity/) as

Search for in [Asset Packagist](https://asset-packagist.org/) repository. If you
find that, you will see it's an npm or a bower package, then install them via
Composer:

```bash
ddev composer require npm-asset/lity
```

It will install all assets into `libraries/` directory, so we can add it
very easily into a library in the third party libraries section of the
`brainsum_starterkit.libraries.yml` file:

```yaml
lity:
  version: 2.4.1
  remote: https://github.com/jsor/lity
  license:
    name: MIT
    url: https://github.com/jsor/lity/blob/master/LICENSE
    gpl-compatible: true
  css:
    theme:
      /libraries/lity/dist/lity.min.css: { minified: true, preprocess: false }
  js:
    /libraries/lity/dist/lity.min.js: { minified: true, preprocess: false }
```

### Bundled libraries into this theme

#### JustValidate

We use [JustValidate](https://just-validate.dev/) for client-side form
validation. It replaces native HTML5 browser validation with custom, themable
error messages. All validation strings are translatable via `Drupal.t()`.

Install it via Composer (requires
[asset-packagist](https://asset-packagist.org/) repository configured in your
project):

```bash
ddev composer require npm-asset/just-validate
```

The theme provides a `forms.validate` Drupal library that auto-discovers fields
with HTML5 validation attributes (`required`, `type="email"`, `pattern`, etc.)
and maps them to JustValidate rules. Attach it to any form where you want
client-side validation.

For full API documentation and custom rules, see the
[JustValidate docs](https://just-validate.dev/).

#### Choices.js

We use [Choices.js](https://choices-js.github.io/Choices/) for enhanced
select dropdowns with search and multi-select capabilities. It provides a
modern, accessible alternative to native select elements.

Install it via Composer (requires
[asset-packagist](https://asset-packagist.org/) repository configured in your
project):

```bash
ddev composer require npm-asset/choices.js
```

The theme provides a `forms.choices` Drupal library that automatically
initializes Choices.js on select elements with the `multiple` attribute or
custom data attributes. Attach it to any form where you want enhanced select
functionality.

For full API documentation and customization options, see the
[Choices.js docs](https://choices-js.github.io/Choices/).

## Working with this theme

We use only simple npm scripts to build css and js files. You can found all
scripts in `package.json` file. There are many but here is a recap which you
should use only:

- `start`: compile and watching for all css and js files,
- `build`: compile all css and js files at once for production.

So for local developing just run in theme's root:

```bash
ddev yarn start
```

...and before commit anything run:

```bash
ddev yarn build
```

For even more convenience, you can use the following DDEV commands as well from
anywhere in the project:

```bash
# It will install all required node packages and build the theme
ddev build
```

```bash
# It will compile and watch for all css and js files and start browsersync
ddev dev
```

If you want to use browsersync and not use the `ddev dev` command follow these steps:

1. CD to the theme's root directory
2. Run `ddev browsersync` to start the sync process
3. Open a new terminal tab
4. Run `ddev yarn start` to start watching for changes
