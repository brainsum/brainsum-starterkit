// Customized — only watch compiled theme assets.
// Remove '#ddev-generated' to prevent DDEV from overwriting this file.
let url = process.env.DDEV_HOSTNAME;
let nonSslUrl = process.env.DDEV_PRIMARY_URL.replace(/^https:/, 'http:');

module.exports = {
  files: [
    'web/themes/custom/brainsum_starterkit/css/**/*.css',
    'web/themes/custom/brainsum_starterkit/js/**/*.js',
    'web/themes/custom/brainsum_starterkit/templates/**/*.twig'
  ],
  ignore: ['node_modules'],
  open: false,
  ui: false,
  server: false,
  proxy: {
    target: nonSslUrl
  },
  host: url
};
