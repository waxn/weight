<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { api } from '../../../convex/_generated/api';
	import { convex } from '$lib/convex';
	import ExerciseIcon from './ExerciseIcon.svelte';

	const dispatch = createEventDispatcher();

	let name = '';
	let description = '';
	let selectedExercises: any[] = [];
	let availableExercises: any[] = [];
	let isLoading = true;
	let isCreating = false;

	onMount(async () => {
		await loadExercises();
	});

	async function loadExercises() {
		try {
			isLoading = true;
			const exercises = await convex.query(api.exercises.getAllExercises, {});
			availableExercises = exercises || [];
		} catch (error) {
			console.error('Error loading exercises:', error);
		} finally {
			isLoading = false;
		}
	}

	function toggleExercise(exercise: any) {
		const index = selectedExercises.findIndex(e => e._id === exercise._id);
		if (index > -1) {
			selectedExercises = selectedExercises.filter(e => e._id !== exercise._id);
		} else {
			selectedExercises = [...selectedExercises, exercise];
		}
	}

	async function createWorkoutDay() {
		if (!name.trim()) {
			alert('Please enter a name for your workout day');
			return;
		}

		if (selectedExercises.length === 0) {
			alert('Please select at least one exercise');
			return;
		}

		try {
			isCreating = true;
			await convex.mutation(api.workoutDays.createWorkoutDay, {
				name: name.trim(),
				description: description.trim() || undefined,
				exerciseIds: selectedExercises.map(e => e._id)
			});
			
			dispatch('created');
		} catch (error) {
			console.error('Error creating workout day:', error);
			alert('Failed to create workout day');
		} finally {
			isCreating = false;
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
	onclick={handleBackdropClick}
	onkeydown={handleKeydown}
	role="dialog"
	aria-modal="true"
	tabindex="-1"
>
	<!-- Modal Content -->
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
		<!-- Header -->
		<div class="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
				Create Workout Day
			</h2>
			<button
				onclick={handleClose}
				class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
				aria-label="Close modal"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Content -->
		<div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
			<!-- Workout Day Details -->
			<div class="mb-6">
				<div class="mb-4">
					<label for="workout-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Workout Day Name *
					</label>
					<input
						id="workout-name"
						type="text"
						bind:value={name}
						placeholder="e.g., Leg Day, Push Day, Upper Body"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div class="mb-4">
					<label for="workout-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Description (Optional)
					</label>
					<textarea
						id="workout-description"
						bind:value={description}
						placeholder="Describe your workout day..."
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
					></textarea>
				</div>
			</div>

			<!-- Exercise Selection -->
			<div>
				<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
					Select Exercises ({selectedExercises.length} selected)
				</h3>

				{#if isLoading}
					<div class="flex justify-center items-center py-8">
						<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					</div>
				{:else}
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
						{#each availableExercises as exercise}
							<label class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
							<input
								type="checkbox"
								checked={selectedExercises.some(e => e._id === exercise._id)}
								onchange={() => toggleExercise(exercise)}
								class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
								<div class="flex items-center space-x-2">
									<ExerciseIcon icon={exercise.icon} size="w-5 h-5" className="text-gray-600 dark:text-gray-400" />
									<div>
										<div class="font-medium text-gray-900 dark:text-white">
											{exercise.name}
										</div>
										{#if exercise.category}
											<div class="text-sm text-gray-500 dark:text-gray-400">
												{exercise.category}
											</div>
										{/if}
									</div>
								</div>
							</label>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Footer -->
		<div class="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
			<button
				onclick={handleClose}
				class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
			>
				Cancel
			</button>
			<button
				onclick={createWorkoutDay}
				disabled={isCreating || !name.trim() || selectedExercises.length === 0}
				class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{isCreating ? 'Creating...' : 'Create Workout Day'}
			</button>
		</div>
	</div>
</div>
