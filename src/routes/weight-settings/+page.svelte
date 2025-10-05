<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/stores';
	import { api } from '../../../convex/_generated/api';
	import { convex } from '$lib/convex';

	let weights: any[] = [];
	let isLoading = true;
	let isSaving = false;
	let newWeight = '';
	let newQuantity = 2;

	onMount(async () => {
		if (!$user) {
			window.location.href = '/login';
			return;
		}

		await loadWeights();
	});

	async function loadWeights() {
		if (!$user) return;

		try {
			isLoading = true;

			// Initialize default weights if user has none
			await convex.mutation(api.weights.initializeDefaultWeights, { userId: $user._id });

			// Load user's weights
			weights = await convex.query(api.weights.getUserWeights, { userId: $user._id });
		} catch (error) {
			console.error('Error loading weights:', error);
			alert('Failed to load weights');
		} finally {
			isLoading = false;
		}
	}

	async function updateWeight(weight: any, newQuantity: number) {
		if (!$user) return;

		try {
			isSaving = true;
			await convex.mutation(api.weights.setWeight, {
				userId: $user._id,
				weight: weight.weight,
				quantity: newQuantity
			});
			await loadWeights();
		} catch (error) {
			console.error('Error updating weight:', error);
			alert('Failed to update weight');
		} finally {
			isSaving = false;
		}
	}

	async function addWeight() {
		if (!$user || !newWeight) return;

		const weightValue = parseFloat(newWeight);
		if (isNaN(weightValue) || weightValue <= 0) {
			alert('Please enter a valid weight');
			return;
		}

		try {
			isSaving = true;
			await convex.mutation(api.weights.setWeight, {
				userId: $user._id,
				weight: weightValue,
				quantity: newQuantity
			});
			newWeight = '';
			newQuantity = 2;
			await loadWeights();
		} catch (error) {
			console.error('Error adding weight:', error);
			alert('Failed to add weight');
		} finally {
			isSaving = false;
		}
	}

	async function deleteWeight(weight: any) {
		if (!$user) return;

		if (!confirm(`Delete ${weight.weight} lbs plates?`)) {
			return;
		}

		try {
			isSaving = true;
			await convex.mutation(api.weights.deleteWeight, {
				userId: $user._id,
				weightId: weight._id
			});
			await loadWeights();
		} catch (error) {
			console.error('Error deleting weight:', error);
			alert('Failed to delete weight');
		} finally {
			isSaving = false;
		}
	}

	function goBack() {
		window.history.back();
	}
</script>

<svelte:head>
	<title>Weight Settings - Workout Tracker</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
	<!-- Header -->
	<header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center h-16">
				<button
					onclick={goBack}
					class="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					aria-label="Go back"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<div>
					<h1 class="text-xl font-bold text-gray-900 dark:text-white">
						Weight Plate Settings
					</h1>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						Configure your available weight plates
					</p>
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
		{:else}
			<!-- Info Card -->
			<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
				<div class="flex items-start space-x-3">
					<svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
					</svg>
					<div class="flex-1">
						<h3 class="text-sm font-medium text-blue-900 dark:text-blue-200">
							About Weight Settings
						</h3>
						<p class="mt-1 text-sm text-blue-700 dark:text-blue-300">
							Configure the weight plates you have available. The app will use this to calculate the exact plates needed for each side of the bar for exercises like Bench Press, Deadlift, Squat, Rows, and Bicep Curls.
						</p>
					</div>
				</div>
			</div>

			<!-- Current Weights -->
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
					Your Weight Plates
				</h2>

				{#if weights.length === 0}
					<p class="text-gray-600 dark:text-gray-400 text-center py-8">
						No weights configured yet. Add some below!
					</p>
				{:else}
					<div class="space-y-3">
						{#each weights as weight}
							<div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<div class="flex items-center space-x-4">
									<div class="text-2xl font-bold text-gray-900 dark:text-white w-16">
										{weight.weight}
									</div>
									<div class="text-sm text-gray-600 dark:text-gray-400">
										lbs
									</div>
								</div>

								<div class="flex items-center space-x-4">
									<div class="flex items-center space-x-2">
										<button
											onclick={() => updateWeight(weight, Math.max(0, weight.quantity - 1))}
											disabled={isSaving}
											class="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
										>
											−
										</button>
										<span class="w-12 text-center font-medium text-gray-900 dark:text-white">
											{weight.quantity}
										</span>
										<button
											onclick={() => updateWeight(weight, weight.quantity + 1)}
											disabled={isSaving}
											class="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
										>
											+
										</button>
									</div>

									<button
										onclick={() => deleteWeight(weight)}
										disabled={isSaving}
										class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
										aria-label="Delete weight"
									>
										<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
										</svg>
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Add New Weight -->
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
					Add Weight Plate
				</h2>

				<form onsubmit={(e) => { e.preventDefault(); addWeight(); }} class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="weight" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Weight (lbs)
							</label>
							<input
								id="weight"
								type="number"
								step="0.5"
								bind:value={newWeight}
								placeholder="e.g., 45, 25, 10, 2.5"
								required
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
							/>
						</div>

						<div>
							<label for="quantity" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Quantity
							</label>
							<input
								id="quantity"
								type="number"
								min="1"
								bind:value={newQuantity}
								required
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={isSaving || !newWeight}
						class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{isSaving ? 'Adding...' : 'Add Weight Plate'}
					</button>
				</form>
			</div>

			<!-- Bar Weight Info -->
			<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-6 border border-gray-200 dark:border-gray-700">
				<div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
					<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
					</svg>
					<span>
						Bar weight is set to <strong class="text-gray-900 dark:text-white">45 lbs</strong> (standard Olympic barbell)
					</span>
				</div>
			</div>
		{/if}
	</main>
</div>
