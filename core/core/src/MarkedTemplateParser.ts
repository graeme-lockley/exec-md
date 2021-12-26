import { parseInfoString } from "./Parser";
import { marked } from "marked";
import { renderCode } from "./plugins/Helpers";
import type { Options, Plugin, Plugins } from "./plugins/Plugin";
import hljs from "highlight.js/lib/core";

import { javascript } from "./plugins/Javascript";
import { javascriptX } from "./plugins/JavascriptX";
import { javascriptXAssert } from "./plugins/JavascriptXAssert";
import { javascriptXInline } from "./plugins/JavascriptXInline";
import { javascriptXView } from "./plugins/JavascriptXView";
import { krokiX } from "./plugins/KrokiX";

const bindings = new Map([["hljs", hljs]]);
const plugins = [
    javascriptXAssert,
    javascriptXView,
    javascriptXInline,
    javascriptX,
    javascript,
    krokiX
];
plugins.filter((p) => p.setup !== undefined).map((p) => p.setup(bindings));

const renderer = {
    code(code: string, infostring: string, escaped: boolean | undefined) {
        const findResponse = find(plugins, infostring);

        if (findResponse === undefined) {
            console.log("Unknown infostring:", infostring);
            return renderCode(hljs, "plaintext", code);
        } else {
            const [plugin, is] = findResponse;

            return plugin.render(this.options.nbv_module, code, is, this.options.nbv_render);
        }
    }
};

const inlineExpression = {
    name: "expression",
    level: "inline",
    start(src: string) {
        return src.match(/\$\{/)?.index;
    },
    tokenizer(src: string, tokens: any) {
        if (src.startsWith("${")) {
            let index = 0;

            // State values:
            //   0 - top-level Javascript
            //   1 - within a back quote (`)
            let state = 0;

            while (index < src.length) {
                switch (state) {
                    case 0:
                        if (src[index] === '}') {
                            const result = {
                                type: "expression",
                                raw: src.slice(0, index + 1),
                                body: src.slice(2, index)
                            };
                            return result;
                        } else if (src[index] === '`')
                            state = 1;
                        break;
                    case 1:
                        if (src[index] === '`') {
                            state = 0;
                        }
                }
                index += 1;
            }
        }

        return undefined;
    },
    renderer(token: any) {
        return javascriptXInline.render(this.parser.options.nbv_module, token.body, new Map(), this.parser.options.nbv_render);
    }
};

marked.use({ renderer, extensions: [inlineExpression] });


export const markedParser = (text: string, module): string =>
    marked.parse(text, { nbv_module: module, nbv_render: true });

export const importParser = (text: string, module) =>
    marked.parse(text, { nbv_module: module, nbv_render: false });

function find(
    plugins: Plugins,
    infostring: string
): [Plugin, Options] | undefined {
    return findMap(plugins, (plugin: Plugin) => {
        const match = infostring.match(plugin.pattern);

        if (match == null) return undefined;
        else
            return [
                plugin,
                parseInfoString(
                    plugin.name + " " + infostring.slice(match[0].length)
                ),
            ];
    });
}

function findMap<X, Y>(
    items: Array<X>,
    p: (x: X) => Y | undefined
): Y | undefined {
    let idx = 0;

    while (idx < items.length) {
        const r = p(items[idx]);

        if (r !== undefined) return r;

        idx += 1;
    }

    return undefined;
}
