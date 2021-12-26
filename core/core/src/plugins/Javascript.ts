import { renderCode } from "./Helpers";
import type { Bindings, Options, Plugin } from "./Plugin";

interface Javascript extends Plugin {
    hljs: any | undefined;
}

type Renderer = () => string;

export const javascript: Javascript = {
    name: 'js',
    pattern: /^(js|javascript)\s*/,

    hljs: undefined,

    setup: function (bindings: Bindings) {
        this.hljs = bindings.get('hljs');
    },

    render: function (module, body: string, options: Options, render: boolean): string | Node {       
        return render ? renderCode(this.hljs, 'javascript', body) : '';
    }
};