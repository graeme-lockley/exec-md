<script lang="ts">
    import hljs from "highlight.js/lib/core";
    import javascript_highlighter from "highlight.js/lib/languages/javascript";
    import plaintext_highlighter from "highlight.js/lib/languages/plaintext";
    import "highlight.js/styles/base16/papercolor-light.css";
    import { Library, Runtime } from "@observablehq/runtime";
    import { loadSource } from "./Import";
    import { markedParser } from "./MarkedTemplateParser";

    hljs.registerLanguage("javascript", javascript_highlighter);
    hljs.registerLanguage("js", javascript_highlighter);
    hljs.registerLanguage("plaintext", plaintext_highlighter);

    const library = Object.assign(new Library(), {
        load: () => (url: string) => loadSource(url),
    });

    let runtime = undefined;
    let module = undefined;

    export let sourceURL: string;

    function sourceURLChange(newValue: string) {
        if (runtime !== undefined) {
            runtime.dispose();
        }
        runtime = new Runtime(library);
        module = runtime.module();
    }

    $: {
        sourceURLChange(sourceURL);
    }
</script>

{#await fetch(sourceURL).then((r) => r.text()) then text}
    {@html markedParser(text, module)}
{/await}
