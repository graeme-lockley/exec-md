<script lang="ts">
	import XMarkdown from "./XMarkdown.svelte";

	let examples = [
		{ id: 0, text: "Simple Reactive Components", resource: "simple.md" },
		{ id: 1, text: "String Calculater Kata", resource: "sck.md" },
		{ id: 2, text: "D3 Scatterplot", resource: "d3-scatterplot.md" },
		{ id: 3, text: "Diagrams", resource: "kroki-diagrams.md" },
		{ id: 4, text: "Blocks in blocks", resource: "blocks-in-blocks.md" },
		{ id: 5, text: "Playing with SVG", resource: "playing-with-svg.md" },
		{ id: 6, text: "Basic notebook for testing", resource: "basic.md" },
		{ id: 7, text: "Nested import", resource: "nested-import.md" },
		{ id: 8, text: "Platform Components", resource: "platform-components.md" },
	];

	let selectedID = 8;
</script>

<select id="select" bind:value={selectedID}>
	{#each examples as example}
		<option value={example.id}>
			{example.text}
		</option>
	{/each}
</select>

<br />

<XMarkdown sourceURL={examples[selectedID].resource} />
