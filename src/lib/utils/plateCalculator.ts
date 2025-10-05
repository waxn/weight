/**
 * Calculate the plates needed on each side of a barbell
 * @param totalWeight - Total weight including the bar
 * @param barWeight - Weight of the bar (default 45 lbs)
 * @param userWeights - User's available weights with quantities
 * @returns Array of plate weights for ONE SIDE of the bar
 */
export function calculatePlates(
	totalWeight: number,
	barWeight: number = 45,
	userWeights: any[] = []
): number[] {
	// Calculate weight needed on each side
	const weightPerSide = (totalWeight - barWeight) / 2;

	if (weightPerSide <= 0) {
		return [];
	}

	// Default plates if no user weights provided
	const defaultWeights = [
		{weight: 45, quantity: 2},
		{weight: 35, quantity: 2},
		{weight: 25, quantity: 2},
		{weight: 10, quantity: 2},
		{weight: 5, quantity: 2},
		{weight: 2.5, quantity: 2}
	];

	const weights = userWeights && userWeights.length > 0 ? userWeights : defaultWeights;

	// Sort by weight descending
	const sortedWeights = [...weights].sort((a, b) => b.weight - a.weight);

	const plates: number[] = [];
	let remaining = weightPerSide;

	// Track how many of each weight we've used (we can use quantity/2 per side)
	const usedCounts = new Map<number, number>();

	// Greedy algorithm: use largest plates first, respecting quantity limits
	for (const {weight, quantity} of sortedWeights) {
		const maxPerSide = Math.floor(quantity / 2); // We need pairs
		let used = 0;

		while (remaining >= weight && used < maxPerSide) {
			plates.push(weight);
			remaining -= weight;
			used++;
		}

		if (used > 0) {
			usedCounts.set(weight, used);
		}
	}

	// If there's a small remainder (due to rounding), ignore it
	if (remaining > 0.1) {
		console.warn(`Cannot make exact weight: ${remaining} lbs remaining per side`);
	}

	return plates;
}

/**
 * Check if an exercise should show plate calculator
 */
export function shouldShowPlateCalculator(exerciseName: string): boolean {
	const lowerName = exerciseName.toLowerCase();
	const barExercises = ['bench', 'deadlift', 'squat', 'row', 'bicep curl'];
	return barExercises.some(ex => lowerName.includes(ex));
}

/**
 * Format plates for display (e.g., "45, 25, 10")
 */
export function formatPlates(plates: number[]): string {
	if (plates.length === 0) {
		return 'Bar only';
	}
	return plates.join(', ');
}

/**
 * Special rule: Deadlifts need at least one 10lb plate if no 45lb plates
 * This ensures the bar is at the proper height
 */
export function calculateDeadliftPlates(
	totalWeight: number,
	barWeight: number = 45,
	userWeights: any[] = []
): number[] {
	const plates = calculatePlates(totalWeight, barWeight, userWeights);

	// If no 45lb plates, ensure at least one 10lb plate for height
	if (!plates.includes(45) && !plates.includes(10)) {
		const weightPerSide = (totalWeight - barWeight) / 2;

		// Check if user has 10lb plates available
		const weights = userWeights && userWeights.length > 0 ? userWeights : [
			{weight: 45, quantity: 2},
			{weight: 35, quantity: 2},
			{weight: 25, quantity: 2},
			{weight: 10, quantity: 2},
			{weight: 5, quantity: 2},
			{weight: 2.5, quantity: 2}
		];

		const has10lbPlates = weights.some(w => w.weight === 10 && w.quantity >= 2);

		if (!has10lbPlates) {
			// User doesn't have 10lb plates, return regular calculation
			return plates;
		}

		// Start with a 10lb plate
		const newPlates = [10];
		let remaining = weightPerSide - 10;

		// Track how many we can use
		const usedCounts = new Map<number, number>();
		usedCounts.set(10, 1);

		// Sort weights descending, excluding 10 (already used)
		const sortedWeights = [...weights]
			.filter(w => w.weight !== 10)
			.sort((a, b) => b.weight - a.weight);

		// Fill the rest with available plates
		for (const {weight, quantity} of sortedWeights) {
			const maxPerSide = Math.floor(quantity / 2);
			let used = 0;

			while (remaining >= weight && used < maxPerSide) {
				newPlates.push(weight);
				remaining -= weight;
				used++;
			}
		}

		return newPlates;
	}

	return plates;
}
