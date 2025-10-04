<script lang="ts">
	export let icon: string;
	export let size: string = "w-5 h-5";
	export let className: string = "";
</script>

{#if icon === "bench-press"}
	<svg class="{size} {className}" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
	</svg>
{:else if icon === "squat"}
	<svg class="{size} {className}" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
	</svg>
{:else if icon === "deadlift"}
	<svg class="{size} {className}" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
	</svg>
{:else if icon === "overhead-press"}
	<svg class="{size} {className}" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
	</svg>
{:else if icon === "pull-ups"}
	<svg class="{size} {className}" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
	</svg>
{:else if icon === "push-ups"}
	<svg class="{size} {className}" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
	</svg>
{:else if icon === "dips"}
	<svg class="{size} {className}" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
	</svg>
{:else if icon === "rows"}
	<svg class="{size} {className}" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
	</svg>
{:else if icon === "lunges"}
	<svg class="{size} {className}" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
	</svg>
{:else if icon === "plank"}
	<svg class="{size} {className}" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
	</svg>
{:else if icon === "crunches"}
	<svg class="{size} {className}" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
	</svg>
{:else if icon === "running"}
	<svg class="{size} {className}" fill="currentColor" viewBox="0 0 24 24">
		<path d="M13.5 5.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM9.78 8.9L7 23h2.1l1.75-8L14 17h2.1l-2.1-10.1c-.5-.5-1.2-.5-1.7 0L9.78 8.9z"/>
	</svg>
{:else if icon === "cycling"}
	<svg class="{size} {className}" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
	</svg>
{:else if icon === "swimming"}
	<svg class="{size} {className}" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
	</svg>
{:else if icon === "yoga"}
	<svg class="{size} {className}" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
	</svg>
{:else}
	<!-- Default icon -->
	<svg class="{size} {className}" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
	</svg>
{/if}
