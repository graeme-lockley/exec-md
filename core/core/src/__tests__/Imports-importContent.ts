import { Runtime } from "@observablehq/runtime";
import { importContent } from "../Import";
import fetch from "cross-fetch";

if (globalThis.fetch === undefined) {
    globalThis.fetch = fetch as any;
}

test("Empty content results in an empty module", () => {
    const content = '';

    const runtime = new Runtime();
    const module = runtime.module();
    importContent(content, module);

    expect(module._scope.size).toEqual(0);
});

test("Content without any bindings results in an empty module", () => {
    const content = `# Heading

Some text
`;

    const runtime = new Runtime();
    const module = runtime.module();
    importContent(content, module);

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

    const runtime = new Runtime();
    const module = runtime.module();
    importContent(content, module);

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

    const runtime = new Runtime();
    const module = runtime.module();
    importContent(content, module);

    expect(module._scope.size).toEqual(2);

    expect(await module.value("x")).toEqual(20);
});

test("An imported value is visible in the module where it is referenced", async () => {
    const runtime = new Runtime();

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

    importContent(importedContent, importedModule);

    module.variable().import("x", importedModule);
    module.variable().define("z", ["x"], (x: number) => x * 2);

    expect(module._scope.size).toEqual(2);

    expect(await module.value("x")).toEqual(20);
    expect(await module.value("z")).toEqual(40);
});

test("Import a module inside a js x block", async () => {
    const runtime = new Runtime();

    const content = `# Heading
Some text

\`\`\` js x
import { y as value, createList } from "https://graeme-lockley.github.io/notebook-viewer-2/basic.md"
\`\`\`
`;

    const module = runtime.module();

    importContent(content, module);

    await delay(1000);

    expect(module._scope.size).toEqual(2);

    expect(await module.value("value")).toEqual(20);
    expect((await module.value("createList"))(10).length).toEqual(10);
});

const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
