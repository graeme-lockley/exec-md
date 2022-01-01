<script lang="ts">
    import { translateMarkup } from "@execmd/core";
    import { type IModule, type IRuntime, createRuntime } from "@execmd/runtime";

    let runtime: IRuntime | undefined = undefined;
    let module: IModule = undefined;

    export let content: string;

    function contentChange(newValue: string) {
        if (runtime !== undefined) runtime.dispose();

        runtime = createRuntime();
        module = runtime.module();
    }

    $: {
        contentChange(content);
    }
</script>

{@html translateMarkup(content, module)}
