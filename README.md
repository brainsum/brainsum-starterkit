# BRAINSUM's Drupal 8-9 startertheme

* Created by: [Krisztian Pinter](kpinter@brainsum.com)
* Created in: 2020.
* Updated on: 2022.01.21.

## Table of Contents

* Introduction
* What will you need to work with this theme?
* Theme installation
* Theme overview
* Working with this theme

## Introduction

Drupal 8-9 startertheme is a modern responsive, mobile-first Drupal 8-9 theme.
It doesn't use any base theme but inspired by [Olivero](https://www.drupal.org/project/olivero), the new core frontend theme.

Every part of this theme follows the Drupal standards, so it's fully
component-based (libraries), and compatible 100% with ES6, SMACSS, ITCSS, and
BEMit.

For building frontend assets we use Laravel Mix: webpack with simplified configuration.
You can use many built in tools and almost any other webpack plugins.

In this version of startertheme the [Shake.sass](https://keeteean.github.io/shake.sass)
is also incorporated witch is a ITCSS- and BEMit-based Sass-only framework.

## What will you need to work with this theme?

* Installed Composer
* Installed Drush
* Installed Drupal 8-9 via Composer
* [Set asset-packagist to composer.json](https://www.drupal.org/docs/develop/using-composer/using-composer-to-install-drupal-and-manage-dependencies#third-party-libraries) of Drupal
* Installed node.js (min. v14)
* Installed yarn or npm (Drupal Community recommends Yarn.)

## Theme installation

Before you can use the theme please make sure
you run composer install (it's required for 3rd party
frontend npm modules too):

```bash
cd [project-root]
composer install
```

... and don't forget to import all Drupal configs with
`drush cim -y`. 😉

Copy this version directory: `advanced-es6-mix-shake` to custom themes
directory, then rename it according to your project. If you just want
to try it you can rename it to `starter_theme`. From this when see
`starter_theme`, it's refer to the machine name of your theme, by default
it's `starter_theme`. After you choose your theme name, rename
`starter_theme` **everywhere** to your chosen machine name, but here is a list:

* directory name,
* `*.yml` files and `.theme` file names,
* global library name in `info.yml` file,
* breakpoint prefix name in `breakpoints.yml` file,
* all hook prefix in `.theme` file, library name and in the path variable:
  `$variables['starter_theme_path'] = drupal_get_path('theme', 'starter_theme');`,
* `themeRoot` variable in `tools.webfontloading.js`,
* prefix name of Drupal.behaviors in components JavaScrtipt files,
* name of main menu block in `components.navigation.js`,
* usage comment in `base.global.js` file,
* `theme_root` variable in `font-face*.scss` files
* library name in library attaches in twigs: `field--text-long`, `form`, `html`,
  `status-messages`, `menu-local-tasks`,
* includes in twigs: `html`, `page`, `block--system-menu-block.html.twig`,
* `starter_theme_path` in `includes/preload` twig,
* usage comment in `icon` macro twig file

You need at least v14. nodejs for this theme. You can use nvm for that:

```bash
cd web/themes/custom/starter_theme/
nvm use
```

Install all local development-needed npm modules:

```bash
cd web/themes/custom/stater_theme/
yarn install
```

Modify BrowserSync's settings to your local
environment in `webpack.mix.js` file:

```js
[...]
.browserSync({
  proxy: 'http://projectname.test/',
  https: false,
  open: false,
  browser: [
    'Google Chrome',
  ],
  [...],
[...]
```

Set code quality tools in your code editor / IDE (all config files are in the
theme's root):

* ESlint
* Prettier
* StyleLint

Set proper theme development settings: disable caching and aggregation but
turned on Twig debug. See in [official documentation](https://www.drupal.org/node/2598914).

### Stylelint configuration

To enable auto-fix function on save for Stylelint

#### In VS Code

Put this to your user/project config file:

``` json
"editor.formatOnSave": false,
"editor.codeActionsOnSave": {
  "source.fixAll.stylelint": true
},
"files.autoSaveDelay": 500,
```

#### In PHPStorm

Create a new file watcher: Configuration >> Tools >> File Watchers
![PHPStorm File Watchers](https://i.imgur.com/xXIlL9p.png)

Then hit the `+` button and choose the first <custom> one
![new File Watcher](https://i.imgur.com/Xycaebl.png)

In the new file watch window fill the fields:

* Name: whatever you want
* File type: choose SCSS
* Scope: Project Files
* Program: path to stylelint execute file in npm_modules directory like: `ProjectFileDir$/web/themes/custom/clinic/node_modules/.bin/stylelint`
* Arguments: `$FilePath$ --fix`
* Output paths to refresh: `$ProjectFileDir$`
* open down Advanced options, then uncheck _Auto-save edited files to trigger the watcher_

![create new File Watcher window](https://i.imgur.com/DJ0NzYl.png)

## Theme overview

### CSS

To generate CSS files, we use Sass. You can find all source Sass files in the
`src/sass/` directory. We organize all Sass files according to ITCSS and
SMACSS, such as:

 1. **settings:** we store all _global_ variables here,
 1. **tools:** all _global_ functions, mixins,
 1. **base:** CSS reset and theming HTML elements,
 1. **objects:** layout and non-content related very generic items,
 1. **components:** all content-related items,
 1. **utilities:** class-based _global_ tools,
 1. **pages:** page specific theming rules, avoid to use them, use components
    whenever you can

There is a `_global.importer.scss` file in the sass root: we need to import it
to all Sass files to get access to global tools and variables.

Note: because this theme 100% compatible with Dart Sass 2.0.0, we can't use
the `/` sign for regular Sass divisions. **We must use the `math.div()` function.** See in the [docs](https://sass-lang.com/documentation/breaking-changes/slash-div#automatic-migration).
To do this, first place this code to the top of all sass files:
`@use "sass:math";` Then if you need calculate a division, you must use the
`math.div()` function. For example:
`width 100% / 3;` -> `width: math.div(100%, 3);`.
Sometimes you can use the multiple calculation too instead of division:
`$hamburger-spinner-height / 2;` -> `$hamburger-spinner-height * 0.5;`.

Because we have use Drupal libraries, we generate CSS files **from the most Sass
files.** If you create a new Sass file, don't forget to add the generated SMACSS
categorized CSS to the appropriated library.

### JavaScript

All JavaScript files should be written in ES6 syntax. All source JavaScript files
must go to `src/js/` directory. Then we transform them with Babel.js into ES5
form to the `js/` directory. All JS files are categorized according to
SMACSS/ITCSS rules:

* **base:** for very generic functions
* **tools:** functions to solve a specific problem but not related a component/block
* **objects:** very generic, layout-related functions
* **components:** components related functions (the most will come here)
* **theme:** theming related functions

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
and attach as a library. For example, if you want to install
[Lity](https://sorgalla.com/lity/) as lightbox:

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

We use [Laravel Mix](https://laravel-mix.com/) as frontend automation tool. It
will generate CSS and compiled JavaScript files for us. You can found all scripts
in `package.json` file, but here is a recap:

* `dev`: compile all css and js files at once (no watch) in dev version,
* `watch`: compile and watching for all css and js files,
* `hot`: hot module replacement, we don't use it for Drupal,
* `prod`: compile all css and js files at once for production (leave it for Drupal),
* `start`: same as watch, this is for Brainsum coding standard: start for developing

So for local developing just run in theme's root (after `nvm use` if you use nvm):

```bash
yarn start
```
