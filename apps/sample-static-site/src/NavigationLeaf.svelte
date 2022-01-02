<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import type { INavigationLeaf } from "./NavigationEvents";

    const dispatch = createEventDispatcher();

    export let leaf: INavigationLeaf;

    export let selection: INavigationLeaf;
</script>

<li class="list-group-item {leaf == selection ? "active" : ""}" on:click={() => dispatch('leaf', {leaf})}>{leaf.label}</li>

<style>
    li.list-group-item {
        border: 0;
        cursor: pointer;
    }
</style>