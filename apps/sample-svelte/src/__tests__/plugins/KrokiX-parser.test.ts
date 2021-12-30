import { parse } from "../../plugins/KrokiX";

test("empty string returns ['']", () => {
    expect(parse("")).toEqual(['']);
});

test("an arbitrary string returns that string in an array", () => {
    expect(parse("hello world")).toEqual(['hello world']);
});

test("a string with simple expressions returns an array of before expression, expression and after expression", () => {
    expect(parse('hello ${1 + 2} world')).toEqual(['hello ', '1 + 2', ' world']);
    expect(parse('${1 + 2} world')).toEqual(['', '1 + 2', ' world']);
    expect(parse('hello ${1 + 2}')).toEqual(['hello ', '1 + 2', '']);
    expect(parse('hello ${1 + 2}${3 + 4} ${5 + 6}')).toEqual(['hello ', '1 + 2', '', '3 + 4', ' ', '5 + 6', '']);
});

test("a string with expressions containing a nested Javascript expression considers the nesting of curly brackets", () => {
    expect(parse('hello ${({a: 1, b: 2})} world')).toEqual(['hello ', '({a: 1, b: 2})', ' world']);
});

test("a string with expressions containing a backtick", () => {
    expect(parse('hello ${tex`E = mc^{20}`} world')).toEqual(['hello ', 'tex`E = mc^{20}`', ' world']);
});
