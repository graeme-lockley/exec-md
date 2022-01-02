<script lang="ts">
    import NavigationLeaf from "./NavigationLeaf.svelte";
    import NavigationNode from "./NavigationNode.svelte";

    import type { INavigationLeaf } from "./NavigationEvents";

    export let selection: INavigationLeaf | undefined;
</script>

{#await fetch("directory.json").then((r) => r.json()) then directory}
    <ul class="list-group">
        {#each directory as item}
            {#if item.type === "leaf"}
                <NavigationLeaf on:leaf leaf={item} {selection} />
            {:else}
                <NavigationNode on:leaf node={item} {selection} />
            {/if}
        {/each}
    </ul>
{/await}
