<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { user } from '$lib/stores';
	import { api } from '../../../../convex/_generated/api';
	import { convex } from '$lib/convex';
	import ExerciseCard from '$lib/components/ExerciseCard.svelte';

	let workoutDay: any = null;
	let isLoading = true;
	let isLogging = false;
	let completedExercises: Set<string> = new Set();
	let failedExercises: Set<string> = new Set();
	let workoutHistory: any[] = [];

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
			const [days, history] = await Promise.all([
				convex.query(api.workoutDays.getUserWorkoutDays, { userId: $user._id }),
				convex.query(api.exerciseLogs.getExerciseLogs, { 
					userId: $user._id, 
					workoutDayId: workoutDayId as any,
					limit: 10
				})
			]);
			
			workoutDay = days?.find(day => day._id === workoutDayId);
			workoutHistory = history || [];
			
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

	function goBack() {
		window.history.back();
	}
</script>

<svelte:head>
	<title>{workoutDay?.name || 'Workout'} - Workout Tracker</title>
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
				<div>
					<h1 class="text-xl font-bold text-gray-900 dark:text-white">
						{workoutDay?.name || 'Workout'}
					</h1>
					{#if workoutDay?.description}
						<p class="text-sm text-gray-600 dark:text-gray-400">
							{workoutDay.description}
						</p>
					{/if}
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
					<a
						href="/workout-settings"
						class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
					>
						Configure Settings
					</a>
				</div>

				{#if workoutDay.exerciseDetails && workoutDay.exerciseDetails.length > 0}
					<div class="space-y-4">
						{#each workoutDay.exerciseDetails as exercise}
							<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
								<div class="flex items-center justify-between mb-4">
									<div class="flex items-center space-x-3">
										{#if exercise.icon}
											<span class="text-3xl">{exercise.icon}</span>
										{/if}
										<div>
											<h4 class="text-lg font-semibold text-gray-900 dark:text-white">
												{exercise.name}
											</h4>
											<p class="text-sm text-gray-600 dark:text-gray-400">
												{exercise.sets || 3} × {exercise.reps || 5} @ {exercise.weight || 0} lbs
											</p>
										</div>
									</div>
								</div>
								
								<!-- Success/Failure Buttons -->
								<div class="text-center">
									{#if completedExercises.has(exercise._id)}
										<div class="py-4">
											<div class="text-4xl mb-2">✅</div>
											<p class="text-green-600 dark:text-green-400 font-medium">
												Completed! Next time: {exercise.weight + exercise.weightIncrement} lbs
											</p>
										</div>
									{:else if failedExercises.has(exercise._id)}
										<div class="py-4">
											<div class="text-4xl mb-2">❌</div>
											<p class="text-red-600 dark:text-red-400 font-medium">
												Keep trying! Same weight next time.
											</p>
										</div>
									{:else}
										<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
											Did you complete your sets?
										</p>
										<div class="flex space-x-4 justify-center">
											<button
												on:click={() => markCompleted(exercise)}
												disabled={isLogging}
												class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
											>
												{isLogging ? 'Logging...' : '✅ Yes'}
											</button>
											<button
												on:click={() => markFailed(exercise)}
												disabled={isLogging}
												class="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
											>
												{isLogging ? 'Logging...' : '❌ No'}
											</button>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-12">
						<div class="text-4xl mb-4">🏋️‍♂️</div>
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
											<span class="text-green-600 dark:text-green-400 text-xl">✅</span>
										{:else}
											<span class="text-red-600 dark:text-red-400 text-xl">❌</span>
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

