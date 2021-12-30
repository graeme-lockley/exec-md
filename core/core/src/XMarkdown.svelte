<script lang="ts">
    import hljs from "highlight.js/lib/core";
    import javascript_highlighter from "highlight.js/lib/languages/javascript";
    import plaintext_highlighter from "highlight.js/lib/languages/plaintext";
    import "highlight.js/styles/base16/papercolor-light.css";
    import { markedParser } from "./MarkedTemplateParser";
    import { createRuntime } from "./runtime";
    import type { IModule, IRuntime } from "./runtime";

    hljs.registerLanguage("javascript", javascript_highlighter);
    hljs.registerLanguage("js", javascript_highlighter);
    hljs.registerLanguage("plaintext", plaintext_highlighter);

    let runtime: IRuntime | undefined = undefined;
    let module: IModule = undefined;

    export let sourceURL: string;

    function sourceURLChange(newValue: string) {
        if (runtime !== undefined) runtime.dispose();

        runtime = createRuntime();
        module = runtime.module();
    }

    $: {
        sourceURLChange(sourceURL);
    }
</script>

{#await fetch(sourceURL).then((r) => r.text()) then text}
    {@html markedParser(text, module)}
{/await}
