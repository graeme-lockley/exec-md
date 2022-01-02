<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import type { INavigationLeaf } from "./NavigationEvents";

    const dispatch = createEventDispatcher();

    export let leaf: INavigationLeaf;

    export let selection: INavigationLeaf | undefined;
</script>

<li
    class="list-group-item {leaf == selection ? 'active' : ''}"
    on:click={() => dispatch("leaf", { leaf })}
>
    {leaf.name}
</li>

<style>
    li.list-group-item {
        border: 0;
        cursor: pointer;
    }
</style>
