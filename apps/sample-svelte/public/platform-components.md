# Platform Components

This notebook contains a collection of SVG based platform components.  A couple of points about this notebook:

- The intention of this notebook it to create components that can be used in other notebooks,
- This notebook has embedded a number of examples to show how each of the different components can be used,
- Reusable components are exposed as functions, and
- Each function updates `height`, `width` and `viewBox` attributes attached to `svg` making sure that the component is visible.

## Application

``` js x
widthOfApplication = (application, options) =>
    application.width || options.applicationWidth;
```

``` js x
heightOfApplication = (application, options) =>
    application.height || options.applicationHeight;
```

``` js x
widthOfApplications = (applications, options) =>
    applications.length === 0 
        ? options.applicationWidth 
        : Math.max(...(applications.map(application => widthOfApplication(application, options))))
```

``` js x
heightOfApplications = (applications, options) =>
    applications.length === 0 
        ? options.applicationHeight
        : Math.max(...(applications.map(application => heightOfApplication(application, options))))
```

``` js x
applicationInto = (svg, x, y, application, options) => {
    options = Object.assign({}, defaultOptions, options || {});

    const name = application.name || options.applicationName;
    const applicationWidth = widthOfApplication(application, options);
    const applicationHeight = application.height || options.applicationHeight;
    const applicationFill = application.fill || options.applicationFill;
    const applicationRadius = application.radius || options.applicationRadius;
    const applicationFont = application.nameFont || options.applicationNameFont;

    svg.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", applicationWidth)
        .attr("height", applicationHeight)
        .attr("rx", applicationRadius)
        .attr("ry", applicationRadius)
        .attr("fill", applicationFill);

    svg.append("text")
        .attr("x", x + applicationWidth / 2)
        .attr("y", y + applicationHeight / 2)
        .attr("font-size", applicationFont)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(name);

    const vb = [x, y, x + applicationWidth, y + applicationHeight];
    mergeViewBoxInto(svg, vb);
    return vb;
}
```

So here are a few application examples with the code exposed:

``` js x | pin
{
    const svg = d3.create("svg");

    applicationInto(svg, 0, 0, {name: "Application", fill: "lightgreen"});
    applicationInto(svg, 105, 0, {name: "Other Application"});
    applicationInto(svg, 210, 0, {name: "Yet Another Application With Long Name", width: 250});

    return svg.node();
}
```

## Platform

``` js x
platformInto = (svg, x, y, platform, options) => {
    options = Object.assign({}, defaultOptions, options || {});

    const applications = platform.applications || [];
    const platformDepth = platform.depth || options.platformDepth;
    const numberOfColumns = Math.floor((applications.length + platformDepth - 1) / platformDepth);

    const name = platform.name || options.platformName;
    const padding = platform.padding || options.platformPadding;
    const applicationWidth = widthOfApplications(applications, options);
    const applicationHeight = heightOfApplications(applications, options);
    const platformWidth = Math.max(platform.width || options.platformWidth, numberOfColumns * (applicationWidth + padding) - padding);
    const platformHeight = platform.height || options.platformHeight;
    const platformFill = platform.fill || options.platformFill;
    const platformRadius = platform.radius || options.platformRadius;
    const platformFont = platform.nameFont || options.platformNameFont;

    svg.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", platformWidth)
        .attr("height", platformHeight)
        .attr("rx", platformRadius)
        .attr("ry", platformRadius)
        .attr("fill", platformFill);

    svg.append("text")
        .attr("x", x + platformWidth / 2)
        .attr("y", y + platformHeight / 2)
        .attr("font-size", platformFont)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(name);

    let vb = [x, y, x + platformWidth, y + platformHeight]   
    mergeViewBoxInto(svg, vb);

    const layout = topDownBlockLayout(x, vb[3] + padding, applicationWidth, applicationHeight, padding, platformDepth, applications.length);

    applications.forEach((application, index) => {
        const pos = layout.position(index);
        vb = combineViewBox(vb, applicationInto(svg, pos[0], pos[1], application, options));
    });

    return vb;
}
```

So here are a few application examples with the code exposed:

``` js x | pin
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

## Helpers

``` js x
defaultOptions = {
    return {
        applicationWidth: 100,
        applicationHeight: 50,
        applicationName: 'Application',
        applicationFill: 'lightgrey',
        applicationNameFont: '12px',
        applicationRadius: '10',

        platformWidth: 100,
        platformHeight: 50,
        platformName: 'Platform',
        platformFill: 'lightgrey',
        platformNameFont: '12px',
        platformRadius: 0,
        platformPadding: 5,
        platformDepth: 6
    }
}
```

``` js x
combineViewBox = (vb1, vb2) =>
    [ Math.min(vb1[0], vb2[0])
    , Math.min(vb1[1], vb2[1])
    , Math.max(vb1[2], vb2[2])
    , Math.max(vb1[3], vb2[3])
    ];
```

``` js x
mergeViewBoxInto = (svg, viewbox) => {
    const vb = svg.attr("viewBox");

    const attachViewBox = (viewbox) =>
        svg .attr("viewBox", viewbox)
            .attr("width", viewbox[2] - viewbox[0] + 1)
            .attr("height", viewbox[3] - viewbox[1] + 1);

    const parseViewBox = (vb) =>
        vb.split(",").map(t => parseInt(t));

    if (vb)
        attachViewBox(combineViewBox(parseViewBox(vb), viewbox));
    else
        attachViewBox(viewbox);
}
```

The following functions calculate block layouts.  The first uses a top-down strategy whilst the second uses a left-right strategy.

``` js x
topDownBlockLayout = (startX, startY, blockWidth, blockHeight, padding, columnDepth, numberOfBlocks) => {
    if (columnDepth < 1)
        throw {error: 'columnDepth < 1', function: 'topDownBlockLayout', value: columnDepth};

    const numberOfColumns = Math.floor((numberOfBlocks + columnDepth - 1) / columnDepth);
    const numberOfRows = Math.min(numberOfBlocks, columnDepth);
    const width = numberOfColumns * (blockWidth + padding) - padding;
    const height = numberOfRows * (blockHeight + padding) - padding;

    return {
        numberOfColumns,
        numberOfRows,
        width,
        height,

        viewbox: [startX, startY, width + startX, height + startY],

        position: (i) => {
            const column = Math.floor(i / columnDepth);
            const row = i % columnDepth;

            const xPos = (column * (blockWidth + padding)) + startX;
            const yPos = (row * (blockHeight + padding)) + startY;

            return [xPos, yPos, xPos + blockWidth, yPos + blockHeight];
        }
    };
}
```

``` js x
leftRightBlockLayout = (startX, startY, blockWidth, blockHeight, padding, rowWidth, numberOfBlocks) => {
    if (rowWidth < 1)
        throw {error: 'rowWidth < 1', function: 'leftRightBlockLayout', value: rowWidth};

    const numberOfColumns = Math.min(numberOfBlocks, rowWidth);
    const numberOfRows = Math.floor((numberOfBlocks + rowWidth - 1) / rowWidth);
    const width = numberOfColumns * (blockWidth + padding) - padding;
    const height = numberOfRows * (blockHeight + padding) - padding;

    return {
        numberOfColumns,
        numberOfRows,
        width,
        height,

        viewbox: [startX, startY, width + startX, height + startY],

        position: (i) => {
            const column = i % rowWidth;
            const row = Math.floor(i / rowWidth);

            const xPos = (column * (blockWidth + padding)) + startX;
            const yPos = (row * (blockHeight + padding)) + startY;

            return [xPos, yPos, xPos + blockWidth, yPos + blockHeight];
        }
    };
}
```

Now let's put these algorithms through their paces.  Using the sliders watch the layout in action.

``` js x view
algorithmChoice = Inputs.radio(["left to right", "top down"], {label: "Flavor", value: "top down"})
```

``` js x view
numberOfBlocks = Inputs.range([0, 50], {value: 10, step: 1, label: "Number of blocks"})
```

``` js x view
blocksPerColumn = Inputs.range([1, 15], {value: 4, step: 1, label: "Blocks per column"})
```

``` js x view
paddingBetweenBlocks = Inputs.range([0, 15], {value: 5, step: 1, label: "Padding"})
```

``` js x
{
    const svg = d3.create("svg");

    const blocks = Array(numberOfBlocks).fill(0).map((_, i) => `${i}`);
    const layout = 
        algorithmChoice === "left to right" 
            ? leftRightBlockLayout(0, 0, 30, 20, paddingBetweenBlocks, blocksPerColumn, numberOfBlocks)
            : topDownBlockLayout(0, 0, 30, 20, paddingBetweenBlocks, blocksPerColumn, numberOfBlocks);

    svg.append("rect")
        .attr("x", layout.viewbox[0])
        .attr("y", layout.viewbox[1])
        .attr("width", layout.width)
        .attr("height", layout.height)
        .attr("fill", "grey");

    blocks.forEach((block, i) => {
        const pos = layout.position(i);

        svg.append("rect")
            .attr("x", pos[0])
            .attr("y", pos[1])
            .attr("width", 30)
            .attr("height", 20)
            .attr("fill", "lightgrey");

        svg.append("text")
            .attr("x", (pos[0] + pos[2]) / 2)
            .attr("y", (pos[1] + pos[3]) / 2)
            .attr("font-size", "10pt")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text(block);
    });

    mergeViewBoxInto(svg, layout.viewbox);

    return svg.node();
}
```
