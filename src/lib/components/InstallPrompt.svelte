<script lang="ts">
	import { onMount } from 'svelte';

	let deferredPrompt: any = null;
	let showInstallPrompt = false;
	let dismissed = false;

	onMount(() => {
		// Check if already dismissed
		const isDismissed = localStorage.getItem('pwa-install-dismissed');
		if (isDismissed) {
			dismissed = true;
			return;
		}

		// Check if already installed
		if (window.matchMedia('(display-mode: standalone)').matches) {
			return;
		}

		// Listen for the beforeinstallprompt event
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			showInstallPrompt = true;
		});
	});

	async function handleInstall() {
		if (!deferredPrompt) return;

		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;

		console.log(`User response to install prompt: ${outcome}`);

		deferredPrompt = null;
		showInstallPrompt = false;
	}

	function handleDismiss() {
		showInstallPrompt = false;
		dismissed = true;
		localStorage.setItem('pwa-install-dismissed', 'true');
	}
</script>

{#if showInstallPrompt && !dismissed}
	<div class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
		<button
			onclick={handleDismiss}
			class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
			aria-label="Dismiss"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>

		<div class="flex items-start space-x-3 mb-3">
			<div class="flex-shrink-0">
				<svg class="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
				</svg>
			</div>
			<div class="flex-1 min-w-0">
				<h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">
					Install Workout Tracker
				</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					Install this app on your home screen for quick and easy access when you're on the go.
				</p>
			</div>
		</div>

		<div class="flex gap-2">
			<button
				onclick={handleInstall}
				class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium text-sm active:scale-95"
			>
				Install
			</button>
			<button
				onclick={handleDismiss}
				class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm active:scale-95"
			>
				Not Now
			</button>
		</div>
	</div>
{/if}
