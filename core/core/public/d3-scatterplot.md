# D3 Scatterplot

A good starting point for many two-dimensional charts with x and y axes.

``` js x view | pin
chart = {
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);

  svg.append("g")
    .selectAll("circle")
    .data(data)
    .join("circle")
      .filter(d => d.body_mass_g)
      .attr("cx", d => x(d.flipper_length_mm))
      .attr("cy", d => y(d.body_mass_g))
      .attr("r", 4);

  return svg.node();
}
```

``` js x | pin
data = load("penguins.csv").csv({typed: true})
```

``` js x | pin
height = 400
```

``` js x | pin
x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.flipper_length_mm)).nice()
    .range([margin.left, width - margin.right])
```

``` js x | pin
y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.body_mass_g)).nice()
    .range([height - margin.bottom, margin.top])
```

``` js x | pin
xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
```

``` js x | pin
yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
```

<!-- margin = ({top: 25, right: 20, bottom: 35, left: 40}) -->
``` js x | pin
margin = {
    const result = {};

    result.top = 25;
    result.right = 20;
    result.bottom = 35;
    result.left = 40;

    return result;
}
```

``` js x | pin
width
```

