<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { darkMode, user } from '$lib/stores';
	import { convex } from '$lib/convex';
	import { api } from '../../convex/_generated/api';

	let { children } = $props();
	let currentUser: any = null;

	onMount(async () => {
		// Load dark mode preference from localStorage
		const savedTheme = localStorage.getItem('darkMode');
		if (savedTheme !== null) {
			darkMode.set(savedTheme === 'true');
		}

		// Load user from Convex
		try {
			const userData = await convex.query(api.users.getCurrentUser, {});
			if (userData) {
				currentUser = userData;
				user.set(userData);
			} else {
				// Create demo user if none exists
				await convex.mutation(api.users.createUser, {
					name: 'Demo User',
					email: 'demo@example.com',
					weight: 150,
					weightIncrement: 5
				});
				// Reload to get the user
				const newUserData = await convex.query(api.users.getCurrentUser, {});
				currentUser = newUserData;
				user.set(newUserData);
			}
		} catch (error) {
			console.log('Error loading user:', error);
			currentUser = null;
			user.set(null);
		}
	});

	// Update dark mode in localStorage when it changes
	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('darkMode', $darkMode.toString());
			document.documentElement.classList.toggle('dark', $darkMode);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Workout Tracker</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="description" content="Track your workouts and fitness progress" />
</svelte:head>

	<main class="min-h-screen transition-colors duration-300 {$darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}">
	{@render children?.()}
</main>

<style>
	:global(.dark) {
		--bg-primary: #111827;
		--bg-secondary: #1f2937;
		--text-primary: #f9fafb;
		--text-secondary: #d1d5db;
		--border-color: #374151;
	}

	:global(.light) {
		--bg-primary: #ffffff;
		--bg-secondary: #f9fafb;
		--text-primary: #111827;
		--text-secondary: #6b7280;
		--border-color: #e5e7eb;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		transition: background-color 0.3s ease, color 0.3s ease;
	}

	:global(*) {
		box-sizing: border-box;
	}
</style>
