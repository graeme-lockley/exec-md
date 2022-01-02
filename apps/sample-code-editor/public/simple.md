# Simple Reactive Components

This section contains basic reactive elements.

This is just a formatted piece of code rendered verbatim without any calculation.

``` js
century = 100
```

We can embed ${tex`\TeX`} formula into a paragraph ${tex`E=mc^{${exponent}}`} where the exponent is reactive to the below input. 

``` js x view
exponent = Inputs.range([0, 100], {value: 2, step: 1, label: "Exponent"})
```

This is a piece of code that is executed so you will see the value however it isn't pinned meaning you will be unable to see the calculation.

``` js x
value = {
    const items = [1, 2, 3, 4, 5];
    const double = (x) => x + x;

    return items.map(double);
}
```

This code is evaluated, the result displayed and the code is pinned directly below.  What's cool is this value is reactive and dependent on `value`.

``` js x | pin
{
    const square = (x) => x * x;

    return value.map(square);
}
```

The following is a [Pikchr](https://pikchr.org/home/doc/trunk/homepage.md) diagram rendered using the [Kroki](https://kroki.io) service.  Kroki houses a number of renderers which are able to produce an SVG diagram off of a textual description.

``` kroki x pikchr
    lineht *= 0.4
    $margin = lineht*2.5
    scale = 0.75
    fontscale = 1.1
    charht *= 1.15
    down
In: box "Interface" wid 150% ht 75% fill white
    arrow
CP: box same "SQL Command" "Processor"
    arrow
VM: box same "Virtual Machine"
    arrow down 1.25*$margin
BT: box same "B-Tree"
    arrow
    box same "Pager"
    arrow
OS: box same "OS Interface"
    box same with .w at 1.25*$margin east of 1st box.e "Tokenizer"
    arrow
    box same "Parser"
    arrow
CG: box same ht 200% "Code" "Generator"
UT: box same as 1st box at (Tokenizer,Pager) "Utilities"
    move lineht
TC: box same "Test Code"
    arrow from CP to 1/4<Tokenizer.sw,Tokenizer.nw> chop
    arrow from 1/3<CG.nw,CG.sw> to CP chop

    box ht (In.n.y-VM.s.y)+$margin wid In.wid+$margin \
       at CP fill 0xd8ecd0 behind In
    line invis from 0.25*$margin east of last.sw up last.ht \
        "Core" italic aligned

    box ht (BT.n.y-OS.s.y)+$margin wid In.wid+$margin \
       at Pager fill 0xd0ece8 behind In
    line invis from 0.25*$margin east of last.sw up last.ht \
       "Backend" italic aligned

    box ht (Tokenizer.n.y-CG.s.y)+$margin wid In.wid+$margin \
       at 1/2<Tokenizer.n,CG.s> fill 0xe8d8d0 behind In
    line invis from 0.25*$margin west of last.se up last.ht \
       "SQL Compiler" italic aligned

    box ht (UT.n.y-TC.s.y)+$margin wid In.wid+$margin \
       at 1/2<UT,TC> fill 0xe0ecc8 behind In
    line invis from 0.25*$margin west of last.se up last.ht \
      "Accessories" italic aligned
```

We can also add some assertions - a simple way of adding tests into notebooks.  Let's create the artificial function `add`:

``` js x | pin
add = (a, b) => {
    if (a < 0 || b < 0)
        throw new Error("Precondition failed");

    return a + b;
}
```

Now let's add some test code.  The first test hides the code whilst the following will both show the code.

``` js x assert Given positive values then we get the sum of both values back
add(1, 2) === 3
```

``` js x assert Given a negative argument then all hell breaks loose
add(-1, 2) === 1
```

``` js x assert Given a silly mistake this test will fail
add(1, 2) === 2
```

Now let's start to do something else that it is quite cool - let's input a range using a visual control from Observablehq's Input library:

``` js x view
start = Inputs.date({label: "Start date", value: "1982-03-06T02:30"})
```

``` js x view
TestIterations = Inputs.range([0, 100], {value: 20, step: 1, label: "Test Iterations"})
```

I can now link the number of random numbers in a list using the value above:

``` js x
Array(TestIterations).fill(0).map(() => (Math.random() * 100 | 0) / 100)
```

We can also load some data:

``` js x | pin
athletes = load("athletes.csv").csv({typed: true});
```

Then display that data in a table limiting the nationality to 'RSA'.

``` js x view | pin
tableRows = Inputs.table(athletes.filter(d => d.nationality === 'RSA'))
```

From this table we can then extract out the rows that were selected:

``` js x
tableRows
```

Of course we can also import variables from a notebook into this notebook.

``` js x
import { y as listLength, createList } from "./basic.md"
```

``` js x | pin
arbList = createList(listLength)
```
