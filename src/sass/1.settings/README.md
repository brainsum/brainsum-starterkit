# Settings

Setting files contain **global** configurations that are shared by more than
one module.

Those settings that are connected to only a specific module they are must
be a part of that module itself.

Local configurations should be contained by the related modules (objects,
components, etc.) where they are related to.

It’s important not to output any CSS in the first 2 layers.*

***NOTE:** Because we mostly use CSS custom properties, what should be outputted
to a CSS file to make available for all other SASS/CSS files, we only define
them here, then create a CSS file in the base layer:
`3.base/_base.settings.scss`.
