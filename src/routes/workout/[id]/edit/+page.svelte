<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { user } from '$lib/stores';
	import { api } from '../../../../../convex/_generated/api';
	import { convex } from '$lib/convex';
	import { goto } from '$app/navigation';

	let workoutDay: any = null;
	let allExercises: any[] = [];
	let isLoading = true;
	let isSaving = false;
	let showAddExerciseModal = false;
	let showDeleteConfirmModal = false;

	// Form data
	let formData = {
		name: '',
		description: ''
	};

	// New exercise data
	let newExercise = {
		exerciseId: '',
		weight: 0,
		reps: 5,
		sets: 3,
		weightIncrement: 5
	};

	// Exercise settings being edited
	let editingExercise: any = null;
	let editingSettings = {
		weight: 0,
		reps: 5,
		sets: 3,
		weightIncrement: 5
	};

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		if (!$user) {
			isLoading = false;
			return;
		}
		
		try {
			isLoading = true;
			const workoutDayId = $page.params.id;
			
			// Load workout day and all exercises in parallel
			const [workoutDays, exercises] = await Promise.all([
				convex.query(api.workoutDays.getUserWorkoutDays, { userId: $user._id }),
				convex.query(api.exercises.getAllExercises, {})
			]);
			
			workoutDay = workoutDays?.find(day => day._id === workoutDayId);
			allExercises = exercises || [];
			
			if (workoutDay) {
				formData.name = workoutDay.name;
				formData.description = workoutDay.description || '';
			}
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			isLoading = false;
		}
	}

	async function saveWorkoutDay() {
		if (!$user || !workoutDay) return;
		
		try {
			isSaving = true;
			await convex.mutation(api.workoutDays.updateWorkoutDay, {
				workoutDayId: workoutDay._id,
				name: formData.name,
				description: formData.description,
				exerciseIds: workoutDay.exercises || []
			});
			
			// Reload data to get updated workout day
			await loadData();
			alert('Workout day updated successfully!');
		} catch (error) {
			console.error('Error updating workout day:', error);
			alert('Failed to update workout day');
		} finally {
			isSaving = false;
		}
	}

	async function addExercise() {
		if (!$user || !workoutDay || !newExercise.exerciseId) {
			alert('Please select an exercise');
			return;
		}

		try {
			await convex.mutation(api.workoutDays.addExerciseToWorkoutDay, {
				userId: $user._id,
				workoutDayId: workoutDay._id,
				exerciseId: newExercise.exerciseId,
				weight: newExercise.weight,
				reps: newExercise.reps,
				sets: newExercise.sets,
				weightIncrement: newExercise.weightIncrement
			});
			
			alert('Exercise added successfully!');
			closeAddExerciseModal();
			await loadData();
		} catch (error) {
			console.error('Error adding exercise:', error);
			alert('Failed to add exercise');
		}
	}

	async function removeExercise(exerciseId: string) {
		if (!$user || !workoutDay) return;
		
		try {
			await convex.mutation(api.workoutDays.removeExerciseFromWorkoutDay, {
				userId: $user._id,
				workoutDayId: workoutDay._id,
				exerciseId: exerciseId
			});
			
			alert('Exercise removed successfully!');
			await loadData();
		} catch (error) {
			console.error('Error removing exercise:', error);
			alert('Failed to remove exercise');
		}
	}

	async function updateExerciseSettings(exerciseId: string) {
		if (!$user || !workoutDay) return;
		
		try {
			await convex.mutation(api.workoutDays.updateExerciseInWorkoutDay, {
				userId: $user._id,
				workoutDayId: workoutDay._id,
				exerciseId: exerciseId,
				weight: editingSettings.weight,
				reps: editingSettings.reps,
				sets: editingSettings.sets,
				weightIncrement: editingSettings.weightIncrement
			});
			
			alert('Exercise settings updated successfully!');
			editingExercise = null;
			await loadData();
		} catch (error) {
			console.error('Error updating exercise settings:', error);
			alert('Failed to update exercise settings');
		}
	}

	function openAddExerciseModal() {
		showAddExerciseModal = true;
		newExercise = {
			exerciseId: '',
			weight: 0,
			reps: 5,
			sets: 3,
			weightIncrement: 5
		};
	}

	function closeAddExerciseModal() {
		showAddExerciseModal = false;
	}

	function startEditingExercise(exercise: any) {
		editingExercise = exercise;
		editingSettings = {
			weight: exercise.weight || 0,
			reps: exercise.reps || 5,
			sets: exercise.sets || 3,
			weightIncrement: exercise.weightIncrement || 5
		};
	}

	function cancelEditingExercise() {
		editingExercise = null;
	}

	function goBack() {
		if (workoutDay) {
			goto(`/workout/${workoutDay._id}`);
		} else {
			goto('/');
		}
	}

	function getAvailableExercises() {
		if (!workoutDay || !allExercises) return [];
		const usedExerciseIds = workoutDay.exercises || [];
		return allExercises.filter(exercise => !usedExerciseIds.includes(exercise._id));
	}
</script>

<svelte:head>
	<title>Edit {workoutDay?.name || 'Workout'} - Workout Tracker</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
	<!-- Header -->
	<header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<div class="flex items-center">
					<button
						on:click={goBack}
						class="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						aria-label="Go back"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<h1 class="text-xl font-bold text-gray-900 dark:text-white">
						Edit {workoutDay?.name || 'Workout'}
					</h1>
				</div>
				<div class="flex items-center space-x-3">
					<a
						href="/"
						class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						aria-label="Go to homepage"
						title="Homepage"
					>
						<svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
						</svg>
					</a>
					<button
						on:click={saveWorkoutDay}
						disabled={isSaving || !formData.name.trim()}
						class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
					>
						{#if isSaving}
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
							<span>Saving...</span>
						{:else}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span>Save Changes</span>
						{/if}
					</button>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if isLoading}
			<div class="flex justify-center items-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		{:else if !workoutDay}
			<div class="text-center py-12">
				<div class="text-4xl mb-4">❌</div>
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
					Workout day not found
				</h2>
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					The workout day you're trying to edit doesn't exist or you don't have access to it.
				</p>
				<button
					on:click={goBack}
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Go Back
				</button>
			</div>
		{:else}
			<div class="space-y-8">
				<!-- Workout Day Info -->
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						Workout Day Details
					</h2>
					
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Name *
							</label>
							<input
								type="text"
								bind:value={formData.name}
								placeholder="e.g., Leg Day, Push Day"
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
								required
							/>
						</div>
						
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Description
							</label>
							<textarea
								bind:value={formData.description}
								placeholder="Optional description for this workout day"
								rows="3"
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
							></textarea>
						</div>
					</div>
				</div>

				<!-- Exercises -->
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
					<div class="flex justify-between items-center mb-6">
						<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
							Exercises
						</h2>
						<button
							on:click={openAddExerciseModal}
							disabled={getAvailableExercises().length === 0}
							class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
							</svg>
							<span>Add Exercise</span>
						</button>
					</div>

					{#if workoutDay.exerciseDetails && workoutDay.exerciseDetails.length > 0}
						<div class="space-y-4">
							{#each workoutDay.exerciseDetails as exercise}
								<div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
									{#if editingExercise && editingExercise._id === exercise._id}
										<!-- Edit Mode -->
										<div class="space-y-4">
											<div class="flex items-center justify-between">
												<div class="flex items-center space-x-3">
													{#if exercise.icon}
														<span class="text-2xl">{exercise.icon}</span>
													{/if}
													<div>
														<h3 class="font-medium text-gray-900 dark:text-white">
															{exercise.name}
														</h3>
														<p class="text-sm text-gray-600 dark:text-gray-400">
															Edit settings for this exercise
														</p>
													</div>
												</div>
											</div>

											<!-- Exercise Settings -->
											<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
												<div>
													<label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
														Weight (lbs)
													</label>
													<input
														type="number"
														bind:value={editingSettings.weight}
														min="0"
														step="5"
														class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
													/>
												</div>
												<div>
													<label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
														Sets
													</label>
													<input
														type="number"
														bind:value={editingSettings.sets}
														min="1"
														class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
													/>
												</div>
												<div>
													<label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
														Reps
													</label>
													<input
														type="number"
														bind:value={editingSettings.reps}
														min="1"
														class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
													/>
												</div>
												<div>
													<label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
														Increment (lbs)
													</label>
													<input
														type="number"
														bind:value={editingSettings.weightIncrement}
														min="1"
														step="2.5"
														class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
													/>
												</div>
											</div>

											<div class="flex justify-end space-x-3">
												<button
													on:click={cancelEditingExercise}
													class="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
												>
													Cancel
												</button>
												<button
													on:click={() => updateExerciseSettings(exercise._id)}
													class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
												>
													Save
												</button>
											</div>
										</div>
									{:else}
										<!-- View Mode -->
										<div class="flex items-center justify-between">
											<div class="flex items-center space-x-3">
												{#if exercise.icon}
													<span class="text-2xl">{exercise.icon}</span>
												{/if}
												<div>
													<h3 class="font-medium text-gray-900 dark:text-white">
														{exercise.name}
													</h3>
													<p class="text-sm text-gray-600 dark:text-gray-400">
														{exercise.sets || 3} × {exercise.reps || 5} @ {exercise.weight || 0} lbs
														<span class="text-xs text-gray-500">(+{exercise.weightIncrement || 5} lbs increment)</span>
													</p>
												</div>
											</div>
											<div class="flex items-center space-x-2">
												<button
													on:click={() => startEditingExercise(exercise)}
													class="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
												>
													Edit
												</button>
												<button
													on:click={() => removeExercise(exercise._id)}
													class="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
												>
													Remove
												</button>
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8">
							<div class="flex justify-center mb-4">
								<svg class="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
								</svg>
							</div>
							<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
								No exercises yet
							</h3>
							<p class="text-gray-600 dark:text-gray-400 mb-4">
								Add exercises to configure your workout
							</p>
							<button
								on:click={openAddExerciseModal}
								disabled={getAvailableExercises().length === 0}
								class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								Add First Exercise
							</button>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</main>
</div>

<!-- Add Exercise Modal -->
{#if showAddExerciseModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
			<div class="p-6">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
					Add Exercise to {formData.name}
				</h3>
				
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Exercise
						</label>
						<select
							bind:value={newExercise.exerciseId}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
						>
							<option value="">Select an exercise</option>
							{#each getAvailableExercises() as exercise}
								<option value={exercise._id}>{exercise.name}</option>
							{/each}
						</select>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Weight (lbs)
							</label>
							<input
								type="number"
								bind:value={newExercise.weight}
								min="0"
								step="5"
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Sets
							</label>
							<input
								type="number"
								bind:value={newExercise.sets}
								min="1"
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Reps
							</label>
							<input
								type="number"
								bind:value={newExercise.reps}
								min="1"
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Increment (lbs)
							</label>
							<input
								type="number"
								bind:value={newExercise.weightIncrement}
								min="1"
								step="2.5"
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
							/>
						</div>
					</div>
				</div>

				<div class="flex justify-end space-x-3 mt-6">
					<button
						on:click={closeAddExerciseModal}
						class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
					>
						Cancel
					</button>
					<button
						on:click={addExercise}
						disabled={!newExercise.exerciseId}
						class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Add Exercise
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
