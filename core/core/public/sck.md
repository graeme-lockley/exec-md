# String Calculator Kata

I enjoy the [String Calculator Kata](https://osherove.com/tdd-kata-1) and have seen many implementations done by a range of skilled people.  I love it when peeps perform this kata as a live coding experience; if you have not attempted this as a live coding experience then give it a go.  You will be surprised how doing so tends to cause your brain to turn to mush and you quickly become self-conscious concerning your typing skills.

This version of the kata will be a little different in that I am showing off a single implementation written as this note.  As I have developed this note I have constantly gone back and refactored the note so that it can be read once as a coherent narrative.

This implementation has several of features that make it quite cool:

- The tests are written as generative tests - in other words, these tests generate data and validate that `add` returns the expected results based on this data.
- The tests are reactive meaning that variables can be changed and the entire test suite is automatically re-run.

## `add`

This section is the actual `add` function and the function under test.  Rather than squashing all code into a single function this code is split out into multiple functions.  This splitting out has the benefit of allowing me to add some narrative around the embedded functions and attaching simple tests to verify and demonstrate behavior.

``` js x | pin | export
add = (input) => {
    const tokens = input.startsWith("//[") ? tokenizeMultiCharacters(input)
        : input.startsWith("//") ? split(input.slice(4), input[2])
        : split(input, /[,\n]/);

    const numbers = tokens.map(t => parseInt(t));

    if (numbers.some(isNegative))
        throw numbers.filter(isNegative).join(", ")
    else
        return sum(numbers);
}
```

``` js x | pin
tokenizeMultiCharacters = (input) => {
  const indexOfNewline =
    input.indexOf("\n");

  const escapeRE = text =>
    text.replace(/[*+|(){}\\.^$?]/g, "\\$&");

  const separators =
    input
      .substr(3, indexOfNewline - 4)
      .split("][")
      .sort((x, y) => y.length - x.length)
      .map(escapeRE)
      .join("|");

  return split(input.slice(indexOfNewline + 1), new RegExp(separators));
}
```

The split function deals with the *empty string* scenario.  This scenario is relevant to all scenarios and not just *comma or newline separators* but also *custom single character* and *multiple multi-character*.

``` js x | pin
split = (input, separators) => 
    input === "" 
        ? []
        : input.split(separators)
```

``` js x | pin
isNegative = (n) => n < 0;
```

``` js x | pin
sum = (ns) =>
	ns.reduce((x, y) => x + y, 0)
```

``` js x assert Sum over an empty lists returns 0 | pin
sum([]) === 0
```

``` js x assert Sum over a single element list returns that value | pin
sum([1]) === 1
```

``` js x assert Sum over a multiple elements within a list returns their sum | pin
sum([1, 2, 3]) === 6
```

## Test Scenarios

Before we layout the individual tests we need a handful of generators.

### Generators

Firstly we need a generator to give us an endless supply of integers - well they are not actually integers but rather integer values in the range ${tex`-1500...1500`}.

``` js x
INTEGERS = integerInRange(-1500, 1500)
```

``` js x view
{
  const content = Array(50).fill(0).map((_, i) => ({x: i + 1, y: INTEGERS()}));

  return Plot.plot({
    marks: [
      Plot.ruleY([0]),
      Plot.barY(content, {x: "x", y: "y", fill: "#bab0ab"})
    ], 
    y: {
      grid: true,
      label: null
    },
    x: {
      label: null
    },
    width: width,
    height: 250
  })
}
```

Secondly we require a generator that provides positive integers only.  As above this is limited to the range ${tex`0 \dots 1500`}.

``` js x
POSITIVE_INTEGERS = integerInRange(0, 1500)
```

``` js x view
{
  const content = Array(50).fill(0).map((_, i) => ({x: i + 1, y: POSITIVE_INTEGERS()}));

  return Plot.plot({
    marks: [
      Plot.ruleY([0]),
      Plot.barY(content, {x: "x", y: "y", fill: "#bab0ab"})
    ], 
    y: {
      grid: true,
      label: null
    },
    x: {
      label: null
    },
    width: width,
    height: 250
  })
}
```

Thirdly we need a generator for valid single character separators.

``` js x | pin
SEPARATORS = 
    filter(map(integerInRange(0, SEPARATOR_UPPER_RANGE), c => String.fromCharCode(c)), c => "0123456789-\n[".indexOf(c) === -1)
```

``` js x view
SEPARATOR_UPPER_RANGE = 
    Inputs.range([0, 65535], {value: 255, step: 1, label: "Upper separator range"})
```

``` js x
Array(100).fill(0).map(SEPARATORS)
```

We can use this generator to create a multi-character separator.

``` js x | pin
MULTI_CHARACTER_SEPARATORS = 
    map(nonEmptyListOf(SEPARATORS), (seps) => seps.join(''))
```

``` js x
Array(100).fill(0).map(MULTI_CHARACTER_SEPARATORS)
```

We can use this one again to create a non-empty list of multi-character separators.

``` js x | pin
LIST_OF_MULTI_CHARACTER_SEPARATORS = 
    nonEmptyListOf(MULTI_CHARACTER_SEPARATORS)
```
``` js x
Array(100).fill(0).map(LIST_OF_MULTI_CHARACTER_SEPARATORS)
```

Finally we have a collection of list generators.

``` js x | pin
LIST_OF_POSITIVE_INTEGERS =
    listOf(POSITIVE_INTEGERS)
```
``` js x | pin
LIST_OF_INTEGERS_WITH_ONE_NEGATIVE =
    filter(listOf(INTEGERS), ns => ns.filter(isNegative).length > 0)
```

### Scenarios

``` js x assert Comma or newline separated string of positive integers will return the sum | pin
forall(LIST_OF_POSITIVE_INTEGERS, (ns) =>
    add(joinString(ns, [",", "\n"])) === sum(ns)
)
```

``` js x assert Positive integers separated with a custom single character separator returns the sum | pin
forall2(LIST_OF_POSITIVE_INTEGERS, SEPARATORS, (ns, sep) =>
    add(`//${sep}\n${joinString(ns, [sep])}`) === sum(ns)
)
```

``` js x assert Integers with at least one negative should throw an exception listing all of the negatives | pin
forall(LIST_OF_INTEGERS_WITH_ONE_NEGATIVE, (ns) =>
    catchException(() => add(ns.join(","))) === ns.filter(n => n < 0).join(", ")
)
```

``` js x assert Positive integers separated with multiple multi-character separator should return the sum | pin
forall2(LIST_OF_POSITIVE_INTEGERS, LIST_OF_MULTI_CHARACTER_SEPARATORS, (ns, seps) =>
    add(`//[${seps.join('][')}]\n${joinString(ns, seps)}`) === sum(ns)
)
```

The function `joinString` is a useful helper accepting a list of values (`ns`) and a list of separators (`seps`) returning a string composed by joining all of the values together whilst randomly choosing an element from the separators and placing it between every two elements

``` js x | pin
joinString = (ns, seps) =>
	ns.length === 0 ? ""
	: ns.length === 1 ? ns[0].toString()
    : ns[0].toString() + ns.slice(1).map(v => seps[integerInRange(0, seps.length - 1)()] + v.toString()).join("")
```

## Generative Testing Framework

The following are the functions that collectively make up the generative testing framework.  A generator is a [thunk](https://en.wikipedia.org/wiki/Thunk) which, when invoked, will return a value.  Using the function `integerInRange` we can create a thunk called `numbers` which, when called, will return a value in the range 0 to 1000 inclusive:

``` js x | pin
numbers = 
    integerInRange(0, 1000)
```

To show how this can work we can call this generator 20 times and get a list of random numbers:

``` js x | pin
Array(DEFAULT_LIST_LENGTH).fill(0).map(numbers)
```

Returning to `integerInRange` it produces a thunk which, when called, will return a random number in the inclusive range of the passed arguments.

``` js x | pin
integerInRange = (min, max) =>
	() => Math.floor(Math.random() * (max - min + 1)) + min
```

From that we can define the `forall` function which accepts a generator and a predicate.  This function produces ${TEST_ITERATIONS} value(s) using `gen` and then applies this value to the predicate `p`.  If this application returns `false` then an exception is thrown otherwise this function returns `true`.

``` js x | pin
forall = (gen, p) => {
  let lp = 0;
  while (lp < TEST_ITERATIONS) {
    const v = gen();
    if (!p(v))
      throw new Error(v);
    
    lp += 1;
  }
  
  return true;
}
```

``` js x | pin
forall2 = (gen1, gen2, p) => {
  let lp = 0;
  while (lp < TEST_ITERATIONS) {
    const v1 = gen1();
    const v2 = gen2();
    if (!p(v1, v2))
      throw new Error([v1, v2]);
    
    lp += 1;
  }
  
  return true;
}
```

### Composition Functions

We are now able to produce a collection of generator composition functions.

Given a generator, `listOf` and `nonEmptyListOf` will return a generator which, when applied, will return a list consisting of at least 0 or 1 and at most ${DEFAULT_LIST_LENGTH} elements.  Each element is created using the passed generator.

``` js x | pin
listOf = (gen) =>
  () => {
    const length = integerInRange(0, DEFAULT_LIST_LENGTH)();
    return Array(length).fill(0).map(gen);
  }
```

``` js x | pin
nonEmptyListOf = (gen) =>
  () => {
    const length = integerInRange(1, DEFAULT_LIST_LENGTH)();
    return Array(length).fill(0).map(gen);
  }
```

Given a generator and a mapping function, `map` will transform each generated value using the mapping function.

``` js x | pin
map = (gen, f) =>
  () => f(gen())
```

Given a generator and a predicate, `filter` will produce values from the generator which return true when applied to the predicate.

``` js x | pin
filter = (gen, p) => 
  () => {
    let lp = 0;
    while (true) {
      const result = gen();
      if (p(result))
        return result;

      lp += 1;
      if (lp > 100) {
        throw new Error("Filter failed: too many iterations");
      }
    }
  }
```

### Helper Functions

Given a thunk, `catchException` will call the thunk, catch any exceptions that the thunk raises and returns the exception.  It has the added feature that if the thunk did not raise an exception then it'll raise it's owns exception.

``` js x | pin
catchException = (thunk) => {
  try {
    thunk();
    throw new Error("No exception raised in catchException");
  } catch (e) {
    return e;
  }
}
```

``` js x view
DEFAULT_LIST_LENGTH = 
    Inputs.range([1, 100], {value: 10, step: 1, label: "Maximum generated list length"})
```

``` js x view
TEST_ITERATIONS = 
    Inputs.range([1, 10000], {value: 10000, step: 1, label: "Number of test iterations"})
```
