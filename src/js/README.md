# JavaScript

We write and store all **source** JavaScript files in the src/js directory. Then
sort them in different SMACSS/ITCSS categories like CSS:

- base: for very generic functions
- tools: functions to solve a specific problem but not related a component/block
- objects: very generic, layout-related functions
- components: components related functions (the most will come here)
- theme: theming related functions

For each specific site function, block, region, component or page create a script file. Then add it to `webpack.mix.js` file's babel function like for: `function.js`

```js
.babel('src/js/function.js', 'js/function.js')
```

However, Drupal will aggregate all JavaScript files, but if you need
you can merge multiple files into one with the **.babel** function:

```js
.babel(['src/js/function1.js', 'src/js/function2.js'], 'js/merged-funtions.js')
```

All globally needed/general theming purposes script could go to `base.global.js` file witch will attached to all pages.
