/* eslint-disable prettier/prettier */
/**
 * @file
 * Laravel Mix Configuration
 */

/**
 * Imports
 */
const cssNano               = require('cssnano')({
  preset: ['default', {
    autoprefixer            : false,
    normalizeWhitespace    : false,
    minifySelectors        : false,
    minifyParams           : false,
    normalizeCharset       : false
  }]
});
const customProperties      = require('postcss-custom-properties');
const mix                   = require('laravel-mix');
const MixGlob               = require('laravel-mix-glob');
const StyleLintPlugin       = require('stylelint-webpack-plugin');
require('laravel-mix-eslint');

/**
 * Settings
 */
const mixGlob               = new MixGlob({ mix });
const productionSourceMaps  = false;
const browserSync           = {
  proxy: 'http://projectname.test/',
  https: false,
  autoOpen: false,
  browsers: [
    'Google Chrome',
  ]
};

/**
 * Mix Asset Management
 *
 * Mix provides a clean, fluent API for defining some Webpack build steps
 * for your Laravel application. By default, we are compiling the Sass
 * file for your application, as well as bundling up your JS files.
 *
 */
mixGlob
  .sass('src/sass/fontface*.scss', 'css/')
  .sass('src/sass/3.base/*.scss', 'css/base/')
  .sass('src/sass/4.objects/*.scss', 'css/layout/')
  .sass('src/sass/5.components/*.scss', 'css/components/')
  .sass('src/sass/6.utilities/*.scss', 'css/utilities/')
  .sass('src/sass/7.pages/*.scss', 'css/pages/')
  .mix('options')({
    processCssUrls: false,
    postCss: [
      customProperties,
      cssNano
    ],
  });

mix
  .copyDirectory(
    'src/js/vendors',
    'js/tools'
  )
  // .babel(
  //   'src/js/base/base.global.js',
  //   'js/base/base.global.js'
  // )
  .babel(
    'src/js/tools/tools.announce.js',
    'js/tools/tools.announce.js'
  )
  .copy(
    'src/js/tools/tools.webfontloading.js',
    'js/tools/tools.webfontloading.js'
  )
  .babel(
    'src/js/components/components.horizontal-tabs.js',
    'js/components/components.horizontal-tabs.js'
  )
  .babel(
    'src/js/components/components.messages.js',
    'js/components/components.messages.js'
  )
  .babel(
    'src/js/components/components.navigation.js',
    'js/components/components.navigation.js'
  )
  .babel(
    'src/js/components/components.tabs.js',
    'js/components/components.tabs.js'
  )
  .babel(
    'src/js/components/components.vertical-tabs.js',
    'js/components/components.vertical-tabs.js'
  )
  .eslint({
    fix: false,
    cache: false,
  })
  .sourceMaps()
  .webpackConfig({
    devtool: 'source-map',
    plugins: [
      new StyleLintPlugin({
        configFile: './.stylelintrc.json',
      }),
    ],
  })
  .browserSync({
    proxy: browserSync.proxy,
    https: browserSync.https,
    open: browserSync.autoOpen,
    browser: browserSync.browsers,
    files: [
      './css/**/*',
      './js/**/*',
      './templates/**/*',
      './*.yml',
      './*.theme',
    ],
    watchEvents: ['add', 'change'],
  });

if (mix.inProduction) {
  mix
    .setPublicPath('/')
    .version();
}


/**
 * The Mix API
 * Below, you'll find the full Mix API. Out of the box, Mix supports a wide
 * array of frameworks * and preprocessors.
 * /

/**
 * The methods below assume that you've imported mix at the top of your
 * webpack.mix.js file, like so:
 *
 * let mix = require('laravel-mix');
 */

/**
 * .js(src, output)
 * Bundle your JavaScript assets.
 *
 * mix.js('src/file.js', 'dist/file.js');
 */

/**
 * .ts(src, dist)
 * Bundle your TypeScript assets.
 *
 * mix.ts('src/file.ts', 'dist/file.js');
 */

/**
 * .vue(options ?)
 * Add support for Vue single file components.
 *
 * mix.js('src/file.js', 'dist/file.js').vue();
 *
 * Vue 2 and 3 differ slightly in how they should be bundled. Mix will do its
 * best to check which version you currently have installed; however, if you
 * wish, you can be explicit.
 *
 * mix.js('src/file.js', 'dist/file.js').vue({ version: 2 });
 */

/**
 * .react()
 * Add support for React compilation.
 *
 * mix.js('src/file.js', 'dist/file.js').react();
 */

/**
 * .preact()
 * Add support for Preact compilation.
 *
 * mix.js('src/file.js', 'dist/file.js').preact();
 */

/**
 *.coffee(src, output)
 * Preprocess CoffeeScript files.
 *
* mix.coffee('src/file.coffee', 'dist/file.js');
 */

/**
 * .postCss(src, output, plugins[] ?)
 * Compile PostCss files.
 *
 * mix.postCss('src/file.css', 'dist/file.css', [
 *   require('precss')() // your PostCss plugins
 * ]);
 */

/**
 * .sass(src, output, sassPluginOptions ?)
 * Compile Sass files.
 *
 * mix.sass('src/file.scss', 'dist/file.css');
 */

/**
 * .less(src, output)
 * Compile Less files.
 *
 * mix.less('src/file.less', 'dist/file.css');
 */

/**
 * .stylus(src, output)
 * Compile Stylus files.
 *
 * mix.stylus('src/file.styl', 'dist/file.css');
 */

/**
 * .extract(vendors ?)
 * Use webpack code - splitting to extract any or all vendor dependencies into
 * their own files.
 *
 * mix.js('src/file.js', 'dist/file.js').extract(['vue']);
 *
 * When no dependency is provided, Mix will bundle all imported dependencies
 * from the * node_modules / directory to a vendor.js file.
 *
 * mix.js('src/file.js', 'dist/file.js').extract();
 */

/**
 * .version(files[] ?)
 * Version all compiled assets by appending a unique hash to every file within
 * mix - manifest.json.This is useful for cache - busting purposes.
 *
 * mix.js('src/file.js', 'dist/file.js').version();
 *
 * If using Laravel, refer to its global mix() helper function for dynamically
 * accessing this hashed file path.
 *
 * <script src = "{{ mix('js/app.js') }}"></script>
 */

/**
 * .sourceMaps(generateForProduction ?, devType ?, productionType ?)
 * Generate JavaScript source maps.
 *
 * mix.js('src/file.js', 'dist/file.js').sourceMaps();
*/

/**
 * .browserSync(domain)
 * Monitor files for changes and update the browser without requiring a manual
 * page refresh.
 *
 * mix.js('...').browserSync('your-domain.test');
 */

/**
 * .setPublicPath(path)
 * Set the path to where all public assets should be compiled to.For non
 * - Laravel projects, always include a call to this method.
 *
 * mix.setPublicPath('dist');
 */

/**
 * .webpackConfig(config)
 * Merge a webpack configuration object with the one Mix has generated. This can
 * be useful when you want to drop down a level and manipulate the webpack
 * configuration directly.
 *
 * mix.webpackConfig({
 *   plugins: [new SomeWebpackPlugin()]
 * });
 */

/**
 *.override(fn(webpackConfig))
 * Register a handler for after the webpack configuration has been fully
 * constructed. This is your last chance to override Mix's configuration before
 * the compiling begins.
 *
 * mix.override(webpackConfig => {
 *   webpackConfig.module.rules.push({
 *     test: /\.extension$/,
 *     use: []
 *   });
 * });
 */

/**
 * .dump()
 * Log the generated webpack configuration to the console. This is temporary
 * command that may be useful for debugging purposes.
 *
 * mix.dump();
 */

/**
 * .autoload(libraries)
 * Make a module available as a variable in every other module required by
 * webpack. If you're working with a particular plugin or library that depends
 * upon a global variable, such as jQuery, this command may prove useful.
 *
 * mix.autoload({
 *   jquery: ['$', 'window.jQuery']
 * });
 */

/**
 * .before(callback)
 * Run the given callback function before the webpack compilation begins.
 *
 * mix.before(() => {
 *   fs.copySync('path/from', 'path/to');
 * });
 * If your script is asynchronous, you must return a promise to ensure that Mix
 * waits for it to complete before beginning the compilation.
 *
 * mix.before(() => {
 *   return new Promise(resolve => {
 *     setTimeout(resolve, 2000);
 *   });
 * });
 */

/**
 * .after(callback)
 * Run the given callback function after the webpack compilation has completed.
 *
 *   mix.after(webpackStats => {
 *     console.log('Compilation complete');
 *   });
 */

/**
 * .options(options)
 * Merge and override Mix's default configuration settings. Refer to this
 * package's src / Config.js file for a full list of settings that can be
 * overridden.
 */

/**
 * Below is a brief list of the most common overrides.
 *
 * mix.options({
 *   processCssUrls: false,
 *   postCss: [],
 *   terser: {},
 *   autoprefixer: {},
 *   legacyNodePolyfills: false
 * });
 */
