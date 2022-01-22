<script lang="ts">
    import { translateURL } from "@exec-md/core";
    import { type IModule, type IRuntime, createRuntime } from "@exec-md/runtime";

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

{#await translateURL(sourceURL, module) then html}
    {@html html}
{/await}
