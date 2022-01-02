<script lang="ts">
	import hljs from "highlight.js/lib/core";
	import javascriptHighlighter from "highlight.js/lib/languages/javascript";
	import plaintextHighlighter from "highlight.js/lib/languages/plaintext";

	import "highlight.js/styles/base16/papercolor-light.css";
	import { standardSetup } from "@execmd/core";

	import Navigation from "./Navigation.svelte";
	import XMarkdown from "./XMarkdown.svelte";

	import type { INavigationLeaf } from "./NavigationEvents";

	hljs.registerLanguage("javascript", javascriptHighlighter);
	hljs.registerLanguage("js", javascriptHighlighter);
	hljs.registerLanguage("plaintext", plaintextHighlighter);

	standardSetup(hljs);

	let selection: INavigationLeaf

	const selectDir = (dir: INavigationLeaf | undefined) => {
		selection = dir
	};
</script>

<div class="container-fluid">
	<div class="row">
		<div class="col-sm-2">
			<Navigation
				on:leaf={(event) => {
					selection = event.detail.leaf;
				}}
				{selection}
			/>
		</div>

		<div class="col-sm-10">
			{#if selection !== undefined}
				<XMarkdown sourceURL={selection.resource}/>
			{/if}
		</div>
	</div>
</div>
