<script lang="ts">
    import { translateMarkup } from "./MarkedTemplateParser";
    import { createRuntime } from "./runtime";
    import type { IModule, IRuntime } from "./runtime";

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
    {@html translateMarkup(text, module)}
{/await}
