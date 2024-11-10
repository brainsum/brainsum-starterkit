# BRAINSUM starterkit

- Created by: [Krisztian Pinter](kpinter@brainsum.com)
- Created in: 2020.
- Updated on: 2024.11.10.

## Table of Contents

- Introduction
- What will you need to work with this theme?
- Theme installation
- Theme overview
- Working with this theme

## Introduction

BRAINSUM starterkit is a modern, responsive, mobile-first Drupal 10 starterkit.
It doesn't use any base theme but inspired by
[Olivero](https://www.drupal.org/project/olivero), the new core frontend theme.

Every part of this theme follows the Drupal standards, so it's fully
component-based (libraries), and compatible 100% with ES6, SMACSS, ITCSS, and
BEMit.

For building frontend assets we still use Gulp.js 🥤.

In this version of the starterkit the [Shake.sass](https://keeteean.github.io/shake.sass)
was also incorporated witch is a ITCSS- and BEMit-based Sass-only framework.

## What will you need to work with this theme?

- Installed Composer
- Installed Drush
- Installed Drupal 10 via Composer
- [Set asset-packagist to composer.json](https://www.drupal.org/docs/develop/using-composer/using-composer-to-install-drupal-and-manage-dependencies#third-party-libraries)
  of Drupal
- Installed node.js (min. v20)
- Installed Yarn (Drupal Community recommends Yarn. If you really hates Yarn
  you can still use npm as well, but remove the yarn.lock file.)

## Theme installation

Before you can use the theme please make sure you run composer install (it's
required for 3rd party frontend npm modules too):

```bash
cd [project-root]
composer install
```

... and don't forget to import all Drupal configs with
`drush cim -y`. 😉

Set proper theme development settings: disable caching and aggregation but
turned on Twig debug. See in
[official documentation](https://www.drupal.org/node/2598914).

### Step 1: generate a new theme

Clone this theme to `/themes/contrib`. CD to the `web`
directory then run the theme generate command:

```bash
php core/scripts/drupal generate-theme --starterkit brainsum_starterkit [your_theme] --path themes/custom
```

or in case you use DDEV:

```bash
ddev php ./web/core/scripts/drupal generate-theme --starterkit brainsum_starterkit [your_theme] --path themes/custom
```

This will generate a new theme named `your_theme` to the `/themes/custom`
directory.

### Step 2: copy all hidden configuration files

Copy manually all hidden configuration files (stated with a dot) from the BRAINSUM
Starterkit to the new theme directory.

```bash
cp -r themes/contrib/brainsum_starterkit/.* themes/custom/[your_theme]/
```

### Step 3: remove the BRAINSUM Starterkit

You can remove the BRAINSUM Starterkit theme now.

### Step 4: install npm modules

You will need at least v20. nodejs for this theme. You can use nvm for that:

```bash
cd themes/custom/[your_theme]/
nvm use
```

__Note: in case you use DDEV, the correct node version is already set.__

Install all local development-needed npm modules:

```bash
yarn install
```

### Step 5: set proxy URL

Rename the `env.example` file to `.env` and set the proxy URL according to your
environment.

### Step 6: setup IDE plugins

Set code quality tools in your code editor / IDE (all config files are in the
theme's root):

- StyleLint
- ESlint
- Prettier

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

### CSS

#### SASS/CSS architecture

To generate CSS files, we use Sass. You can find all source Sass files in the
`src/sass/` directory. We organize all Sass files according to ITCSS and
SMACSS, such as:

1. **settings:** we store all _global_ variables here,
2. **tools:** all _global_ functions, mixins,
3. **base:** CSS reset and theming HTML elements,
4. **objects:** layout and non-content related very generic items,
5. **components:** all content-related items,
6. **utilities:** class-based _global_ tools,
7. **pages:** page specific theming rules, avoid to use them, use components
    whenever you can

Because we have use Drupal libraries, we generate CSS files **from the most Sass
files.** If you create a new Sass file, don't forget to add the generated SMACSS
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

You can import all variables via `@use "../settings";`. And you can use all
global variables from the 1.settings folder with the settings namespace, like:
`settings.$variable-name`. For example: `settings.$color-primary`.
Similarly, you can import all mixins and functions via `@use "../tools";` from
the 2.tools folder with the tools namespace, like: `tools.mixin-name()`.
For example: `@include tools.breakpoint(medium, settings.$max-width) {}`.

For the 100% compatibility with the Dart SASS 2.0 you have to use the built in
SASS functions like Math for the division:

```scss
@use "sass:math";

$width: math.div(100, 2) * 1%; // 50%
```

#### CSS Logical Properties

For the better exotic language support (RTL and Asian languages) we use and
required to use logical properties instead of physical properties. For example:
use `margin-inline-start` instead of `margin-left`.
There is a Stylelint plugin to warn and correct you if you use physical
properties (except `float`). If you don't want to use it, you can disable it in
the `.stylelintrc.json` file: `csstools/use-logical`.

#### Inline SVGs in CSS

You can inling SVG icons into CSS via [postcss-inline-svg](https://github.com/TrySound/postcss-inline-svg)
plugin. For example place the colorable SVG icon into the images/icons directory, then:

```scss
.checkmark {
  background: svg-load("../../../images/icons/checkmark.svg", fill=settings.$color-secondary) no-repeat center
          center;
}
```

_Note: you can use SASS variables, but not CSS variables in the `fill` or
`stroke` properties._

### JavaScript

All JavaScript files should be written in ES6 syntax. All source JavaScript
files must go to `src/js/` directory. Then we transform them with Babel.js into
ES5 form to the `js/` directory. All JS files are categorized according to
SMACSS/ITCSS rules:

- **base:** for very generic functions
- **tools:** functions to solve a specific problem but not related a
  component/block
- **objects:** very generic, layout-related functions
- **components:** components related functions (the most will come here)
- **theme:** theming related functions

Because we have use Drupal libraries, **we must create JS files for each
library.**

### Template files

As mentioned above Starter Theme doesn't base on any base theme.
All functions, templates are stand-alone: originally copied from core/contrib
modules or from Olivero.

All templates should be organized in subdirectory according to core/contrib
modules. If you need to create any custom template, put them into
`templates/includes/` directory.

### Fonts

All custom/local hosted webfonts should go to the `fonts/` directory.
By default as sample some Open Sans font files has been generated here.

### Images

All theme related images should be stored and organized in the `images/`
directory. **Before place any image file here, please optimize that!**

### Third party assets

If you need to install any third party library please install that via composer
and attach as a library.

If not setup in your project, you can follow this guide:
[How to manage front-end JavaScript libraries with composer in Drupal](https://harivenu.com/article/how-manage-front-end-javascript-libraries-composer-drupal)

For example, if you want to install [Lity](https://sorgalla.com/lity/) as lightbox:

Search for in [Asset Packagist](https://asset-packagist.org/) repository. If you
find that, you will see it's an npm or a bower package, then install them via
Composer:

```bash
composer require npm-asset/lity
```

It will install all assets into `libraries/` directory, so we can add it
very easily into a library:

```yaml
lightbox:
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

## Working with this theme

We use [Gulp.js](https://gulpjs.com) as frontend automation tool. It
will generate CSS and compiled JavaScript files for us. You can found all
scripts in `package.json` file, but here is a recap:

- `start`: compile and watching for all css and js files then reload the
  browser,
- `startNoSync`: same as the start with browser reloading,
- `build`: compile all css and js files at once for production,
- `sassDev`: compile all css files for development,
- `sassProd`: compile all css files for production,
- `scripts`: compile all js files.

So for local developing just run in theme's root (after `nvm use` if you use
nvm):

```bash
yarn start
```

...and before commit anything run:

```bash
yarn build
```
