<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let color: 'blue' | 'green' | 'red' | 'gray' = 'blue';

	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-8 w-8',
		lg: 'h-12 w-12'
	};

	const colorClasses = {
		blue: 'border-blue-600',
		green: 'border-green-600',
		red: 'border-red-600',
		gray: 'border-gray-600'
	};
</script>

<div class="flex justify-center items-center">
	<div class="animate-spin rounded-full border-b-2 {sizeClasses[size]} {colorClasses[color]}"></div>
</div>
