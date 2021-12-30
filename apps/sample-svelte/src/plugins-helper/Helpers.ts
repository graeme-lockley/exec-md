import { Inspector } from "@observablehq/runtime";

export const valueUpdater = (elementID: string): ((content: string | Node) => void) => {
    let last = Date.now();

    const updateDiv = (moment: number, content: string | Node) => {
        const element = document.getElementById(elementID);

        if (element === null) return false;
        else if (last === moment) {
            if (content instanceof Node) {
                element.childNodes.forEach((child) =>
                    element.removeChild(child)
                );

                element.appendChild(content);
            }
            else 
                element.innerHTML = content;
                
            return true;
        } else return true;
    };

    const updateDivLoop = (moment: number, content: string | Node) => {
        Promise.resolve(updateDiv(moment, content)).then((r) => {
            if (!r) delay(100).then(() => updateDivLoop(moment, content));
        });
    }

    const snapshot = (): number => {
        const moment = Date.now();
        last = moment;
        return moment;
    };

    return (content: string | Node) => {
        updateDivLoop(snapshot(), content)
    };
};

export const inspectorUpdater = (elementID: string): ((inspector: Inspector) => void) => {
    let last = Date.now();
    let inspector = undefined;

    const updateDiv = (moment: number, update: (inspector: Inspector) => void) => {
        const element = document.getElementById(elementID);

        if (element === null) return false;
        else if (last === moment) {
            if (inspector === undefined)
                inspector = new Inspector(element);
            update(inspector);
            return true;
        } else return true;
    };

    const updateDivLoop = (moment: number, update: (inspector: Inspector) => void) => {
        Promise.resolve(updateDiv(moment, update)).then((r) => {
            if (!r) delay(100).then(() => updateDivLoop(moment, update));
        });
    }

    const snapshot = (): number => {
        const moment = Date.now();
        last = moment;
        return moment;
    };

    return (update: (inspector: Inspector) => void) => {
        updateDivLoop(snapshot(), update)
    };
};

const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export const renderCode = (hljs, language: string, body: string): string =>
    hljs === undefined
        ? `<pre class='nbv-unstyled-code-block'><code>${body}</code></pre>`
        : `<pre class='nbv-styled-code-block'><code class="hljs language-${language}">${hljs.highlight(body, { language }).value
        }</code></pre>`;
