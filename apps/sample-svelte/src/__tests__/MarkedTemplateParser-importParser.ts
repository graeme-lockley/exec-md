import { createRuntime } from "@execmd/runtime";
import { importMarkup } from "../core";

import hljs from "highlight.js/lib/core";
import javascript_highlighter from "highlight.js/lib/languages/javascript";

hljs.registerLanguage("js", javascript_highlighter);

test("Empty content results in an empty module", () => {
    const content = '';

    const runtime = createRuntime();
    const module = runtime.module();
    importMarkup(content, module);

    expect(module._scope.size).toEqual(0);
});

test("Content without any bindings results in an empty module", () => {
    const content = `# Heading

Some text
`;

    const runtime = createRuntime();
    const module = runtime.module();
    importMarkup(content, module);

    expect(module._scope.size).toEqual(0);
});

test("A non-executable code block is not added to the module", () => {
    const content = `# Heading

Some text

\`\`\` js
x = 10
\`\`\`

\`\`\` kroki x svg
\`\`\`
`;

    const runtime = createRuntime();
    const module = runtime.module();
    importMarkup(content, module);

    expect(module._scope.size).toEqual(0);
});

test("A javascript executable code block is added to the module", async () => {
    const content = `# Heading

Some text

\`\`\` js x
x = y * 2
\`\`\`

\`\`\` js x
y = 10
\`\`\`
`;

    const runtime = createRuntime();
    const module = runtime.module();
    importMarkup(content, module);

    expect(module._scope.size).toEqual(2);

    expect(await module.value("x")).toEqual(20);
});

test("An imported value is visible in the module where it is referenced", async () => {
    const runtime = createRuntime();

    const importedContent = `# Heading
Some text

\`\`\` js x
x = y * 2
\`\`\`

\`\`\` js x
y = 10
\`\`\`
`;

    const importedModule = runtime.module();
    const module = runtime.module();

    importMarkup(importedContent, importedModule);

    module.variable().import("x", importedModule);
    module.variable().define("z", ["x"], (x: number) => x * 2);

    expect(await module.value("x")).toEqual(20);
    expect(await module.value("z")).toEqual(40);

    expect(module._scope.size).toEqual(2);
});

test("Import a module inside a js x block", async () => {
    const runtime = createRuntime();

    const content = `# Heading
Some text

\`\`\` js x
import { y as value, createList } from "https://graeme-lockley.github.io/notebook-viewer-2/basic.md"
\`\`\`
`;

    const fetchResult = `
\`\`\` js x | pin
x = 10
\`\`\`

\`\`\` js x | pin
y = x + 10
\`\`\`

\`\`\` js x | pin
seconds = Math.floor(now / 1000)
\`\`\`

\`\`\` js x | pin
createList = (width) => 
    Array(width).fill(0).map(_ => Math.random())
\`\`\`

\`\`\` js x | pin
createList(10)
\`\`\`    
`;

    globalThis.fetch = validFetch(fetchResult);

    const module = runtime.module();

    importMarkup(content, module);

    await delay(1000);

    expect(module._scope.size).toEqual(2);

    expect(await module.value("value")).toEqual(20);
    expect((await module.value("createList"))(10).length).toEqual(10);
});

const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

const validFetch = (result: string) => (url: string): Promise<any> =>
    Promise.resolve({
        ok: true,
        text: () => Promise.resolve(result)
    })

