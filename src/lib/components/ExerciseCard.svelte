<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let exercise: any;

	const dispatch = createEventDispatcher();

	function startExercise() {
		dispatch('start', exercise);
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
	<div class="p-6">
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center space-x-3">
				{#if exercise.icon}
					<span class="text-2xl">{exercise.icon}</span>
				{/if}
				<div>
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
						{exercise.name}
					</h3>
					{#if exercise.category}
						<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
							{exercise.category}
						</span>
					{/if}
				</div>
			</div>
		</div>

		{#if exercise.description}
			<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
				{exercise.description}
			</p>
		{/if}

		<div class="flex justify-between items-center">
			<div class="text-sm text-gray-500 dark:text-gray-400">
				<!-- Placeholder for last performance -->
				<span>No previous logs</span>
			</div>
			<button
				on:click={startExercise}
				class="btn-primary"
			>
				Start Exercise
			</button>
		</div>
	</div>
</div>
