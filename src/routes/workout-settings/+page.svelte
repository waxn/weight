<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/stores';
	import { api } from '../../../convex/_generated/api';
	import { convex } from '$lib/convex';

	let workoutDays: any[] = [];
	let exercises: any[] = [];
	let isLoading = true;
	let selectedWorkoutDay: any = null;
	let showAddExerciseModal = false;
	let newExercise = {
		exerciseId: '',
		weight: 0,
		reps: 5,
		sets: 3,
		weightIncrement: 5
	};

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		if (!$user) return;
		
		try {
			isLoading = true;
			const [workoutDaysData, exercisesData] = await Promise.all([
				convex.query(api.workoutDays.getUserWorkoutDays, { userId: $user._id }),
				convex.query(api.exercises.getAllExercises, {})
			]);
			
			console.log('Workout days data:', workoutDaysData);
			console.log('Exercises data:', exercisesData);
			
			workoutDays = workoutDaysData || [];
			exercises = exercisesData || [];
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			isLoading = false;
		}
	}

	function selectWorkoutDay(workoutDay: any) {
		selectedWorkoutDay = workoutDay;
	}

	function goBack() {
		window.history.back();
	}

	function openAddExerciseModal() {
		showAddExerciseModal = true;
	}

	function closeAddExerciseModal() {
		showAddExerciseModal = false;
		newExercise = {
			exerciseId: '',
			weight: 0,
			reps: 5,
			sets: 3,
			weightIncrement: 5
		};
	}

	async function addExercise() {
		if (!newExercise.exerciseId || newExercise.weight <= 0) {
			alert('Please select an exercise and enter a valid weight');
			return;
		}

		try {
			await convex.mutation(api.workoutDays.addExerciseToWorkoutDay, {
				userId: $user._id,
				workoutDayId: selectedWorkoutDay._id,
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
</script>

<svelte:head>
	<title>Workout Settings - Workout Tracker</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
	<!-- Header -->
	<header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center h-16">
				<button
					on:click={goBack}
					class="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					aria-label="Go back"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<h1 class="text-xl font-bold text-gray-900 dark:text-white">Workout Settings</h1>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if isLoading}
			<div class="flex justify-center items-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		{:else}
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<!-- Workout Days List -->
				<div class="lg:col-span-1">
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
						Your Workout Days
					</h2>
					{#if workoutDays.length > 0}
						<div class="space-y-3">
							{#each workoutDays as workoutDay}
								<button
									on:click={() => selectWorkoutDay(workoutDay)}
									class="w-full text-left p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow {selectedWorkoutDay?._id === workoutDay._id ? 'ring-2 ring-blue-500' : ''}"
								>
									<h3 class="font-medium text-gray-900 dark:text-white">
										{workoutDay.name || 'Unnamed Workout'}
									</h3>
									<p class="text-sm text-gray-600 dark:text-gray-400">
										{workoutDay.exercises?.length || 0} exercises
									</p>
								</button>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8">
							<div class="text-4xl mb-4">📋</div>
							<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
								No workout days yet
							</h3>
							<p class="text-gray-600 dark:text-gray-400 mb-4">
								Create your first workout day to get started
							</p>
							<a
								href="/"
								class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								Create Workout Day
							</a>
						</div>
					{/if}
				</div>

				<!-- Exercise Settings -->
				<div class="lg:col-span-2">
					{#if selectedWorkoutDay}
						<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
							<div class="flex justify-between items-center mb-6">
								<div>
									<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
										{selectedWorkoutDay.name}
									</h2>
									<p class="text-sm text-gray-600 dark:text-gray-400">
										Configure weights, sets, reps, and increments for each exercise
									</p>
								</div>
								<button
									on:click={openAddExerciseModal}
									class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
								>
									+ Add Exercise
								</button>
							</div>

							<!-- Exercise List -->
							<div class="space-y-4">
								{#if selectedWorkoutDay.exercises && selectedWorkoutDay.exercises.length > 0}
									{#each selectedWorkoutDay.exercises as exercise}
										<div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
											<div class="flex items-center justify-between mb-3">
												<div class="flex items-center space-x-3">
													{#if exercise.icon}
														<span class="text-2xl">{exercise.icon}</span>
													{/if}
													<div>
														<h3 class="font-medium text-gray-900 dark:text-white">
															{exercise.name}
														</h3>
														<p class="text-sm text-gray-600 dark:text-gray-400">
															{exercise.description || 'No description'}
														</p>
													</div>
												</div>
												<button class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
													Remove
												</button>
											</div>

											<!-- Exercise Settings -->
											<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
												<div>
													<label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
														Weight (lbs)
													</label>
													<input
														type="number"
														value={exercise.weight || 0}
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
														value={exercise.sets || 3}
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
														value={exercise.reps || 5}
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
														value={exercise.weightIncrement || 5}
														min="1"
														step="2.5"
														class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
													/>
												</div>
											</div>
										</div>
									{/each}
								{:else}
									<div class="text-center py-8">
										<div class="text-4xl mb-4">🏋️‍♂️</div>
										<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
											No exercises yet
										</h3>
										<p class="text-gray-600 dark:text-gray-400 mb-4">
											Add exercises to configure your workout
										</p>
										<button
											on:click={openAddExerciseModal}
											class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
										>
											Add First Exercise
										</button>
									</div>
								{/if}
							</div>
						</div>
					{:else}
						<div class="text-center py-12">
							<div class="text-4xl mb-4">📋</div>
							<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
								Select a Workout Day
							</h2>
							<p class="text-gray-600 dark:text-gray-400">
								Choose a workout day from the list to configure exercise settings
							</p>
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
					Add Exercise to {selectedWorkoutDay?.name}
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
							{#each exercises as exercise}
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
						disabled={!newExercise.exerciseId || newExercise.weight <= 0}
						class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Add Exercise
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
