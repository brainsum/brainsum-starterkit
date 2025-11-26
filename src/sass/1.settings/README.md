# Settings

Setting files contain **global** configurations that are shared by more than
one module.

Those settings that are connected to only a specific module they are must
be a part of that module itself.

Local configurations should be contained by the related modules (objects,
components, etc.) where they are related to.

**IMPORTANT! These global settings are imported by `_settings.scss` Sass
file. All Sass file from 3.base level you have to import this importer file
first of all!**
