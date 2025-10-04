<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/stores';
	import { api } from '../../../convex/_generated/api';
	import { convex } from '$lib/convex';

	let email = '';
	let password = '';
	let name = '';
	let isLogin = true;
	let isLoading = false;
	let error = '';

	onMount(() => {
		// Redirect if already logged in
		if ($user) {
			window.location.href = '/';
		}
	});

	async function handleSubmit() {
		if (isLoading) return;

		isLoading = true;
		error = '';

		try {
			// Create or get user
			const userId = await convex.mutation(api.users.createUser, {
				name: name || email.split('@')[0],
				email: email
			});

			// Get the created user data
			const userData = await convex.query(api.users.getUserById, { userId });
			
			// Save user to localStorage for session management
			localStorage.setItem('user', JSON.stringify(userData));
			
			// Reload to get the user
			window.location.href = '/';
		} catch (err: any) {
			error = err.message || 'An error occurred';
		} finally {
			isLoading = false;
		}
	}

	function toggleMode() {
		isLogin = !isLogin;
		error = '';
	}
</script>

<svelte:head>
	<title>{isLogin ? 'Login' : 'Register'} - Workout Tracker</title>
	<meta name="description" content="Login or register for Workout Tracker" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<div class="text-center text-6xl mb-4">💪</div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
				{isLogin ? 'Sign in to your account' : 'Create your account'}
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
				{isLogin ? "Don't have an account?" : 'Already have an account?'}
				<button
					onclick={toggleMode}
					class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
				>
					{isLogin ? 'Sign up' : 'Sign in'}
				</button>
			</p>
		</div>

		<form class="mt-8 space-y-6" onsubmit={handleSubmit}>
			{#if error}
				<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
					<div class="text-sm text-red-600 dark:text-red-400">{error}</div>
				</div>
			{/if}

			<div class="space-y-4">
				{#if !isLogin}
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Full Name
						</label>
						<input
							id="name"
							name="name"
							type="text"
							bind:value={name}
							required={!isLogin}
							class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
							placeholder="Enter your full name"
						/>
					</div>
				{/if}

				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Email Address
					</label>
					<input
						id="email"
						name="email"
						type="email"
						bind:value={email}
						required
						class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
						placeholder="Enter your email"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Password
					</label>
					<input
						id="password"
						name="password"
						type="password"
						bind:value={password}
						required
						class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
						placeholder="Enter your password"
					/>
				</div>
			</div>

			<div>
				<button
					type="submit"
					disabled={isLoading}
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if isLoading}
						<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
					{/if}
					{isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
				</button>
			</div>

			<div class="text-center">
				<a
					href="/"
					class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
				>
					← Back to Home
				</a>
			</div>
		</form>
	</div>
</div>
