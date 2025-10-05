<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/stores';
	import { api } from '../../../convex/_generated/api';
	import { convex } from '$lib/convex';

	let exerciseLogs: any[] = [];
	let workoutDays: any[] = [];
	let isLoading = true;
	let selectedTimeframe = '30'; // days
	let selectedExercise = 'all'; // 'all' or specific exercise name
	let weightData: any[] = [];
	let exerciseWeightData: Map<string, any[]> = new Map();
	let exerciseColors: Map<string, string> = new Map();
	let availableExercises: string[] = [];
	let stats = {
		totalWorkouts: 0,
		totalExercises: 0,
		averageWeight: 0,
		strengthGain: 0,
		mostUsedExercise: '',
		workoutStreak: 0
	};

	// Color palette for different exercises
	const colors = [
		'#3B82F6', // blue
		'#EF4444', // red
		'#10B981', // green
		'#F59E0B', // yellow
		'#8B5CF6', // purple
		'#F97316', // orange
		'#06B6D4', // cyan
		'#84CC16', // lime
		'#EC4899', // pink
		'#6B7280'  // gray
	];

	onMount(async () => {
		await loadStatsData();
	});

	async function loadStatsData() {
		if (!$user) {
			isLoading = false;
			return;
		}
		
		try {
			isLoading = true;
			
			// Load exercise logs and workout days
			const [logs, days] = await Promise.all([
				convex.query(api.exerciseLogs.getExerciseLogs, { 
					userId: $user._id, 
					limit: 2000 // Increased limit for comprehensive stats
				}),
				convex.query(api.workoutDays.getUserWorkoutDays, { userId: $user._id })
			]);
			
			exerciseLogs = logs || [];
			workoutDays = days || [];
			
			// Process data for charts and stats
			processWeightData();
			processExerciseWeightData();
			calculateStats();
		} catch (error) {
			console.error('Error loading stats data:', error);
		} finally {
			isLoading = false;
		}
	}

	function processWeightData() {
		// Group exercise logs by date and calculate average weight per day
		const weightByDate = new Map();
		
		exerciseLogs.forEach(log => {
			const date = new Date(log.completedAt).toDateString();
			if (!weightByDate.has(date)) {
				weightByDate.set(date, []);
			}
			weightByDate.get(date).push(log.weight);
		});
		
		// Convert to chart data format
		weightData = Array.from(weightByDate.entries())
			.map(([date, weights]) => ({
				date: new Date(date),
				averageWeight: weights.reduce((a: number, b: number) => a + b, 0) / weights.length,
				totalWeight: weights.reduce((a: number, b: number) => a + b, 0)
			}))
			.sort((a, b) => a.date.getTime() - b.date.getTime())
			.slice(-parseInt(selectedTimeframe));
	}

	function processExerciseWeightData() {
		// Clear previous data
		exerciseWeightData.clear();
		exerciseColors.clear();
		
		// Get all unique exercises
		const uniqueExercises = new Set();
		exerciseLogs.forEach(log => {
			const exerciseName = log.exerciseDetails?.name || 'Unknown';
			uniqueExercises.add(exerciseName);
		});
		
		// Update available exercises list
		availableExercises = ['all', ...Array.from(uniqueExercises).sort()];
		
		// Assign colors to exercises
		Array.from(uniqueExercises).forEach((exercise, index) => {
			exerciseColors.set(exercise, colors[index % colors.length]);
		});
		
		// Process data for each exercise
		uniqueExercises.forEach(exercise => {
			const filteredLogs = exerciseLogs.filter(log => 
				(log.exerciseDetails?.name || 'Unknown') === exercise
			);
			
			// Group by date and get max weight for each day
			const weightByDate = new Map();
			filteredLogs.forEach(log => {
				const date = new Date(log.completedAt).toDateString();
				if (!weightByDate.has(date)) {
					weightByDate.set(date, []);
				}
				weightByDate.get(date).push(log.weight);
			});
			
			// Convert to chart data format
			const exerciseData = Array.from(weightByDate.entries())
				.map(([date, weights]) => ({
					date: new Date(date),
					weight: Math.max(...weights), // Use max weight for the day
					exercise: exercise
				}))
				.sort((a, b) => a.date.getTime() - b.date.getTime())
				.slice(-parseInt(selectedTimeframe));
			
			exerciseWeightData.set(exercise, exerciseData);
		});
	}

	function calculateStats() {
		// Calculate various statistics
		const uniqueWorkoutDays = new Set(exerciseLogs.map(log => log.workoutDayId));
		stats.totalWorkouts = uniqueWorkoutDays.size;
		stats.totalExercises = exerciseLogs.length;
		
		if (exerciseLogs.length > 0) {
			stats.averageWeight = exerciseLogs.reduce((sum, log) => sum + log.weight, 0) / exerciseLogs.length;
		}
		
		// Calculate strength gain (difference between first and last workout)
		if (weightData.length >= 2) {
			stats.strengthGain = weightData[weightData.length - 1].averageWeight - weightData[0].averageWeight;
		}
		
		// Find most used exercise
		const exerciseCounts = new Map();
		exerciseLogs.forEach(log => {
			const exerciseName = log.exerciseDetails?.name || 'Unknown';
			exerciseCounts.set(exerciseName, (exerciseCounts.get(exerciseName) || 0) + 1);
		});
		
		if (exerciseCounts.size > 0) {
			stats.mostUsedExercise = Array.from(exerciseCounts.entries())
				.sort((a, b) => b[1] - a[1])[0][0];
		}
		
		// Calculate workout streak (simplified)
		stats.workoutStreak = calculateWorkoutStreak();
	}

	function calculateWorkoutStreak() {
		// Simple streak calculation based on consecutive days with workouts
		const workoutDates = Array.from(new Set(
			exerciseLogs.map(log => new Date(log.completedAt).toDateString())
		)).sort().reverse();
		
		let streak = 0;
		const today = new Date();
		let currentDate = new Date(today);
		
		for (let i = 0; i < 30; i++) { // Check last 30 days
			const dateString = currentDate.toDateString();
			if (workoutDates.includes(dateString)) {
				streak++;
			} else {
				break;
			}
			currentDate.setDate(currentDate.getDate() - 1);
		}
		
		return streak;
	}

	function changeTimeframe(timeframe: string) {
		selectedTimeframe = timeframe;
		processWeightData();
		processExerciseWeightData();
	}

	function changeExercise(exercise: string) {
		selectedExercise = exercise;
		// No need to reprocess data, just update display
	}

	function goBack() {
		window.history.back();
	}

	function formatDate(date: Date) {
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function formatWeight(weight: number) {
		return Math.round(weight * 10) / 10;
	}

	function getChartDimensions() {
		return {
			width: 800,
			height: 300,
			padding: { top: 20, right: 20, bottom: 40, left: 60 }
		};
	}

	function getMaxWeight() {
		let maxWeight = 0;
		exerciseWeightData.forEach(data => {
			data.forEach(point => {
				maxWeight = Math.max(maxWeight, point.weight);
			});
		});
		return maxWeight || 100;
	}

	function getDateRange() {
		if (exerciseWeightData.size === 0) return { min: new Date(), max: new Date() };
		
		let minDate = new Date();
		let maxDate = new Date(0);
		
		exerciseWeightData.forEach(data => {
			data.forEach(point => {
				minDate = point.date < minDate ? point.date : minDate;
				maxDate = point.date > maxDate ? point.date : maxDate;
			});
		});
		
		return { min: minDate, max: maxDate };
	}

	function getChartPosition(date: Date, weight: number) {
		const dims = getChartDimensions();
		const maxWeight = getMaxWeight();
		const { min: minDate, max: maxDate } = getDateRange();
		
		const x = dims.padding.left + ((date.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * (dims.width - dims.padding.left - dims.padding.right);
		const y = dims.padding.top + (1 - weight / maxWeight) * (dims.height - dims.padding.top - dims.padding.bottom);
		
		return { x, y };
	}

	function getFilteredExerciseData() {
		if (selectedExercise === 'all') {
			return exerciseWeightData;
		} else {
			const filtered = new Map();
			if (exerciseWeightData.has(selectedExercise)) {
				filtered.set(selectedExercise, exerciseWeightData.get(selectedExercise));
			}
			return filtered;
		}
	}

	function getFilteredStats() {
		if (selectedExercise === 'all') {
			return stats;
		} else {
			// Calculate stats for specific exercise
			const filteredLogs = exerciseLogs.filter(log => 
				(log.exerciseDetails?.name || 'Unknown') === selectedExercise
			);
			
			const uniqueWorkoutDays = new Set(filteredLogs.map(log => log.workoutDayId));
			const averageWeight = filteredLogs.length > 0 ? 
				filteredLogs.reduce((sum, log) => sum + log.weight, 0) / filteredLogs.length : 0;
			
			// Calculate strength gain for this exercise
			const exerciseData = exerciseWeightData.get(selectedExercise) || [];
			const strengthGain = exerciseData.length >= 2 ? 
				exerciseData[exerciseData.length - 1].weight - exerciseData[0].weight : 0;
			
			return {
				totalWorkouts: uniqueWorkoutDays.size,
				totalExercises: filteredLogs.length,
				averageWeight: averageWeight,
				strengthGain: strengthGain,
				mostUsedExercise: selectedExercise,
				workoutStreak: stats.workoutStreak // Keep overall streak
			};
		}
	}
</script>

<svelte:head>
	<title>Stats - Workout Tracker</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
	<!-- Header -->
	<header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:py-0 sm:h-16 gap-3">
				<div class="flex items-center">
					<button
						on:click={goBack}
						class="mr-2 sm:mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95 flex-shrink-0"
						aria-label="Go back"
					>
						<svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<h1 class="text-base sm:text-xl font-bold text-gray-900 dark:text-white">Workout Statistics</h1>
				</div>
				<div class="flex items-center space-x-2 sm:space-x-3">
					<select
						bind:value={selectedExercise}
						on:change={(e) => changeExercise(e.target.value)}
						class="flex-1 sm:flex-initial px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white min-h-[40px]"
					>
						{#each availableExercises as exercise}
							<option value={exercise}>
								{exercise === 'all' ? 'All Exercises' : exercise}
							</option>
						{/each}
					</select>
					<select
						bind:value={selectedTimeframe}
						on:change={(e) => changeTimeframe(e.target.value)}
						class="flex-1 sm:flex-initial px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white min-h-[40px]"
					>
						<option value="7">7 days</option>
						<option value="30">30 days</option>
						<option value="90">90 days</option>
						<option value="365">1 year</option>
					</select>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
		{#if isLoading}
			<div class="flex justify-center items-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		{:else if !$user}
			<div class="text-center py-12">
				<div class="text-4xl mb-4">🔒</div>
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
					Please sign in to view statistics
				</h2>
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					Sign in to track your workout progress and view detailed statistics.
				</p>
				<a
					href="/login"
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Sign In
				</a>
			</div>
		{:else}
			<div class="space-y-6 sm:space-y-8">
				<!-- Stats Overview -->
				<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
					<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6">
						<div class="flex flex-col sm:flex-row sm:items-center">
							<div class="flex-shrink-0 mb-2 sm:mb-0">
								<svg class="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
								</svg>
							</div>
							<div class="sm:ml-4">
								<p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-2">
									{selectedExercise === 'all' ? 'Total Workouts' : 'Workouts'}
								</p>
								<p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{getFilteredStats().totalWorkouts}</p>
							</div>
						</div>
					</div>

					<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6">
						<div class="flex flex-col sm:flex-row sm:items-center">
							<div class="flex-shrink-0 mb-2 sm:mb-0">
								<svg class="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
								</svg>
							</div>
							<div class="sm:ml-4">
								<p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Streak</p>
								<p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{getFilteredStats().workoutStreak} days</p>
							</div>
						</div>
					</div>

					<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6">
						<div class="flex flex-col sm:flex-row sm:items-center">
							<div class="flex-shrink-0 mb-2 sm:mb-0">
								<svg class="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
								</svg>
							</div>
							<div class="sm:ml-4">
								<p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
									{selectedExercise === 'all' ? 'Avg' : 'Max'}
								</p>
								<p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{formatWeight(getFilteredStats().averageWeight)} lbs</p>
							</div>
						</div>
					</div>

					<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6">
						<div class="flex flex-col sm:flex-row sm:items-center">
							<div class="flex-shrink-0 mb-2 sm:mb-0">
								<svg class="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
								</svg>
							</div>
							<div class="sm:ml-4">
								<p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
									{selectedExercise === 'all' ? 'Total' : 'Done'}
								</p>
								<p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{getFilteredStats().totalExercises}</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Exercise Weight Progress Chart -->
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
					<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
						<h2 class="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
							{selectedExercise === 'all' ? 'Progress' : selectedExercise}
						</h2>
						<div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
							{getFilteredStats().strengthGain > 0 ? '+' : ''}{formatWeight(getFilteredStats().strengthGain)} lbs change
						</div>
					</div>

					{#if getFilteredExerciseData().size > 0}
						{@const filteredData = getFilteredExerciseData()}
						<div class="overflow-x-auto -mx-4 sm:mx-0">
							<div class="min-w-[600px] px-4 sm:px-0">
								<svg viewBox="0 0 800 300" class="w-full h-64 sm:h-80">
								<!-- Grid lines -->
								<defs>
									<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
										<path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" stroke-width="0.5" opacity="0.3"/>
									</pattern>
								</defs>
								<rect width="800" height="300" fill="url(#grid)" />
								
								<!-- Y-axis labels -->
								{#each Array.from({length: 6}, (_, i) => getMaxWeight() * (5-i) / 5) as weight}
									<text x="10" y="{getChartPosition(new Date(), weight).y + 5}" text-anchor="end" class="text-xs fill-gray-600 dark:fill-gray-400">
										{Math.round(weight)} lbs
									</text>
									<line x1="60" y1="{getChartPosition(new Date(), weight).y}" x2="780" y2="{getChartPosition(new Date(), weight).y}" stroke="#e5e7eb" stroke-width="1" opacity="0.5"/>
								{/each}
								
								<!-- X-axis labels -->
								{#each Array.from({length: 5}, (_, i) => {
									const dateRange = getDateRange();
									const date = new Date(dateRange.min.getTime() + (dateRange.max.getTime() - dateRange.min.getTime()) * i / 4);
									return date;
								}) as date}
									<text x="{getChartPosition(date, 0).x}" y="290" text-anchor="middle" class="text-xs fill-gray-600 dark:fill-gray-400">
										{formatDate(date)}
									</text>
								{/each}
								
								<!-- Exercise lines -->
								{#each Array.from(filteredData.entries()) as [exerciseName, data]}
									{@const color = exerciseColors.get(exerciseName)}
									{@const sortedData = data.sort((a, b) => a.date.getTime() - b.date.getTime())}
									
									<!-- Line path -->
									<path 
										d="M {sortedData.map(point => getChartPosition(point.date, point.weight)).map(pos => `${pos.x},${pos.y}`).join(' L ')}"
										fill="none"
										stroke="{color}"
										stroke-width="3"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									
									<!-- Data points -->
									{#each sortedData as point}
										{@const pos = getChartPosition(point.date, point.weight)}
										<circle 
											cx="{pos.x}" 
											cy="{pos.y}" 
											r="4" 
											fill="{color}"
											stroke="white"
											stroke-width="2"
										>
											<title>{exerciseName}: {formatWeight(point.weight)} lbs on {formatDate(point.date)}</title>
										</circle>
									{/each}
								{/each}
								</svg>
							</div>
						</div>

						<!-- Legend -->
						{#if selectedExercise === 'all'}
							<div class="flex flex-wrap gap-2 sm:gap-4 mt-4">
								{#each Array.from(filteredData.keys()) as exerciseName}
									<div class="flex items-center space-x-1.5 sm:space-x-2">
										<div class="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0" style="background-color: {exerciseColors.get(exerciseName)}"></div>
										<span class="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{exerciseName}</span>
									</div>
								{/each}
							</div>
						{/if}
					{:else}
						<div class="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
							<div class="text-center">
								<svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
								</svg>
								<p>No workout data available</p>
								<p class="text-sm">Start logging exercises to see your progress</p>
							</div>
						</div>
					{/if}
				</div>

				<!-- Additional Stats -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<!-- Exercise Info -->
					<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
							{selectedExercise === 'all' ? 'Most Used Exercise' : 'Exercise Details'}
						</h3>
						{#if getFilteredStats().mostUsedExercise}
							<div class="flex items-center space-x-3">
								<div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
									<svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
									</svg>
								</div>
								<div>
									<p class="font-medium text-gray-900 dark:text-white">{getFilteredStats().mostUsedExercise}</p>
									<p class="text-sm text-gray-600 dark:text-gray-400">
										{selectedExercise === 'all' ? 'Your favorite exercise' : 'Selected exercise'}
									</p>
								</div>
							</div>
						{:else}
							<p class="text-gray-500 dark:text-gray-400">No exercise data available</p>
						{/if}
					</div>

					<!-- Recent Activity -->
					<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
						{#if exerciseLogs.length > 0}
							<div class="space-y-3">
								{#each exerciseLogs.slice(0, 5) as log}
									<div class="flex items-center justify-between">
										<div class="flex items-center space-x-3">
											{#if log.notes === 'Completed successfully'}
												<svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
												</svg>
											{:else}
												<svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
												</svg>
											{/if}
											<div>
												<p class="text-sm font-medium text-gray-900 dark:text-white">
													{log.exerciseDetails?.name || 'Exercise'}
												</p>
												<p class="text-xs text-gray-600 dark:text-gray-400">
													{log.sets} × {log.reps} @ {log.weight} lbs
												</p>
											</div>
										</div>
										<span class="text-xs text-gray-500 dark:text-gray-400">
											{new Date(log.completedAt).toLocaleDateString()}
										</span>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-gray-500 dark:text-gray-400">No recent activity</p>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>
