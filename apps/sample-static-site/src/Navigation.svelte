<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import NavigationLeaf from "./NavigationLeaf.svelte";
    import NavigationNode from "./NavigationNode.svelte";

    export let selection: INavigationLeaf
</script>

{#await fetch("directory.json").then((r) => r.json()) then directory}
    <ul class="list-group">
        {#each directory as item}
            {#if item.label !== undefined}
                <NavigationLeaf on:leaf leaf={item} {selection}/>
            {:else}
                <NavigationNode on:leaf node={item} {selection}/>
            {/if}
        {/each}
    </ul>
{/await}
