/**
 * Import required node modules and other external files
 */
require('dotenv').config();
const autoprefixer         = require('autoprefixer');
const babel               = require('gulp-babel');
const browserSync         = require('browser-sync').create();
const cssnano             = require('cssnano');
const cssnanoLite         = require('cssnano-preset-lite');
const eslint              = require('gulp-eslint-new');
const gulp                = require('gulp');
const postcss             = require('gulp-postcss');
const postcssPresetEnv    = require('postcss-preset-env');
const sassGlob            = require('gulp-sass-glob');
const sass                = require('gulp-sass')(require('sass'));
const sorting             = require('postcss-sorting');
const sourcemaps          = require('gulp-sourcemaps');
const stylelint           = require('@ronilaukkarinen/gulp-stylelint');

/**
 * Gulp config
 */
const config = {
  paths: {
    styles: {
      src : './src/sass/**/*.scss',
      dest: './css/',
    },
    scripts: {
      src : './src/js/**/*.js',
      dest: './js/',
    },
  },
  cssnano: {
    preset: [
      'lite',
      {
        discardDuplicates  : true,
        discardOverridden  : true,
        mergeRules         : true,
        normalizeCharset   : true,
        normalizeString    : true,
        normalizeWhitespace: false,
      },
    ],
  },
  postcssPresetEnv: {
    stage       : 1,
    preserve    : false,
    autoprefixer: {
      cascade: false,
      grid   : 'no-autoplace',
    },
    features: {
      'blank-pseudo-class'        : false,
      'focus-visible-pseudo-class': false,
      'focus-within-pseudo-class' : false,
      'has-pseudo-class'          : false,
      'image-set-function'        : false,
      'prefers-color-scheme-query': false,
    },
  },
  browserSync: {
    proxy   : process.env.BROWSERSYC_PROXY,
    autoOpen: false,
    notify  : true,
    browsers: [
      'Google Chrome',
    ],
  },
};

// Predefined complex Gulp tasks
let compileTask = '';
let watchTask = '';
let watchTaskNoSync = '';

/**
 * SASS:Compile Task
 *
 * The all-in-one Sass task for compiling, linting sass files with live injecting into all browsers
 * @param {string} done The done argument is passed into the callback function;
 * executing that done function tells Gulp "a hint to tell it when the task is done".
 *
 *
 * npm run sass
 */
function sassCompileDev(done) {
  gulp
    .src(config.paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass.sync({
      outputStyle: 'expanded',
      precision  : 10,
    }))
    .on('error', sass.logError)
    .pipe(
      postcss([
        autoprefixer,
        postcssPresetEnv(config.postcssPresetEnv),
        sorting,
      ]),
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.paths.styles.dest));
  done();
}

function sassCompileProd(done) {
  gulp
    .src(config.paths.styles.src)
    .pipe(sassGlob())
    .pipe(sass.sync({
      outputStyle: 'compressed',
      precision  : 10,
    }))
    .on('error', sass.logError)
    .pipe(
      postcss([
        autoprefixer,
        postcssPresetEnv(config.postcssPresetEnv),
        sorting,
        cssnano(config.cssnano),
      ]),
    )
    .pipe(gulp.dest(config.paths.styles.dest));
  done();
}

/**
 * SASS:Linting Task
 *
 * Run only StyleLint task to check errors.
 * @param {string} done The done argument is passed into the callback function;
 * executing that done function tells Gulp "a hint to tell it when the task is done".
 */
function sassLintTask(done) {
  gulp.src(config.paths.styles.src).pipe(
    stylelint({
      reporters: [
        {
          formatter: 'verbose',
          console  : true,
        },
      ],
      debug         : true,
      failAfterError: false,
      fix           : true,
    }),
  );
  done();
}

/**
 * JavaScript DEV Task
 *
 * Generate sourcemaps for debugging, linting with ESlint and transpile ES6
 * code to legacy ES5 via Babel.
 * @param {string} done The done argument is passed into the callback function;
 * executing that done function tells Gulp "a hint to tell it when the task is done".
 */
function scriptsDev(done) {
  gulp
    .src(config.paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(
      babel({
        presets: [
          '@babel/env',
        ],
      }),
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.paths.scripts.dest));
  done();
}

/**
 * JavaScript Prod Task
 *
 * Linting with ESlint and transpile ES6 code to legacy ES5 via Babel.
 * @param {string} done The done argument is passed into the callback function;
 * executing that done function tells Gulp "a hint to tell it when the task is done".
 */
function scriptsProd(done) {
  gulp
    .src(config.paths.scripts.src)
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(
      babel({
        presets: [
          '@babel/env',
        ],
      }),
    )
    .pipe(gulp.dest(config.paths.scripts.dest));
  done();
}

/**
 * BrowserSync Task
 *
 * Watching Sass and JavaScript source files for changes.
 * @param {string} done The done argument is passed into the callback function;
 * executing that done function tells Gulp "a hint to tell it when the task is done".
 */
function browserSyncTask(done) {
  browserSync.init({
    proxy  : config.browserSync.proxy,
    open   : config.browserSync.autoOpen,
    browser: config.browserSync.browsers,
    files  : [
      './css/**/*',
      './js/**/*',
      './templates/**/*',
      './*.yml',
      './*.theme',
    ],
    watchEvents: ['add', 'change'],
  });
  done();
}

/**
 * BrowserSync Reload Task
 *
 * BrowserSync will reload all synced browsers.
 * @param {function} done Reload event.
 */
function browserSyncReloadTask(done) {
  browserSync.reload();
  done();
}

// Watching with Sync Task
const watch = () => gulp.watch(
  [
    config.paths.styles.src,
    config.paths.scripts.src,
  ],
  gulp.series(
    sassCompileDev,
    scriptsDev,
    browserSyncReloadTask,
  ),
);

// Watching without Sync Task
const watchNoSync = () => gulp.watch(
  [
    config.paths.styles.src,
    config.paths.scripts.src,
  ],
  gulp.series(
    sassCompileDev,
    scriptsDev,
  ),
);

// Define complex tasks
compileTask = gulp.parallel(sassCompileDev, scriptsDev);
watchTask = gulp.series(compileTask, browserSyncTask, watch);
watchTaskNoSync = gulp.series(compileTask, watchNoSync);

/**
 * Export Gulp tasks
 */
exports.default = watchTask;
exports.defaultNoSync = watchTaskNoSync;
exports.prod = gulp.parallel(sassCompileProd, scriptsProd);
exports.sassDev = sassCompileDev;
exports.sassProd = sassCompileProd;
exports.scripts = scriptsProd;
exports.lint = sassLintTask;
