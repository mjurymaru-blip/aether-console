<!--
  GlitchText.svelte - グリッチエフェクト付きテキスト
  
  Usage:
    <GlitchText text="AETHER CONSOLE" />
-->
<script lang="ts">
	import { settingsStore } from "$lib/stores/settings-store";

	interface Props {
		text: string;
		tag?: "h1" | "h2" | "h3" | "h4" | "span" | "p";
		glitchOnHover?: boolean;
		intensity?: "low" | "medium" | "high";
	}

	let {
		text,
		tag = "span",
		glitchOnHover = true,
		intensity = "medium",
	} = $props<Props>();
	let settings = $derived($settingsStore);

	// reducedMotionの場合はグリッチを無効化
	let effectiveGlitch = $derived(glitchOnHover && !settings.reducedMotion);
</script>

<svelte:element
	this={tag}
	class="glitch-text"
	class:glitch-hover={effectiveGlitch}
	class:intensity-low={intensity === "low"}
	class:intensity-high={intensity === "high"}
	data-text={text}
>
	{text}
</svelte:element>

<style>
	.glitch-text {
		position: relative;
		display: inline-block;
		color: var(--color-text-bright);
		text-shadow: var(--glow-cyan);
	}

	.glitch-text::before,
	.glitch-text::after {
		content: attr(data-text);
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
	}

	.glitch-text::before {
		color: var(--color-red);
		z-index: -1;
	}

	.glitch-text::after {
		color: var(--color-cyan);
		z-index: -2;
	}

	/* Hover Glitch Effect */
	.glitch-hover:hover {
		animation: glitch 0.3s infinite;
	}

	.glitch-hover:hover::before,
	.glitch-hover:hover::after {
		opacity: 0.8;
	}

	.glitch-hover:hover::before {
		animation: glitch-offset-1 0.3s infinite;
	}

	.glitch-hover:hover::after {
		animation: glitch-offset-2 0.3s infinite;
	}

	/* Intensity Variations */
	.intensity-low:hover {
		animation-duration: 0.5s;
	}

	.intensity-high:hover {
		animation-duration: 0.15s;
	}

	@keyframes glitch {
		0%,
		100% {
			transform: translate(0);
		}
		20% {
			transform: translate(-2px, 2px);
		}
		40% {
			transform: translate(2px, -2px);
		}
		60% {
			transform: translate(-1px, 1px);
		}
		80% {
			transform: translate(1px, -1px);
		}
	}

	@keyframes glitch-offset-1 {
		0%,
		100% {
			transform: translate(0);
		}
		20% {
			transform: translate(2px, -1px);
		}
		40% {
			transform: translate(-2px, 1px);
		}
		60% {
			transform: translate(1px, 2px);
		}
		80% {
			transform: translate(-1px, -2px);
		}
	}

	@keyframes glitch-offset-2 {
		0%,
		100% {
			transform: translate(0);
		}
		20% {
			transform: translate(-1px, 2px);
		}
		40% {
			transform: translate(1px, -2px);
		}
		60% {
			transform: translate(2px, -1px);
		}
		80% {
			transform: translate(-2px, 1px);
		}
	}
</style>
