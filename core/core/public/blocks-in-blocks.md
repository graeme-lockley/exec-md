# Blocks in Blocks 

This diagram is a helpful blocks-on-blocks layout typical of many architecture diagrams.

Firstly the model is represented as array of components which, in this case, are called ${model.map(m => m.name).join(", ")}.  Each component has a name, a color and an array of sub-components.  The rendering of this model is only the top level and one level down.

``` kroki x pikchr
scale = 0.75
$separator = 0.1
$sub_category_width = 1.2
$sub_category_height = 0.3
$sub_components_per_line = ${subComponentsPerLine}
$margin_width = 0.12
${model.map((component, index) => {
    const result = [];

    if (index === 0)
        result.push(`L0: box height ($sub_category_height + $separator) * (1 + ${Math.floor((component.components.length-1) / subComponentsPerLine)}) - $separator width $margin_width invisible`);
    else
        result.push(`L${index}: box with .nw at L${index - 1}.sw-(0, $separator*3) height ($sub_category_height + $separator) * (1 + ${Math.floor((component.components.length-1) / subComponentsPerLine)}) - $separator width $margin_width invisible`);
    result.push(`line invisible from previous.sw to previous.nw "${component.name}" small small aligned`);

    component.components.forEach((sc, index2) => {
        if (index2 === 0)
            result.push(`A${index}S: box with .nw at L${index}.ne "${sc.name}" fill ${sc.color} height $sub_category_height width $sub_category_width`);
        else {
            if (index2 % subComponentsPerLine === 0)
                result.push('line from last.c to last.c-(($sub_components_per_line - 1) * ($sub_category_width + $separator) + $sub_category_width / 2, $separator+$sub_category_height) invisible');
            else
                result.push('line $separator invisible');
            result.push(`box same "${sc.name}" fill ${sc.color}`);
        }
    });
    result.push(`box with .nw at L${index}.nw-($separator, -$separator) \\`);
    result.push('  width $sub_components_per_line*($sub_category_width + $separator)+$separator*3 \\');
    result.push(`  height ($sub_category_height + $separator) * (1 + ${Math.floor((component.components.length-1) / subComponentsPerLine)}) + $separator \\`);
    result.push(`  fill ${component.color} behind A0S`);

    return result.join("\n");
}).join("\n")}
```

``` js x view
subComponentsPerLine = Inputs.range([1, 10], {value: 4, step: 1, label: "Sub components"})
```

``` js x
model = [
    {
        name: 'Category A',
        color: 'lightyellow',
        components: [
            {
                name: 'Component A',
                color: 'lightgreen'
            },
            {
                name: 'Component B',
                color: 'lightgray'
            },
            {
                name: 'Component C',
                color: 'lightgreen'
            },
            {
                name: 'Component D',
                color: 'tomato'
            },
            {
                name: 'Component E',
                color: 'gold'
            },
        ]
    },
    {
        name: 'Category B',
        color: 'lightyellow',
        components: [
            {
                name: 'Component I',
                color: 'lightgray'
            },
            {
                name: 'Component II',
                color: 'lightgray'
            },
            {
                name: 'Component III',
                color: 'lightgray'
            },
            {
                name: 'Component IV',
                color: 'lightgray'
            },
            {
                name: 'Component V',
                color: 'lightgray'
            },
        ]
    },
    {
        name: 'Category C',
        color: 'lightyellow',
        components: [
            {
                name: 'Alpha',
                color: 'lightgray'
            },
            {
                name: 'Beta',
                color: 'lightgray'
            },
            {
                name: 'Gamma',
                color: 'lightgray'
            },
            {
                name: 'Delta',
                color: 'lightgray'
            },
            {
                name: 'Epsilon',
                color: 'lightgray'
            },
            {
                name: 'Zeta',
                color: 'lightgray'
            },
            {
                name: 'Eta',
                color: 'lightgray'
            },
            {
                name: 'Theta',
                color: 'lightgray'
            },
            {
                name: 'Iota',
                color: 'lightgray'
            },
        ]
    }
]
```
