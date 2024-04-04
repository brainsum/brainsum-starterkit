/**
 * Import required node modules and other external files
 */
import autoprefixer from 'autoprefixer';
import babel from 'gulp-babel';
import browserSync from 'browser-sync';
import cssnano from 'cssnano';
import cssnanoLite from 'cssnano-preset-lite';
import 'dotenv/config';
import eslint from 'gulp-eslint-new';
import gulp from 'gulp';
import postcss from 'gulp-postcss';
import postcssPresetEnv from 'postcss-preset-env';
import prettier from 'gulp-prettier';
import sassGlob from 'gulp-sass-glob';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import sorting from 'postcss-sorting';
import sourcemaps from 'gulp-sourcemaps';
import stylelint from '@ronilaukkarinen/gulp-stylelint';

const server = browserSync.create();
const sass = gulpSass(dartSass);

/**
 * Gulp config
 */
const config = {
  paths: {
    styles: {
      src: './src/sass/**/*.scss',
      dest: './css/'
    },
    scripts: {
      src: './src/js/**/*.js',
      dest: './js/'
    }
  },
  cssnano: {
    preset: [
      'lite',
      {
        discardDuplicates: true,
        discardOverridden: true,
        mergeRules: true,
        normalizeCharset: true,
        normalizeString: true,
        normalizeWhitespace: false
      }
    ]
  },
  postcssPresetEnv: {
    stage: 3,
    preserve: false
  },
  stylelint: {
    reporters: [
      {
        formatter: 'string',
        console: true
      }
    ],
    debug: true,
    failAfterError: false,
    fix: true
  },
  browserSync: {
    proxy: process.env.BROWSERSYC_PROXY,
    autoOpen: false,
    notify: true,
    browsers: ['Google Chrome']
  }
};

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
    .pipe(prettier())
    .pipe(
      sass.sync({
        outputStyle: 'expanded',
        precision: 10
      })
    )
    .on('error', sass.logError)
    .pipe(
      postcss([
        autoprefixer,
        postcssPresetEnv(config.postcssPresetEnv),
        sorting
      ])
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.paths.styles.dest));
  done();
}

function sassCompileProd(done) {
  gulp
    .src(config.paths.styles.src)
    .pipe(sassGlob())
    .pipe(stylelint(config.stylelint))
    .pipe(prettier())
    .pipe(
      sass.sync({
        outputStyle: 'compressed',
        precision: 10
      })
    )
    .on('error', sass.logError)
    .pipe(
      postcss([
        autoprefixer,
        postcssPresetEnv(config.postcssPresetEnv),
        sorting,
        cssnano(config.cssnano)
      ])
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
  gulp.src(config.paths.styles.src).pipe(stylelint(config.stylelint));
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
    .pipe(prettier())
    .pipe(
      babel({
        presets: ['@babel/env']
      })
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
    .pipe(prettier())
    .pipe(
      babel({
        presets: ['@babel/env']
      })
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
    proxy: config.browserSync.proxy,
    open: config.browserSync.autoOpen,
    browser: config.browserSync.browsers,
    files: [
      './css/**/*',
      './js/**/*',
      './templates/**/*',
      './*.yml',
      './*.theme'
    ],
    watchEvents: ['add', 'change']
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
  server.reload();
  done();
}

// Watching with Sync Task
const watch = () =>
  gulp.watch(
    [config.paths.styles.src, config.paths.scripts.src],
    gulp.series(sassCompileDev, scriptsDev, browserSyncReloadTask)
  );

// Watching without Sync Task
const watchNoSync = () =>
  gulp.watch(
    [config.paths.styles.src, config.paths.scripts.src],
    gulp.series(sassCompileDev, scriptsDev)
  );

// Define complex tasks
const compileTask = gulp.parallel(sassCompileDev, scriptsDev);
const watchTask = gulp.series(compileTask, browserSyncTask, watch);
const watchTaskNoSync = gulp.series(compileTask, watchNoSync);

/**
 * Export Gulp tasks
 */
export default watchTask;
export const defaultNoSync = watchTaskNoSync;
export const prod = gulp.parallel(sassCompileProd, scriptsProd);
export const sassDev = sassCompileDev;
export const sassProd = sassCompileProd;
export const scripts = scriptsProd;
export const lint = sassLintTask;
