import { functionFromBody } from "../../plugins/KrokiX";

test("empty string returns () => ``", () => {
    const value = functionFromBody("");

    expect(value.names).toEqual([]);
    expect(value.body).toEqual("() => ``");
});

test("an arbitrary string returns thunk mapping onto the string", () => {
    const value = functionFromBody("hello world");

    expect(value.names).toEqual([]);
    expect(value.body).toEqual("() => `hello world`");
});

test("an arbitrary string with ${} expressions with no free variables returns thunk mapping onto the string with embedded expressions", () => {
    const value = functionFromBody("hello ${1 + 2} ${'this' + ' ' + 'works'} world");

    expect(value.names).toEqual([]);
    expect(value.body)
        .toEqual("() => `hello ${1 + 2} ${'this' + ' ' + 'works'} world`");
});

test("an arbitrary string with ${} expressions with free variables returns a function with the free variables passed as arguments", () => {
    const value = functionFromBody("hello ${a + b} ${b + c} world");

    expect(value.names).toEqual(['a', 'b', 'c']);
    expect(value.body)
        .toEqual("(a, b, c) => `hello ${a + b} ${b + c} world`");
});

test("an arbitrary string with an parse error in a ${} expression", () => {
    const value = functionFromBody("hello ${a + } world");

    expect(value.names).toEqual([]);
    expect(value.body)
        .toEqual("() => `hello {SyntaxError: Unexpected end of input (1:4)} world`");
});

test("escape literal strings that have a \\ so that the backslash is not lost", () => {
    expect(functionFromBody("\\n").body)
        .toEqual("() => `\\\\n`");
});
