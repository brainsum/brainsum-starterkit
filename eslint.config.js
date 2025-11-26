import globals from 'globals';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jsdocPlugin from 'eslint-plugin-jsdoc';

export default [
  // Global ignores (replaces .eslintignore)
  {
    ignores: ['js/**/*', 'node_modules/**/*']
  },
  // ESLint recommended rules
  js.configs.recommended,
  // Prettier config to disable conflicting rules
  prettier,
  // Main configuration
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // Drupal core globals (matching Drupal 11)
        Backbone: 'readonly',
        CKEDITOR: 'readonly',
        CKEditor5: 'readonly',
        Cookies: 'readonly',
        Drupal: 'readonly',
        drupalSettings: 'readonly',
        drupalTranslations: 'readonly',
        domready: 'readonly',
        jQuery: 'readonly',
        _: 'readonly',
        matchMedia: 'readonly',
        Modernizr: 'readonly',
        once: 'readonly',
        htmx: 'readonly',
        loadjs: 'readonly',
        Shepherd: 'readonly',
        Sortable: 'readonly',
        tabbable: 'readonly',
        transliterate: 'readonly',
        bodyScrollLock: 'readonly',
        FloatingUIDOM: 'readonly'
      }
    },
    plugins: {
      import: importPlugin,
      jsdoc: jsdocPlugin
    },
    settings: {
      jsdoc: {
        tagNamePreference: {
          returns: 'return',
          property: 'prop'
        }
      }
    },
    rules: {
      // Custom rules matching Drupal 11 core
      'consistent-return': 'off',
      'no-underscore-dangle': 'off',
      'max-nested-callbacks': ['warn', 3],
      'import/no-mutable-exports': 'warn',
      'no-plusplus': [
        'warn',
        {
          allowForLoopAfterthoughts: true
        }
      ],
      'no-param-reassign': 'off',
      'no-prototype-builtins': 'off',
      'no-unused-vars': 'warn',
      'operator-linebreak': [
        'error',
        'after',
        { overrides: { '?': 'ignore', ':': 'ignore' } }
      ],
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
          optionalDependencies: false,
          peerDependencies: false
        }
      ],
      'no-multi-spaces': [
        'error',
        {
          exceptions: {
            ImportDeclaration: true,
            VariableDeclarator: true,
            Property: true
          }
        }
      ],
      // JSDoc rules (matching Drupal 11 core)
      'jsdoc/require-returns': 'off',
      'jsdoc/require-returns-type': 'warn',
      'jsdoc/require-returns-description': 'warn',
      'jsdoc/require-returns-check': 'warn',
      'jsdoc/require-param': 'warn',
      'jsdoc/require-param-type': 'warn',
      'jsdoc/require-param-description': 'warn',
      'jsdoc/check-param-names': 'warn',
      'jsdoc/valid-types': 'warn',
      'jsdoc/require-param-name': 'warn',
      'jsdoc/check-tag-names': 'warn'
    }
  }
];
