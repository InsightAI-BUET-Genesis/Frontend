<script>
	import { onMount, onDestroy } from 'svelte';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';

	let breadcrumbItems = [
		{ name: 'Home', href: './' },
		{ name: 'Smart Calender', href: '' }
	];
</script>

<div class="font-poppins container mx-auto px-4 py-12">
	<BreadCrumb items={breadcrumbItems} />
</div>
