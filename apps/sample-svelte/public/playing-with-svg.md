# Playing around with SVG


``` js x
{
    const svg = d3.create("svg")
              .attr("viewBox", [0, 0, 400, 200]).attr("width", 400).attr("height", 200);

    const rect = (x, y, width, height) =>         
        svg.append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "red");

    const text = (x, y, t, r) =>
        svg.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("font-size", "12pt")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("transform", `rotate(${r}, ${x}, ${y})`)
            .text(t);

    rect(0, 0, 200, 100);
    rect(200, 100, 200, 100);

    const angles = [...Array(8).keys()].map(n => n * 25);

    svg.append("g")
            .attr("font-size", "15pt")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
        .selectAll("text")
        .data(angles)
        .join("text")
            .attr("x", 200)
            .attr("y", 100)
            .attr("transform", (r) => `rotate(${r}, 200, 100)`)
            .text("Hello world");

   return svg.node();
}
```

${application("Fred", "tomato")}

${application("Fred", "tomato")}
${application("Fred", "tomato")}
${application("Fred")}

``` js x
application = (name, colour = "lightgrey") => {
    const width = 100;
    const height = 50;
    const radius = 10;

    const svg = d3.create("svg")
        // .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height);

    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("rx", radius)
        .attr("ry", radius)
        .attr("fill", colour);

    svg.append("text")
        .attr("x", width/2)
        .attr("y", height/2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "12pt")
        .text(name);

    return svg.node();    
}
```

``` js x
platform = [{
    name: 'Platform 1',
    applications: [{
        name: 'Application 1',
        color: 'lightgreen'
    }, {
        name: 'Application 2',
        color: 'lightgreen'
    }, {
        name: 'Application 3',
        color: 'lightgreen'
    }, {
        name: 'Application 4',
        color: 'lightgreen'
    }, {
        name: 'Application 5',
        color: 'lightgreen'
    }, {
        name: 'Application 6',
        color: 'lightgreen'
    }, {
        name: 'Application 7',
        color: 'lightgreen'
    }, {
        name: 'Application 8',
        color: 'lightgreen'
    }, {
        name: 'Application 9',
        color: 'lightgreen'
    }, {
        name: 'Application 10',
        color: 'lightgreen'
    }, {
        name: 'Application 11',
        color: 'lightgreen'
    }]
}][0];
```

``` js x view
applicationsPerColumn = Inputs.range([1, 15], {value: 4, step: 1, label: "Applications per column"})
```

${renderPlatform(platform)}

``` js x
renderPlatform = (platform) => {
    const width = 100;
    const height = 50;
    const radius = 10;
    const padding = 5;

    const numberOfColumns = Math.floor((platform.applications.length + applicationsPerColumn - 1) / applicationsPerColumn);

    const horizontalWidth = (n) =>
        n * (width + padding);
        
    const verticalHeight = (n) =>
        n * (height + padding);

    const posX = (n) =>
        horizontalWidth(n % numberOfColumns);

    const posY = (n) =>
        verticalHeight(1 + Math.floor(n / numberOfColumns));

    const viewHeight = Math.max(...platform.applications.map((_, i) => posY(i))) + padding + height;
    const svg = d3.create("svg")
        .attr("width", horizontalWidth(numberOfColumns))
        .attr("height", viewHeight);

    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", horizontalWidth(numberOfColumns) - padding)
        .attr("height", height)
        .attr("fill", "lightgreen");

    const label = (x, y, text, fontSize = "12pt") =>   
        svg.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("font-size", "12pt")
            .text(text);

    const application = (x, y, text, color) => {
        svg.append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", width)
            .attr("height", height)
            .attr("rx", radius)
            .attr("ry", radius)
            .attr("fill", color);

        label(x + width/2, y + height/2, text, "10pt")
    }

    label(horizontalWidth(numberOfColumns)/2, height/2, platform.name);

    platform.applications.forEach((app, i) => {
        application(posX(i), posY(i), app.name, app.color);
    });

    return svg.node();
}
```
