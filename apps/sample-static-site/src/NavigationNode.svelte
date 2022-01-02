<script lang="ts">
    import NavigationLeaf from "./NavigationLeaf.svelte";
    import NavigationNode from "./NavigationNode.svelte";

    import type { INavigationNode } from "./NavigationEvents";

    export let open: boolean = false;

    export let node: INavigationNode;

    export let selection: INavigationLeaf;
</script>

<li class="list-group-item">
    <!-- svelte-ignore a11y-invalid-attribute -->
    {#if open}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down" viewBox="0 0 16 16">
            <path d="M3.204 5h9.592L8 10.481 3.204 5zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659z"/>
        </svg>
    {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-right" viewBox="0 0 16 16">
            <path d="M6 12.796V3.204L11.481 8 6 12.796zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753z"/>
        </svg>
    {/if} <span on:click={() => {open = !open;}}>{node.node}</span>
    {#if open}
        <ul class="list-group">
            {#each node.children as item}
                {#if item.label !== undefined}
                    <NavigationLeaf on:leaf leaf={item} {selection}/>
                {:else}
                    <NavigationNode on:leaf node={item} {selection}/>
                {/if}
            {/each}
        </ul>
    {/if}
</li>

<style>
    span {
        cursor: pointer;
    }
    ul.list-group {
        padding-left: 10pt;
    }
    li.list-group-item {
        border: 0;
    }
</style>
