<script lang="ts">
	import hljs from "highlight.js/lib/core";
	import javascript_highlighter from "highlight.js/lib/languages/javascript";
	import plaintext_highlighter from "highlight.js/lib/languages/plaintext";
	import "highlight.js/styles/base16/papercolor-light.css";

	import XMarkdown from "./XMarkdown.svelte";

	import { javascriptX } from "./plugins/JavascriptX";
	import { javascriptXAssert } from "./plugins/JavascriptXAssert";
	import { javascriptXInline } from "./plugins/JavascriptXInline";
	import { javascriptXView } from "./plugins/JavascriptXView";
	import { krokiX } from "./plugins/KrokiX";

	import { setup } from "./core/MarkedTemplateParser";

	hljs.registerLanguage("javascript", javascript_highlighter);
	hljs.registerLanguage("js", javascript_highlighter);
	hljs.registerLanguage("plaintext", plaintext_highlighter);

	setup(
		[
			javascriptXAssert,
			javascriptXView,
			javascriptXInline,
			javascriptX,
			krokiX,
		],
		new Map([["hljs", hljs]])
	);

	let examples = [
		{ id: 0, text: "Simple Reactive Components", resource: "simple.md" },
		{ id: 1, text: "String Calculater Kata", resource: "sck.md" },
		{ id: 2, text: "D3 Scatterplot", resource: "d3-scatterplot.md" },
		{ id: 3, text: "Diagrams", resource: "kroki-diagrams.md" },
		{ id: 4, text: "Blocks in blocks", resource: "blocks-in-blocks.md" },
		{ id: 5, text: "Playing with SVG", resource: "playing-with-svg.md" },
		{ id: 6, text: "Basic notebook for testing", resource: "basic.md" },
		{ id: 7, text: "Nested import", resource: "nested-import.md" },
		{
			id: 8,
			text: "Platform Components",
			resource: "platform-components.md",
		},
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
