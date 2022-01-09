<script lang="ts">
	import hljs from "highlight.js/lib/core";
	import javascriptHighlighter from "highlight.js/lib/languages/javascript";
	import plaintextHighlighter from "highlight.js/lib/languages/plaintext";

	import "highlight.js/styles/base16/papercolor-light.css";
	// import "codemirror/lib/codemirror.css";
	import "codemirror/mode/markdown/markdown.js";

	import { standardSetup } from "@exec-md/core";

	import CodeMirror from "./CodeMirror.svelte";
	import XMarkdown from "./XMarkdown.svelte";

	hljs.registerLanguage("javascript", javascriptHighlighter);
	hljs.registerLanguage("js", javascriptHighlighter);
	hljs.registerLanguage("plaintext", plaintextHighlighter);

	standardSetup(hljs);

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

	let selectedID = 6;
	let content = "";
	let editorContent = "";
</script>

<select id="select" bind:value={selectedID}>
	{#each examples as example}
		<option value={example.id}>
			{example.text}
		</option>
	{/each}
</select>

<button
	type="button"
	disabled={content === editorContent}
	on:click={() => {
		content = editorContent;
	}}
>
	Process Markdown
</button>

<div class="wrapper">
	<div id="one">
		<CodeMirror
			sourceURL={examples[selectedID].resource}
			bind:content={editorContent}
		/>
	</div>
	<div id="two">
		<XMarkdown {content} />
	</div>
</div>

<style>
	.wrapper {
		overflow: hidden;
	}

	.wrapper div {
		padding: 10px;
		height: auto;
	}

	#one {
		background-color: gray;
		float: left;
		margin-right: 20px;
		width: 50%;
		height: auto;
	}

	#two {
		background-color: white;
		overflow: hidden;
		margin: 10px;
		border: 2px dashed #ccc;
		min-height: 170px;
		height: auto;
	}
</style>
