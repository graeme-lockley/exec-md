import { marked } from "marked";
import { parseInfoString, renderCode } from "../plugins-helper";
import type { Options, Plugin, Plugins } from "../plugins-helper";
import hljs from "highlight.js/lib/core";
import type { IModule } from "../runtime";

import { javascript } from "../plugins/Javascript";
import { javascriptX } from "../plugins/JavascriptX";
import { javascriptXAssert } from "../plugins/JavascriptXAssert";
import { javascriptXInline } from "../plugins/JavascriptXInline";
import { javascriptXView } from "../plugins/JavascriptXView";
import { krokiX } from "../plugins/KrokiX";

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

        if (findResponse === undefined)
            return renderCode(hljs, infostring, code);
        else {
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

export const translateMarkup = (text: string, module: IModule): string =>
    marked.parse(text, { nbv_module: module, nbv_render: true });

export const importMarkup = (text: string, module: IModule): void =>
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
