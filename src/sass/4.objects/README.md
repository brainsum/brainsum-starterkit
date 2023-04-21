# Objects

Class-based selectors which define undecorated design patterns, for example
media object known from OOCSS. They provide structure to your content, do
not contain any cosmetic CSS, and they should never have been directly
overwritten.

This is the first layer in which we find class-based selectors. These are
concerned with styling non-cosmetic design patterns, or 'objects'. Objects
can range from something as simple as a .wrapper element, to layout systems,
through to things.

This is an ITCSS category but this should be the layer level
in SMACCS.

All Sass files will begin without an underscore, so don't forget to add each
of them to the libraries yaml file as **layout** SMACSS level.
