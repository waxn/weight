<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { user } from '$lib/stores';
	import { api } from '../../../../convex/_generated/api';
	import { convex } from '$lib/convex';
	import ExerciseCard from '$lib/components/ExerciseCard.svelte';
	import { calculatePlates, calculateDeadliftPlates, shouldShowPlateCalculator, formatPlates } from '$lib/utils/plateCalculator';

	let workoutDay: any = null;
	let isLoading = true;
	let isLogging = false;
	let completedExercises: Set<string> = new Set();
	let failedExercises: Set<string> = new Set();
	let workoutHistory: any[] = [];
	let userWeights: any[] = [];

	onMount(async () => {
		await loadWorkoutDay();
	});

	async function loadWorkoutDay() {
		if (!$user) {
			isLoading = false;
			return;
		}

		try {
			isLoading = true;
			const workoutDayId = $page.params.id;
			const [days, history, weights] = await Promise.all([
				convex.query(api.workoutDays.getUserWorkoutDays, { userId: $user._id }),
				convex.query(api.exerciseLogs.getExerciseLogs, {
					userId: $user._id,
					workoutDayId: workoutDayId as any,
					limit: 10
				}),
				convex.query(api.weights.getUserWeights, { userId: $user._id })
			]);

			workoutDay = days?.find(day => day._id === workoutDayId);
			workoutHistory = history || [];
			userWeights = weights || [];

			// Check if exercises were completed today
			const today = new Date().toDateString();
			completedExercises.clear();
			failedExercises.clear();

			workoutHistory.forEach(log => {
				const logDate = new Date(log.completedAt).toDateString();
				if (logDate === today) {
					if (log.notes === 'Completed successfully') {
						completedExercises.add(log.exerciseId);
					} else if (log.notes === 'Failed to complete') {
						failedExercises.add(log.exerciseId);
					}
				}
			});
		} catch (error) {
			console.error('Error loading workout day:', error);
		} finally {
			isLoading = false;
		}
	}

	async function markCompleted(exercise: any) {
		if (!$user) {
			alert('Please sign in to log exercises');
			return;
		}

		try {
			isLogging = true;
			await convex.mutation(api.exerciseLogs.logExercise, {
				userId: $user._id,
				exerciseId: exercise._id as any,
				workoutDayId: workoutDay._id,
				weight: exercise.weight || 0,
				reps: exercise.reps || 5,
				sets: exercise.sets || 3,
				weightIncrement: exercise.weightIncrement || 5,
				notes: 'Completed successfully'
			});
			
			// Update UI state immediately
			completedExercises.add(exercise._id);
			failedExercises.delete(exercise._id);
			
			// Reload workout day to show updated data
			await loadWorkoutDay();
		} catch (error) {
			console.error('Error logging exercise:', error);
			alert('Failed to log exercise');
		} finally {
			isLogging = false;
		}
	}

	async function markFailed(exercise: any) {
		if (!$user) {
			alert('Please sign in to log exercises');
			return;
		}

		try {
			isLogging = true;
			await convex.mutation(api.exerciseLogs.logExercise, {
				userId: $user._id,
				exerciseId: exercise._id as any,
				workoutDayId: workoutDay._id,
				weight: exercise.weight || 0,
				reps: exercise.reps || 5,
				sets: exercise.sets || 3,
				weightIncrement: exercise.weightIncrement || 5,
				notes: 'Failed to complete'
			});
			
			// Update UI state immediately
			failedExercises.add(exercise._id);
			completedExercises.delete(exercise._id);
			
			// Reload workout day to show updated data
			await loadWorkoutDay();
		} catch (error) {
			console.error('Error logging exercise:', error);
			alert('Failed to log exercise');
		} finally {
			isLogging = false;
		}
	}

	async function undoExercise(exercise: any) {
		if (!$user) {
			alert('Please sign in to undo exercises');
			return;
		}

		try {
			// Find the most recent exercise log for this exercise from today
			const today = new Date().toDateString();
			const recentLog = workoutHistory.find(log => {
				const logDate = new Date(log.completedAt).toDateString();
				return logDate === today && log.exerciseId === exercise._id;
			});

			if (recentLog) {
				// Delete the exercise log from the database
				await convex.mutation(api.exerciseLogs.deleteExerciseLog, {
					userId: $user._id,
					exerciseLogId: recentLog._id
				});

				// Update UI state
				completedExercises.delete(exercise._id);
				failedExercises.delete(exercise._id);

				// Reload workout day to refresh the data
				await loadWorkoutDay();
			}
		} catch (error) {
			console.error('Error undoing exercise:', error);
			alert('Failed to undo exercise');
		}
	}

	function goBack() {
		window.history.back();
	}
</script>

<svelte:head>
	<title>{workoutDay?.name || 'Workout'} - Workout Tracker</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
	<!-- Header -->
	<header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center h-14 sm:h-16">
				<button
					on:click={goBack}
					class="mr-2 sm:mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95 flex-shrink-0"
					aria-label="Go back"
				>
					<svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<div class="flex-1 min-w-0">
					<h1 class="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">
						{workoutDay?.name || 'Workout'}
					</h1>
					{#if workoutDay?.description}
						<p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
							{workoutDay.description}
						</p>
					{/if}
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
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
					The workout day you're looking for doesn't exist or you don't have access to it.
				</p>
				<button
					on:click={goBack}
					class="btn-primary"
				>
					Go Back
				</button>
			</div>
		{:else}
			<!-- Workout Day Info -->
			<div class="mb-8">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
							{workoutDay.name}
						</h2>
						<div class="text-sm text-gray-500 dark:text-gray-400">
							{workoutDay.exerciseDetails?.length || 0} exercises
						</div>
					</div>
					
					{#if workoutDay.description}
						<p class="text-gray-600 dark:text-gray-400 mb-4">
							{workoutDay.description}
						</p>
					{/if}

					<div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
						<span>Created {new Date(workoutDay.createdAt).toLocaleDateString()}</span>
						<span>•</span>
						<span>Last updated {new Date(workoutDay.updatedAt).toLocaleDateString()}</span>
					</div>
				</div>
			</div>

			<!-- Exercises -->
			<div class="mb-8">
				<div class="flex justify-between items-center mb-6">
					<h3 class="text-xl font-semibold text-gray-900 dark:text-white">
						Exercises
					</h3>
					<div class="flex items-center space-x-4">
						<a
							href="/workout/{workoutDay._id}/edit"
							class="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 flex items-center space-x-1"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
							</svg>
							<span>Edit Workout</span>
						</a>
						<a
							href="/workout-settings"
							class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
						>
							Configure Settings
						</a>
					</div>
				</div>

				{#if workoutDay.exerciseDetails && workoutDay.exerciseDetails.length > 0}
					<div class="space-y-4">
						{#each workoutDay.exerciseDetails as exercise}
							<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 relative">
								<div class="mb-4">
									<div class="flex items-center space-x-3 mb-2">
										{#if exercise.icon}
											<span class="text-2xl sm:text-3xl">{exercise.icon}</span>
										{/if}
										<div class="flex-1 min-w-0">
											<h4 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
												{exercise.name}
											</h4>
											<p class="text-sm text-gray-600 dark:text-gray-400">
												{exercise.sets || 3} × {exercise.reps || 5} @ {exercise.weight || 0} lbs
											</p>
										</div>
									</div>
									{#if shouldShowPlateCalculator(exercise.name) && exercise.weight > 0}
										{@const isDeadlift = exercise.name.toLowerCase().includes('deadlift')}
										{@const plates = isDeadlift ? calculateDeadliftPlates(exercise.weight, 45, userWeights) : calculatePlates(exercise.weight, 45, userWeights)}
										<div class="mt-2 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-md text-xs sm:text-sm font-medium">
											<span class="font-semibold">Each side:</span> {formatPlates(plates)}
										</div>
									{/if}
								</div>
								
								<!-- Success/Failure Buttons -->
								<div class="text-center">
									{#if completedExercises.has(exercise._id)}
										<div class="py-3 sm:py-4">
											<div class="flex items-center justify-center mb-2">
												<svg class="w-10 h-10 sm:w-12 sm:h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
												</svg>
											</div>
											<p class="text-green-600 dark:text-green-400 font-medium mb-3 text-sm sm:text-base">
												Completed! Next time: {exercise.weight + exercise.weightIncrement} lbs
											</p>
											<button
												on:click={() => undoExercise(exercise)}
												class="px-6 py-3 text-sm sm:text-base bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-95 min-h-[48px]"
											>
												Undo
											</button>
										</div>
									{:else if failedExercises.has(exercise._id)}
										<div class="py-3 sm:py-4">
											<div class="flex items-center justify-center mb-2">
												<svg class="w-10 h-10 sm:w-12 sm:h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
												</svg>
											</div>
											<p class="text-red-600 dark:text-red-400 font-medium mb-3 text-sm sm:text-base">
												Keep trying! Same weight next time.
											</p>
											<button
												on:click={() => undoExercise(exercise)}
												class="px-6 py-3 text-sm sm:text-base bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-95 min-h-[48px]"
											>
												Undo
											</button>
										</div>
									{:else}
										<p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
											Did you complete your sets?
										</p>
										<div class="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
											<button
												on:click={() => markCompleted(exercise)}
												disabled={isLogging}
												class="flex-1 sm:flex-initial px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base sm:text-lg font-medium flex items-center justify-center space-x-2 min-h-[56px] active:scale-95"
											>
												{#if isLogging}
													<span>Logging...</span>
												{:else}
													<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
													</svg>
													<span>Yes</span>
												{/if}
											</button>
											<button
												on:click={() => markFailed(exercise)}
												disabled={isLogging}
												class="flex-1 sm:flex-initial px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base sm:text-lg font-medium flex items-center justify-center space-x-2 min-h-[56px] active:scale-95"
											>
												{#if isLogging}
													<span>Logging...</span>
												{:else}
													<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
													</svg>
													<span>No</span>
												{/if}
											</button>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-12">
						<div class="flex justify-center mb-4">
							<svg class="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
							</svg>
						</div>
						<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
							No exercises added
						</h3>
						<p class="text-gray-600 dark:text-gray-400 mb-4">
							This workout day doesn't have any exercises yet.
						</p>
						<a
							href="/workout-settings"
							class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Add Exercises
						</a>
					</div>
				{/if}
			</div>

			<!-- Recent Activity -->
			<div>
				<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
					Recent Activity
				</h3>
				{#if workoutHistory.length > 0}
					<div class="space-y-3">
						{#each workoutHistory.slice(0, 5) as log}
							<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
								<div class="flex items-center justify-between">
									<div class="flex items-center space-x-3">
										{#if log.notes === 'Completed successfully'}
											<svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
											</svg>
										{:else}
											<svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
											</svg>
										{/if}
										<div>
											<p class="font-medium text-gray-900 dark:text-white">
												{log.exerciseDetails?.name || 'Exercise'}
											</p>
											<p class="text-sm text-gray-600 dark:text-gray-400">
												{log.sets} × {log.reps} @ {log.weight} lbs
											</p>
										</div>
									</div>
									<div class="text-sm text-gray-500 dark:text-gray-400">
										{new Date(log.completedAt).toLocaleDateString()}
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
						<p class="text-gray-600 dark:text-gray-400 text-center">
							No recent activity yet. Start logging your exercises to see your progress here.
						</p>
					</div>
				{/if}
			</div>
		{/if}
	</main>
</div>

