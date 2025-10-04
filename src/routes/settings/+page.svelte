<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/stores';
	import { api } from '../../../convex/_generated/api';
	import { convex } from '$lib/convex';

	let currentUser: any = null;
	let isLoading = true;

	onMount(async () => {
		await loadUserData();
	});

	async function loadUserData() {
		try {
			isLoading = true;
			// Use the current user from the store
			currentUser = $user;
		} catch (error) {
			console.error('Error loading user data:', error);
		} finally {
			isLoading = false;
		}
	}


	function goBack() {
		window.history.back();
	}
</script>

<svelte:head>
	<title>Settings - Workout Tracker</title>
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
				<h1 class="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if isLoading}
			<div class="flex justify-center items-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		{:else if !currentUser}
			<div class="text-center py-12">
				<div class="text-4xl mb-4">❌</div>
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
					Not authenticated
				</h2>
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					Please sign in to access your settings.
				</p>
				<button
					on:click={() => console.log('Sign in clicked - implement authentication here')}
					class="btn-primary"
				>
					Sign In
				</button>
			</div>
		{:else}
			<!-- User Profile -->
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
					Profile Information
				</h2>
				<div class="space-y-4">
					<div>
						<div class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Name
						</div>
						<p class="text-gray-900 dark:text-white">{currentUser.name}</p>
					</div>
					<div>
						<div class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Email
						</div>
						<p class="text-gray-900 dark:text-white">{currentUser.email}</p>
					</div>
				</div>
			</div>

			<!-- Instructions -->
			<div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
				<h2 class="text-xl font-semibold text-blue-900 dark:text-blue-200 mb-4">
					How Weight & Progression Works
				</h2>
				<div class="space-y-3 text-blue-800 dark:text-blue-300">
					<p>• <strong>Set weights per exercise:</strong> When you add exercises to your workout days, you can set the starting weight and increment for each exercise individually.</p>
					<p>• <strong>Automatic progression:</strong> When you mark an exercise as complete, the weight will automatically increase by your set increment for the next workout.</p>
					<p>• <strong>Personalized:</strong> Each exercise can have its own weight and increment based on your strength level and goals.</p>
					<p>• <strong>Flexible:</strong> You can adjust the weight and increment for any exercise at any time.</p>
				</div>
			</div>
		{/if}
	</main>
</div>
