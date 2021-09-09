'use strict';

/**
 * @file
 * Webfont loading API.
 * Not used currently, because Lighthouse can't recognize it, and gives lower points.
 */

var themeRoot = '/themes/custom/starter_theme';

if ('fonts' in document) {
  var opensansRegular = new FontFace(
    'Open Sans',
    'url(' + themeRoot + '/fonts/opensans-regular-hint-all.woff2) format("woff2"),' +
    'url(' + themeRoot + '/fonts/opensans-regular-hint-all.woff) format("woff")',
    { weight: 400, style: 'normal' });
  var opensansItalic = new FontFace(
    'Open Sans',
    'url(' + themeRoot + '/fonts/opensans-italic-hint-all.woff2) format("woff2"), ' +
    'url(' + themeRoot + '/fonts/opensans-italic-hint-all.woff) format("woff")',
    { weight: 400, style: 'italic' });
  var opensansBold = new FontFace(
    'Open Sans',
    'url(' + themeRoot + '/fonts/opensans-bold-hint-all.woff2) format("woff2"), ' +
    'url(' + themeRoot + '/fonts/opensans-bold-hint-all.woff) format("woff")',
    { weight: 700, style: 'normal' });

  Promise.all([
    opensansBold.load(),
    opensansItalic.load(),
    opensansRegular.load()])
    .then(function fontLoading(fonts) {
      fonts.forEach(function attachFont(font) {
        document.fonts.add(font);
      });
    });
}

if (!('fonts' in document) && 'head' in document) {
  // Awkwardly dump the second stage @font-face blocks in the head
  var style = document.createElement('style');
  // Note: Edge supports WOFF2
  style.innerHTML =
    '@font-face {' +
    'font-family: Open Sans;' +
    'font-style: normal;' +
    'src:' +
    'url(' + themeRoot + '/fonts/opensans-regular-hint-all.woff2) format("woff2"),' +
    'url((' + themeRoot + '/fonts/opensans-regular-hint-all.woff) format("woff");' +
    '}' +
    '@font-face {' +
    'font-family: Open Sans;' +
    'font-style: italic;' +
    'src:' +
    'url(' + themeRoot + '/fonts/opensans-italic-hint-all.woff2) format("woff2"),' +
    'url((' + themeRoot + '/fonts/opensans-italic-hint-all.woff) format("woff");' +
    '}' +
    '@font-face {' +
    'font-family: Open Sans;' +
    'font-style: normal;' +
    'font-weight: 700;' +
    'src:' +
    'url(' + themeRoot + '/fonts/opensans-bold-hint-all.woff2) format("woff2"),' +
    'url(' + themeRoot + '/fonts/opensans-bold-hint-all.woff) format("woff");' +
    '}';
  document.head.appendChild(style);
}
