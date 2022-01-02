# Nested Import

This page illustrates and validates the importing of a notebook where that notebook itself has imports in it.

The basic import flow is

``` kroki x blockdiag
blockdiag {
  "nested-import.md" -> "simple.md" -> "basic.md";
} 
```

``` js x | pin
import { arbList, createList, listLength } from "./simple.md"
```

``` js x | pin
arbList
```

``` js x | pin
listLength
```

``` js x | pin
createList(5)
```

``` js x | pin
{
    return {arbList, createList, listLength};
}
```

Finally let's show off a more complex example - pulling in the platform view where the individual views are created in a library.  Note that the import statement is invisible - this is intentional as it is marked with *hide* so that it is only visible in the event of an error.

```js x
{
    const svg = d3.create("svg");

    const applications = () => Array(Math.floor(Math.random() * 15)).fill(0).map((_, i) => ({name: `Application ${i}`}));

    const things = [ 
        (x, y) => platformInto(svg, x, y, {name: "Platform", fill: "lightgreen", applications: applications()}),
        (x, y) => platformInto(svg, x, y, {name: "Other Platform", applications: applications()}),
        (x, y) => platformInto(svg, x, y, {name: "Yet Another Platform With Long Name", width: 250, applications: applications()}),
        (x, y) => platformInto(svg, x, y, {name: "Complex Platform", applications: applications()})
    ];

    let vb = [0, 0, 0, 0];
    things.forEach(thing => {
        vb = thing(vb[2] + 5, vb[1]);
    })

    return svg.node();
}
```

``` js x | hide
import { platformInto } from "./platform-components.md"
```
