<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import type { Dir } from "./NavigationEvents";

    const dispatch = createEventDispatcher();

    let currentDir: Dir;

    const clickLink = (dir: Dir) => {
        currentDir = dir;
        dispatch("navigation", {
            dir,
        });
    };
</script>

{#await fetch("directory.json").then((r) => r.json()) then directory}
    <div class="list-group list-group-flush">
        {#each directory as dir}
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a
                href="#"
                class="list-group-item list-group-item-action {currentDir == dir
                    ? 'active'
                    : ''}"
                on:click={() => clickLink(dir)}>{dir.text}</a
            >
        {/each}
    </div>
{/await}
