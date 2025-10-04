<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { user } from '$lib/stores';
	import { api } from '../../../../convex/_generated/api';
	import { convex } from '$lib/convex';
	import ExerciseCard from '$lib/components/ExerciseCard.svelte';
	import LogExerciseModal from '$lib/components/LogExerciseModal.svelte';

	let workoutDay: any = null;
	let isLoading = true;
	let selectedExercise: any = null;
	let showLogModal = false;

	onMount(async () => {
		await loadWorkoutDay();
	});

	async function loadWorkoutDay() {
		try {
			isLoading = true;
			const workoutDayId = $page.params.id;
			const days = await convex.query(api.workoutDays.getUserWorkoutDays, {});
			workoutDay = days?.find(day => day._id === workoutDayId);
		} catch (error) {
			console.error('Error loading workout day:', error);
		} finally {
			isLoading = false;
		}
	}

	function startExercise(exercise: any) {
		selectedExercise = exercise;
		showLogModal = true;
	}

	function handleExerciseLogged() {
		showLogModal = false;
		selectedExercise = null;
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
				<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
					Exercises
				</h3>

				{#if workoutDay.exerciseDetails && workoutDay.exerciseDetails.length > 0}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						{#each workoutDay.exerciseDetails as exercise}
							<ExerciseCard 
								{exercise} 
								on:start={() => startExercise(exercise)}
							/>
						{/each}
					</div>
				{:else}
					<div class="text-center py-12">
						<div class="text-4xl mb-4">🏋️‍♂️</div>
						<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
							No exercises added
						</h3>
						<p class="text-gray-600 dark:text-gray-400">
							This workout day doesn't have any exercises yet.
						</p>
					</div>
				{/if}
			</div>

			<!-- Recent Activity -->
			<div>
				<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
					Recent Activity
				</h3>
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
					<p class="text-gray-600 dark:text-gray-400 text-center">
						No recent activity yet. Start logging your exercises to see your progress here.
					</p>
				</div>
			</div>
		{/if}
	</main>
</div>

<!-- Log Exercise Modal -->
{#if showLogModal && selectedExercise}
	<LogExerciseModal 
		exercise={selectedExercise}
		workoutDayId={workoutDay?._id}
		on:close={() => {
			showLogModal = false;
			selectedExercise = null;
		}}
		on:logged={handleExerciseLogged}
	/>
{/if}
