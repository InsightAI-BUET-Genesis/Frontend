<script>
	import '../app.css';
	import 'tailwindcss/tailwind.css';
	import { goto, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data;
	$: ({ session, supabase } = data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (!newSession && window.location.pathname.startsWith('/private')) {
				/**
				 * Queue this as a task so the navigation won't prevent the
				 * triggering function from completing
				 */
				setTimeout(() => {
					console.log('timed out :)');
					goto('/login', { invalidateAll: true });
				});
			} else if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<slot></slot>
