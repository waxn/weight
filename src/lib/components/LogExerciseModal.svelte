<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { user } from '$lib/stores';
	import { api } from '../../../convex/_generated/api';
	import { convex } from '$lib/convex';

	export let exercise: any;
	export let workoutDayId: string;

	const dispatch = createEventDispatcher();

	let weight = 0;
	let reps = 0;
	let sets = 1;
	let weightIncrement = 5;
	let notes = '';
	let isLoading = true;
	let isLogging = false;
	let suggestedWeight = 0;
	let lastWeight = 0;

	onMount(async () => {
		await loadExerciseData();
	});

	async function loadExerciseData() {
		if (!$user) {
			isLoading = false;
			return;
		}

		try {
			isLoading = true;
			
			// Get suggested weight
			const suggested = await convex.query(api.exerciseLogs.getSuggestedWeight, {
				userId: $user._id,
				exerciseId: exercise._id as any
			});
			suggestedWeight = suggested || 0;

			// Get last weight
			const last = await convex.query(api.exerciseLogs.getLastExerciseWeight, {
				userId: $user._id,
				exerciseId: exercise._id as any
			});
			lastWeight = last || 0;

			// Set initial values from exercise settings
			weight = exercise.weight || suggestedWeight || lastWeight || 0;
			reps = exercise.reps || 5;
			sets = exercise.sets || 3;
			weightIncrement = exercise.weightIncrement || 5;
		} catch (error) {
			console.error('Error loading exercise data:', error);
		} finally {
			isLoading = false;
		}
	}

	async function logExercise() {
		if (!$user) {
			alert('Please sign in to log exercises');
			return;
		}

		if (weight <= 0 || reps <= 0 || sets <= 0) {
			alert('Please enter valid values for weight, reps, and sets');
			return;
		}

		try {
			isLogging = true;
			await convex.mutation(api.exerciseLogs.logExercise, {
				userId: $user._id,
				exerciseId: exercise._id as any,
				workoutDayId: workoutDayId as any,
				weight,
				reps,
				sets,
				weightIncrement,
				notes: notes.trim() || undefined
			});
			
			dispatch('logged');
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

	function useSuggestedWeight() {
		weight = suggestedWeight;
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
						Log your performance
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
			{#if isLoading}
				<div class="flex justify-center items-center py-8">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				</div>
			{:else}
				<!-- Weight Input -->
				<div class="mb-6">
					<label for="weight" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Weight (lbs)
					</label>
					<div class="flex items-center space-x-2">
						<input
							id="weight"
							type="number"
							bind:value={weight}
							min="0"
							step="5"
							class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
						/>
						{#if suggestedWeight > 0}
							<button
								on:click={useSuggestedWeight}
								class="px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
								title="Use suggested weight: {suggestedWeight} lbs"
							>
								Use {suggestedWeight}lbs
							</button>
						{/if}
					</div>
					{#if lastWeight > 0}
						<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
							Last weight: {lastWeight} lbs
						</p>
					{/if}
				</div>

				<!-- Reps, Sets, and Increment -->
				<div class="grid grid-cols-3 gap-4 mb-6">
					<div>
						<label for="reps" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Reps
						</label>
						<input
							id="reps"
							type="number"
							bind:value={reps}
							min="1"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
						/>
					</div>
					<div>
						<label for="sets" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Sets
						</label>
						<input
							id="sets"
							type="number"
							bind:value={sets}
							min="1"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
						/>
					</div>
					<div>
						<label for="weightIncrement" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Increment (lbs)
						</label>
						<input
							id="weightIncrement"
							type="number"
							bind:value={weightIncrement}
							min="1"
							step="2.5"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
						/>
					</div>
				</div>

				<!-- Notes -->
				<div class="mb-6">
					<label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Notes (Optional)
					</label>
					<textarea
						id="notes"
						bind:value={notes}
						placeholder="How did it feel? Any observations?"
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
					></textarea>
				</div>

				<!-- Summary -->
				<div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
					<h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Summary</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						{sets} set{sets !== 1 ? 's' : ''} × {reps} rep{reps !== 1 ? 's' : ''} @ {weight} lbs
					</p>
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
			<button
				on:click={handleClose}
				class="btn-secondary"
			>
				Cancel
			</button>
			<button
				on:click={logExercise}
				disabled={isLogging || isLoading || weight <= 0 || reps <= 0 || sets <= 0}
				class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLogging ? 'Logging...' : 'Log Exercise'}
			</button>
		</div>
	</div>
</div>
