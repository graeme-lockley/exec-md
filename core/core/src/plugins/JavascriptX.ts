import type { IModule, Observer } from "../runtime";

import { parse, type ParseResult } from "../Parser";
import { valueUpdater, inspectorUpdater, renderCode } from "../plugins-helper";
import type { Bindings, Inspector, Options, Plugin } from "../plugins-helper";
import { importMarkup } from "../MarkedTemplateParser";

import { Eval } from "../Eval"

interface JavascriptX extends Plugin {
    hljs: any | undefined;
}

type Renderer = () => string;

let javascriptX_count = 0;

export const javascriptX: JavascriptX = {
    name: 'js-x',
    pattern: /^(js|javascript)\s+x\s*/,

    hljs: undefined,

    setup: function (bindings: Bindings) {
        this.hljs = bindings.get('hljs');
    },

    render: function (module: IModule, body: string, options: Options, render: boolean): string | Node {
        const pr: ParseResult = parse(body);

        if (pr.type === "assignment") {
            if (render) {
                const id = `js-x-${javascriptX_count++}`;
                const observerID = id + '-observer';
                const codeID = id + '-code';

                const renderer: Renderer =
                    () => renderCode(this.hljs, 'javascript', body);

                const variableObserver =
                    observer(observerID, codeID, pr.name, options.has('hide'), options.has('pin'), renderer);

                module
                    .variable(variableObserver)
                    .define(pr.name, pr.dependencies, pr.result);

                return `<div id='${id}' class='nbv-js-x'><div id='${observerID}'></div><div id='${codeID}'></div></div>`;
            }
            else {
                module
                    .variable()
                    .define(pr.name, pr.dependencies, pr.result);

                return '';
            }
        }
        else {
            fetch(pr.urn).then((r) => r.text()).then((t) => {
                const newModule = module._runtime.module();
                importMarkup(t, newModule);

                pr.names.forEach(({ name, alias }) => module.variable().import(name, alias, newModule));
            }).catch(e => console.log(e));

            if (render) {
                const id = `js-x-${javascriptX_count++}`;
                const observerID = id + '-observer';
                const codeID = id + '-code';

                const renderer: Renderer =
                    () => renderCode(this.hljs, 'javascript', body);

                const variableObserver =
                    observer(observerID, codeID, pr.urn, options.has('hide'), options.has('pin'), renderer);

                const aliases = pr.names.map(({ name, alias }) => alias);

                module.variable(variableObserver).define(undefined, aliases, Eval(`(${aliases.join(", ")}) => ({${aliases.join(", ")}})`));

                return `<div id='${id}' class='nbv-js-x'><div id='${observerID}'></div><div id='${codeID}'></div></div>`;
            } else
                return '';
        }
    }
};

const observer = (inspectorElementID: string, codeElementID: string, name: string | undefined, hide: boolean, pin: boolean, renderer: Renderer): Observer => {
    const inspectorControl = hide ? undefined : inspectorUpdater(inspectorElementID);
    const codeControl = valueUpdater(codeElementID);

    return {
        fulfilled: function (value: any): void {
            if (!hide)
                inspectorControl((inspector: Inspector) => inspector.fulfilled(value, name));
            codeControl(pin ? renderer() : '');
        },
        pending: function (): void {
            if (!hide)
                inspectorControl((inspector: Inspector) => inspector.pending());
            codeControl(pin ? renderer() : '');
        },
        rejected: function (value?: any): void {
            if (!hide)
                inspectorControl((inspector: Inspector) => inspector.rejected(value));
            codeControl(renderer());
        }
    };
}
