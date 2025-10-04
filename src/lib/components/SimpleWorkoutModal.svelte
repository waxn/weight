<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { user } from '$lib/stores';
	import { api } from '../../../convex/_generated/api';
	import { convex } from '$lib/convex';

	export let exercise: any;
	export let workoutDayId: string;

	const dispatch = createEventDispatcher();

	let isLogging = false;
	let completed = false;
	let failed = false;

	async function markCompleted() {
		if (!$user) {
			alert('Please sign in to log exercises');
			return;
		}

		try {
			isLogging = true;
			await convex.mutation(api.exerciseLogs.logExercise, {
				userId: $user._id,
				exerciseId: exercise._id as any,
				workoutDayId: workoutDayId as any,
				weight: exercise.weight || 0,
				reps: exercise.reps || 5,
				sets: exercise.sets || 3,
				weightIncrement: exercise.weightIncrement || 5,
				notes: 'Completed successfully'
			});
			
			completed = true;
			setTimeout(() => {
				dispatch('logged');
			}, 1500);
		} catch (error) {
			console.error('Error logging exercise:', error);
			alert('Failed to log exercise');
		} finally {
			isLogging = false;
		}
	}

	async function markFailed() {
		if (!$user) {
			alert('Please sign in to log exercises');
			return;
		}

		try {
			isLogging = true;
			await convex.mutation(api.exerciseLogs.logExercise, {
				userId: $user._id,
				exerciseId: exercise._id as any,
				workoutDayId: workoutDayId as any,
				weight: exercise.weight || 0,
				reps: exercise.reps || 5,
				sets: exercise.sets || 3,
				weightIncrement: exercise.weightIncrement || 5,
				notes: 'Failed to complete'
			});
			
			failed = true;
			setTimeout(() => {
				dispatch('logged');
			}, 1500);
		} catch (error) {
			console.error('Error logging exercise:', error);
			alert('Failed to log exercise');
		} finally {
			isLogging = false;
		}
	}

	function handleClose() {
		dispatch('close');
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}
</script>

<!-- Modal Backdrop -->
<div
	class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
	on:click={handleBackdropClick}
	on:keydown={handleKeydown}
	role="dialog"
	aria-modal="true"
	tabindex="-1"
>
	<!-- Modal Content -->
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
		<!-- Header -->
		<div class="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
			<div class="flex items-center space-x-3">
				{#if exercise.icon}
					<span class="text-2xl">{exercise.icon}</span>
				{/if}
				<div>
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
						{exercise.name}
					</h2>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						{exercise.sets || 3} × {exercise.reps || 5} @ {exercise.weight || 0} lbs
					</p>
				</div>
			</div>
			<button
				on:click={handleClose}
				class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
				aria-label="Close modal"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Content -->
		<div class="p-6">
			{#if completed}
				<div class="text-center py-8">
					<div class="text-6xl mb-4">✅</div>
					<h3 class="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
						Great job!
					</h3>
					<p class="text-gray-600 dark:text-gray-400">
						Exercise completed successfully. Next time: {exercise.weight + exercise.weightIncrement} lbs
					</p>
				</div>
			{:else if failed}
				<div class="text-center py-8">
					<div class="text-6xl mb-4">❌</div>
					<h3 class="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
						Keep trying!
					</h3>
					<p class="text-gray-600 dark:text-gray-400">
						Don't worry, next time you'll get it. Same weight next workout.
					</p>
				</div>
			{:else}
				<div class="text-center py-8">
					<div class="text-4xl mb-6">🏋️‍♂️</div>
					<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						Did you complete your sets?
					</h3>
					<p class="text-gray-600 dark:text-gray-400 mb-8">
						{exercise.sets || 3} sets of {exercise.reps || 5} reps at {exercise.weight || 0} lbs
					</p>
					
					<div class="flex space-x-4 justify-center">
						<button
							on:click={markCompleted}
							disabled={isLogging}
							class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
						>
							{isLogging ? 'Logging...' : '✅ Yes'}
						</button>
						<button
							on:click={markFailed}
							disabled={isLogging}
							class="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
						>
							{isLogging ? 'Logging...' : '❌ No'}
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
