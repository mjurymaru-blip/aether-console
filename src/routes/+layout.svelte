<script lang="ts">
	import '../global.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
</svelte:head>

<div class="app-wrapper scanlines">
	{@render children()}
</div>

<style>
	.app-wrapper {
		min-height: 100vh;
		width: 100%;
	}
</style>
