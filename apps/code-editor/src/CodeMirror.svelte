<script lang="ts">
    import { onMount } from "svelte";
    import CodeMirror from "codemirror/lib/codemirror.js";

    export let sourceURL: string;
    export let content: string = "";

    let cm;

    onMount(() => {
        const element = document.getElementById("code-mirror");

        cm = CodeMirror(element, {
            lineNumbers: true,
            content,
            mode: "markdown"
        });

        cm.on("change", (doc: any, change: any) => {
            if (change.origin !== "setValue") content = doc.getValue();
        });
    });

    function sourceURLChange(newValue: string) {
        if (sourceURL !== undefined) {
            fetch(sourceURL)
                .then((r) => r.text())
                .then((text) => {
                    content = text;
                    cm.setValue(content);
                });
        }
    }

    $: {
        sourceURLChange(sourceURL);
    }
</script>

<div id="code-mirror" />

<style>
    :global(.CodeMirror) {
        height: 100%;
    }
</style>
