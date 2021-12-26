import { parse } from "../Parser";
import type { Observer } from "../Observer";
import { renderCode, valueUpdater } from "./Helpers";
import type { Bindings, Options, Plugin } from "./Plugin";

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

    render: function (module, body: string, options: Options, render: boolean): string | Node {
        const pr = parse(body);

        if (pr.type === "assignment")
            if (render) {
                const viewCellID = `js-x-view-${javascriptXView_count++}`;
                const viewID = viewCellID + '-view';
                const codeID = viewCellID + '-code';

                const renderer: Renderer =
                    () => renderCode(this.hljs, 'javascript', body);

                const variableObserver: Observer =
                    observer(viewID, codeID, pr.name, options.has('pin'), renderer)

                if (pr.name === undefined)
                    module
                        .variable(variableObserver)
                        .define(pr.name, pr.dependencies, pr.result);
                else {
                    const viewCellName = `${pr.name}$$`;

                    module
                        .variable(variableObserver)
                        .define(viewCellName, pr.dependencies, pr.result);

                    module
                        .variable()
                        .define(pr.name, [viewCellName], eval(`(${viewCellName}) => Generators.input(${viewCellName})`));
                }

                return `<div id='${viewCellID}' class='nbv-js-x-view'><div id='${viewID}'></div><div id='${codeID}'></div></div>`;
            } else if (pr.name === undefined)
                return ''
            else {
                module
                    .variable()
                    .define(pr.name, [], eval(`() => undefined`));

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
