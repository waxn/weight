import { writable } from 'svelte/store';

export const darkMode = writable(false);
export const user = writable<any>(null);
export const isLoading = writable(false);
