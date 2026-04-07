/**
 * @file
 * PostCSS configuration.
 *
 * Used by postcss-cli. Uses NODE_ENV to switch between dev and prod
 * cssnano presets.
 */

import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import postcssCustomMedia from 'postcss-custom-media';
import postcssGlobalData from '@csstools/postcss-global-data';
import postcssInlineSvg from 'postcss-inline-svg';
import postcssPresetEnv from 'postcss-preset-env';
import postcssSorting from 'postcss-sorting';

const isProduction = process.env.NODE_ENV === 'production';

const cssnanoDevPreset = [
  'default',
  {
    discardComments: { removeAll: true },
    normalizeWhitespace: false,
    calc: false,
    colormin: false,
    convertValues: false,
    discardDuplicates: false,
    discardOverridden: false,
    mergeRules: false,
    minifyFontValues: false,
    minifyGradients: false,
    minifyParams: false,
    minifySelectors: false,
    normalizeCharset: false,
    normalizeDisplayValues: false,
    normalizePositions: false,
    normalizeRepeatStyle: false,
    normalizeString: false,
    normalizeTimingFunctions: false,
    normalizeUnicode: false,
    normalizeUrl: false,
    reduceInitial: false,
    reduceTransforms: false,
    svgo: false,
    uniqueSelectors: false,
    cssDeclarationSorter: false
  }
];

const cssnanoProdPreset = [
  'default',
  {
    discardComments: { removeAll: true },
    discardDuplicates: true,
    discardOverridden: true,
    mergeRules: true,
    normalizeCharset: true,
    normalizeString: true,
    normalizeWhitespace: true,
    calc: false,
    colormin: false,
    convertValues: false,
    discardUnused: false,
    mergeIdents: false,
    reduceIdents: false,
    zindex: false,
    cssDeclarationSorter: false
  }
];

export default {
  plugins: [
    postcssInlineSvg({ paths: ['.'] }),
    postcssGlobalData({
      files: ['src/sass/1.settings/_settings.breakpoints.css']
    }),
    postcssCustomMedia(),
    autoprefixer(),
    postcssPresetEnv({ stage: 3, preserve: false }),
    postcssSorting(),
    cssnano({ preset: isProduction ? cssnanoProdPreset : cssnanoDevPreset })
  ]
};
