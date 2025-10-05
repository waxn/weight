<script lang="ts">
	import { onMount } from 'svelte';
	import { user, darkMode } from '$lib/stores';
	import { api } from '../../convex/_generated/api';
	import { convex } from '$lib/convex';
	import DarkModeToggle from '$lib/components/DarkModeToggle.svelte';
	import WorkoutDayCard from '$lib/components/WorkoutDayCard.svelte';
	import CreateWorkoutDayModal from '$lib/components/CreateWorkoutDayModal.svelte';

	let workoutDays: any[] = [];
	let showCreateModal = false;
	let isLoading = true;

	onMount(async () => {
		// Initialize built-in exercises
		await convex.mutation(api.exercises.initializeBuiltInExercises, {});
		
		// Load workout days only if user is logged in
		if ($user) {
			loadWorkoutDays();
		}
	});

	async function loadWorkoutDays() {
		if (!$user) return;
		
		try {
			isLoading = true;
			const days = await convex.query(api.workoutDays.getUserWorkoutDays, { userId: $user._id });
			workoutDays = days || [];
		} catch (error) {
			console.error('Error loading workout days:', error);
		} finally {
			isLoading = false;
		}
	}

	function handleSignIn() {
		// Navigate to login page
		window.location.href = '/login';
	}

	async function handleSignOut() {
		// Clear user session
		localStorage.removeItem('user');
		user.set(null);
		// Reload the page
		window.location.reload();
	}

	function handleWorkoutDayCreated() {
		showCreateModal = false;
		loadWorkoutDays();
	}

	function handleWorkoutDayDeleted() {
		loadWorkoutDays();
	}
</script>

<svelte:head>
	<title>Workout Tracker</title>
	<meta name="description" content="Track your workouts and fitness progress" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
	<!-- Header -->
	<header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-14 sm:h-16">
				<div class="flex items-center min-w-0">
					<svg class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
					</svg>
					<h1 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">Workout Tracker</h1>
				</div>
				<div class="flex items-center space-x-2 sm:space-x-4">
					<DarkModeToggle />
					{#if $user}
						<div class="flex items-center space-x-1 sm:space-x-2">
							<a
								href="/stats"
								class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
								aria-label="Workout Statistics"
								title="Workout Statistics"
							>
								<svg class="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</a>
							<a
								href="/settings"
								class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
								aria-label="Settings"
								title="Settings"
							>
								<svg class="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
							</a>
							<span class="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">Welcome, {$user.name}</span>
							<button
								onclick={handleSignOut}
								class="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors active:scale-95 min-h-[36px]"
							>
								Sign Out
							</button>
						</div>
					{:else}
						<button
							onclick={handleSignIn}
							class="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors active:scale-95 min-h-[40px]"
						>
							Sign In
						</button>
					{/if}
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if !$user}
			<!-- Welcome Screen -->
			<div class="text-center py-12">
				<div class="max-w-md mx-auto">
					<div class="flex justify-center mb-4">
						<svg class="w-16 h-16 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
						</svg>
					</div>
					<h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
						Welcome to Workout Tracker
					</h2>
					<p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
						Track your workouts, set goals, and monitor your fitness progress.
					</p>
					<button
						onclick={handleSignIn}
						class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
					>
						Get Started
					</button>
				</div>
			</div>
		{:else}
			<!-- Dashboard -->
			<div class="mb-8">
				<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
					<h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Your Workout Days</h2>
					<button
						onclick={() => showCreateModal = true}
						class="px-4 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center space-x-2 active:scale-95 min-h-[48px]"
					>
						<span class="text-xl sm:text-base">+</span>
						<span class="text-base sm:text-sm">Add Workout Day</span>
					</button>
				</div>

				{#if isLoading}
					<div class="flex justify-center items-center py-12">
						<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					</div>
				{:else if workoutDays.length === 0}
					<div class="text-center py-12">
						<div class="flex justify-center mb-4">
							<svg class="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
							</svg>
						</div>
						<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
							No workout days yet
						</h3>
						<p class="text-gray-600 dark:text-gray-400 mb-6">
							Create your first workout day to get started.
						</p>
						<button
							onclick={() => showCreateModal = true}
							class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
						>
							Create Workout Day
						</button>
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{#each workoutDays as workoutDay}
							<WorkoutDayCard 
								{workoutDay} 
								on:deleted={handleWorkoutDayDeleted}
							/>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</main>
</div>

<!-- Create Workout Day Modal -->
{#if showCreateModal}
	<CreateWorkoutDayModal 
		on:close={() => showCreateModal = false}
		on:created={handleWorkoutDayCreated}
	/>
{/if}
