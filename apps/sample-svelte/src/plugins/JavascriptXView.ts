import { type IModule, type Observer, defineVariable } from "@execmd/runtime";

import { parse } from "@execmd/javascript-parser";
import { valueUpdater, renderCode, type Bindings, type Options, type Plugin } from "@execmd/plugin-common";

interface JavascriptXView extends Plugin {
    hljs: any | undefined;
}

type Renderer = () => string;

let javascriptXView_count = 0;

export const javascriptXView: JavascriptXView = {
    name: 'js-x-view',
    pattern: /^(js|javascript)\s+x\s+view\s*/,

    hljs: undefined,

    setup: function (bindings: Bindings) {
        this.hljs = bindings.get('hljs');
    },

    render: function (module: IModule, body: string, options: Options, render: boolean): string | Node {
        const pr = parse(body);

        if (pr.type === "assignment" || pr.type === "exception") {
            if (render) {
                const viewCellID = `js-x-view-${javascriptXView_count++}`;
                const viewID = viewCellID + '-view';
                const codeID = viewCellID + '-code';

                const renderer: Renderer =
                    () => renderCode(this.hljs, 'javascript', body);

                const name = pr.type === "assignment" ? pr.name : undefined

                const variableObserver: Observer =
                    observer(viewID, codeID, name, options.has('pin'), renderer)

                if (pr.type === "assignment") {
                    if (name === undefined)
                        defineVariable(module, variableObserver, pr.name, pr.dependencies, pr.body);
                    else {
                        const viewCellName = `${pr.name}$$`;

                        defineVariable(module, variableObserver, viewCellName, pr.dependencies, pr.body)
                        defineVariable(module, undefined, pr.name, ['Generators', viewCellName], `Generators.input(${viewCellName})`);
                    }
                } else
                    module.variable(variableObserver).define(name, [], () => {
                        throw pr.exception;
                    });

                return `<div id='${viewCellID}' class='nbv-js-x-view'><div id='${viewID}'></div><div id='${codeID}'></div></div>`;
            } else if (pr.type === "assignment" && pr.name !== undefined)
                defineVariable(module, undefined, pr
                    .name, [], 'undefined');
            return '';
        }
        else if (render)
            return `<div class='nbv-js-x-assert'>Unable to view an import</div>`
        else
            return '';
    }
};

const observer = (viewElementID: string, codeElementID: string, name: string, pin: boolean, renderer: Renderer): Observer => {
    const viewControl = valueUpdater(viewElementID);
    const codeControl = valueUpdater(codeElementID);

    return {
        fulfilled: function (value: any): void {
            viewControl(value);
            codeControl(pin ? renderer() : '');
        },
        pending: function (): void {
            viewControl('');
            codeControl(pin ? renderer() : '');
        },
        rejected: function (value?: any): void {
            viewControl(value);
            codeControl(renderer());
        }
    };
}
