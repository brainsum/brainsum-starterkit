# Settings

Setting files contain **global** configurations that are shared by more than
one modules.

Settings that are connected to one and only module are a part of the module
itself.

Local configurations should be contained into the modules (objects,
components, etc.) that are related to.

**IMPORTANT! These global settings are imported by `_global.importer.scss` Sass
file. All Sass file begin with 3.base level have to import this importer file
first of all!**
