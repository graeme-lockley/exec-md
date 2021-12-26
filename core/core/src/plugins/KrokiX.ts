import type { Observer } from "../Observer";
import { renderCode, valueUpdater } from "./Helpers";
import type { Bindings, Options, Plugin } from "./Plugin";
import { parseCell } from "@observablehq/parser";

interface KrokiX extends Plugin {
    hljs: any | undefined;
}

const supportedDiagramTypes = new Set([
    "blockdiag",
    "bytefield",
    "seqdiag",
    "actdiag",
    "c4plantuml",
    "nwdiag",
    "packetdiag",
    "rackdiag",
    "erd",
    "excalidraw",
    "graphviz",
    "mermaid",
    "nomnoml",
    "pikchr",
    "plantuml",
    "vega",
    "vegalite",
    "wavedrom",
]);

type Renderer = (code: string) => string;

let krokiX_count = 0;

export const krokiX: KrokiX = {
    name: 'kroki-x',
    pattern: /^kroki\s+x\s*/,

    hljs: undefined,

    setup: function (bindings: Bindings) {
        this.hljs = bindings.get('hljs');
    },

    render: function (module, body: string, options: Options, render: boolean): string | Node {
        if (render) {
            const id = `kroki-x-${krokiX_count++}`;
            const observerID = id + '-value';
            const codeID = id + '-code';

            const pin = options.has("pin");
            const type = options.get(this.name);

            if (supportedDiagramTypes.has(type)) {
                /* render based on type */
                const renderer: Renderer =
                    (body: string) => renderCode(this.hljs, 'plaintext', body);

                const variableObserver =
                    observer(observerID, codeID, type, body, options.has('pin'), renderer);

                const f = functionFromBody(body);

                module
                    .variable(variableObserver)
                    .define(undefined, f.names, eval(f.body));


                return `<div id='${id}' class='nbv-kroki-x'><div id='${observerID}'></div><div id='${codeID}'>${pin ? renderer(body) : ''}</div></div>`;
            } else {
                return `<div class='nbv-kroki-x'><p>Kroki Error: Unknown Type: ${type}<p><ul>${[...supportedDiagramTypes].map(i => `<li>${i}</li>`).join("")}</ul></div>`;
            }
        } else
            return '';
    }
};

const observer = (viewElementID: string, codeElementID: string, type: string, body: string, pin: boolean, renderer: Renderer): Observer => {
    const viewControl = valueUpdater(viewElementID);
    const codeControl = valueUpdater(codeElementID);

    return {
        fulfilled: function (value: any): void {
            codeControl(pin ? renderer(body) : '');

            try {
                fetch(`https://kroki.io/${type}/svg`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: value
                })
                    .then(response => response.text())
                    .then(content => {
                        if (typeof content === "string" && content.startsWith("Error")) {
                            viewControl(renderer(content));
                            codeControl(renderer(value));
                        } else
                            viewControl(content);
                    })
                    .catch(error => {
                        viewControl(`Kroki Error: ${error}`);
                        codeControl(renderer(value));
                    });
            } catch (e) {
                viewControl(`Kroki Error: ${e}`);
                codeControl(renderer(value));
            }
        },
        pending: function (): void {
            codeControl(pin ? renderer('') : '');
        },
        rejected: function (value?: any): void {
            viewControl(value);
            codeControl(renderer(value));
        }
    };
}

export const functionFromBody = (body: string): { names: Array<string>, body: string } => {
    const facets = parse(body);
    const result = [];
    const names = [];

    const addLiteral = (text: string) => {
        result.push(text.replace(/\\/g, '\\\\'));
    };

    let lp = 0;
    while (lp + 2 < facets.length) {
        addLiteral(facets[lp]);

        try {
            const code = facets[lp + 1];

            const ast = parseCell(code);

            const referencedNames = ast.references.map((dep: { name: string }) => dep.name);
            const dependencies = uniqueElementsInStringArray(referencedNames);
            const body = code.slice(ast.body.start, ast.body.end);

            dependencies.forEach(s => names.push(s));

            result.push('${');
            result.push(body);
            result.push('}');
        } catch (e) {
            result.push('{');
            result.push(e);
            result.push('}');
        }

        lp += 2;
    }
    addLiteral(facets[facets.length - 1]);

    const uniqueNames = uniqueElementsInStringArray(names);

    return { names: uniqueNames, body: `(${uniqueNames.join(", ")}) => \`${result.join('')}\`` };
}

const uniqueElementsInStringArray = (inp: Array<string>): Array<string> =>
    Array.from(new Set<string>(inp))

export const parse = (body: string): Array<string> => {
    const result = [];

    let previousLp = 0;
    let lp = 0;
    // 0 - in free text
    // 1 - in ${} block
    let state = 0;
    let curlyNesting = 0;

    while (lp < body.length) {
        // console.log(state, lp, previousLp, curlyNesting, `"${body.slice(previousLp, lp)}" '${body[lp]}' "${body.slice(lp + 1)}"`);
        switch (state) {
            case 0:
                if (body[lp] === '$' && body[lp + 1] === '{') {
                    result.push(body.slice(previousLp, lp));
                    previousLp = lp;
                    lp += 2;
                    state = 1;
                } else
                    lp += 1;
                break;
            case 1:
                if (body[lp] === '}') {
                    if (curlyNesting > 0) {
                        curlyNesting -= 1;
                        lp += 1;
                    } else {
                        result.push(body.slice(previousLp + 2, lp))
                        lp += 1;
                        previousLp = lp;
                        state = 0;
                    }
                } else if (body[lp] === '{') {
                    curlyNesting += 1;
                    lp += 1;
                } else
                    lp += 1;
                break;
        }
    }

    result.push(body.slice(previousLp));

    return result;
}
