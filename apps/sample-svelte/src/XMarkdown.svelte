<script lang="ts">
    import { translateMarkup } from "./core";
    import { type IModule, type IRuntime, createRuntime } from "@execmd/runtime";

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
