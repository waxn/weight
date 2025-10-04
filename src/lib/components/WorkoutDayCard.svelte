<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { api } from '../../../convex/_generated/api';
	import { convex } from '$lib/convex';

	export let workoutDay: any;

	const dispatch = createEventDispatcher();

	async function deleteWorkoutDay() {
		if (confirm('Are you sure you want to delete this workout day?')) {
			try {
				await convex.mutation(api.workoutDays.deleteWorkoutDay, {
					workoutDayId: workoutDay._id
				});
				dispatch('deleted');
			} catch (error) {
				console.error('Error deleting workout day:', error);
				alert('Failed to delete workout day');
			}
		}
	}

	function formatDate(timestamp: number) {
		return new Date(timestamp).toLocaleDateString();
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
	<div class="p-6">
		<div class="flex justify-between items-start mb-4">
			<div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
					{workoutDay.name}
				</h3>
				{#if workoutDay.description}
					<p class="text-sm text-gray-600 dark:text-gray-400">
						{workoutDay.description}
					</p>
				{/if}
			</div>
			<button
				onclick={deleteWorkoutDay}
				class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
				aria-label="Delete workout day"
			>
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
				</svg>
			</button>
		</div>

		<div class="mb-4">
			<h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
				Exercises ({workoutDay.exerciseDetails?.length || 0})
			</h4>
			{#if workoutDay.exerciseDetails && workoutDay.exerciseDetails.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each workoutDay.exerciseDetails as exercise}
						<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
							{#if exercise.icon}
								<span class="mr-1">{exercise.icon}</span>
							{/if}
							{exercise.name}
						</span>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-gray-500 dark:text-gray-400">No exercises added yet</p>
			{/if}
		</div>

		<div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
			<span>Created {formatDate(workoutDay.createdAt)}</span>
			<a
				href="/workout/{workoutDay._id}"
				class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
			>
				Start Workout
			</a>
		</div>
	</div>
</div>
