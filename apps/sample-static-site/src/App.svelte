<script lang="ts">
	import hljs from "highlight.js/lib/core";
	import javascriptHighlighter from "highlight.js/lib/languages/javascript";
	import plaintextHighlighter from "highlight.js/lib/languages/plaintext";

	import "highlight.js/styles/base16/papercolor-light.css";
	import { standardSetup } from "@execmd/core";

	import Navigation from "./Navigation.svelte";
	import XMarkdown from "./XMarkdown.svelte";

	import type { Dir } from "./NavigationEvents";

	hljs.registerLanguage("javascript", javascriptHighlighter);
	hljs.registerLanguage("js", javascriptHighlighter);
	hljs.registerLanguage("plaintext", plaintextHighlighter);

	standardSetup(hljs);

	let sourceURL: string;

	const selectDir = (dir: Dir | undefined) => {
		sourceURL =
			dir === undefined ? undefined : dir.resource;
	};
</script>

<div class="container-fluid">
	<div class="row">
		<div class="col-sm-2">
			<Navigation
				on:navigation={(event) => {
					selectDir(event.detail.dir);
				}}
			/>
		</div>

		<div class="col-sm-10">
			{#if sourceURL !== undefined}
				<XMarkdown {sourceURL} />
			{/if}
		</div>
	</div>
</div>
