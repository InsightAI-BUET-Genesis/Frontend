<script>
	//@ts-nocheck
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import FaHeart from 'svelte-icons/fa/FaHeart.svelte';
	import FaExternalLinkAlt from 'svelte-icons/fa/FaExternalLinkAlt.svelte';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import { onMount, onDestroy } from 'svelte';
	import apiService from '$lib/apiService.ts';

	let breadcrumbItems = [
		{ name: 'Home', href: '/home' },
		{ name: 'Wishlist', href: '/home/wishlist' }
	];

	export let data;
	let wishlistItems = null;
	let recommendations = null;
	let userId = data.userInfo.userId;

	onMount(async () => {
		data.productList.then((res) => {
			console.log(res);

			wishlistItems = res['products'];
			recommendations = res['recommendations'];

			// console.log(recommendations)
		});
	});

	$: loadingStates = new Map();

	function setLoadingState(productId, isLoading) {
		loadingStates.set(productId, isLoading);
		loadingStates = new Map(loadingStates); // This triggers reactivity
	}

	async function removeFromWishlist(productId) {
		try {
			setLoadingState(productId, true);
			const response = await apiService.post(`cart/remove`, {
				productId: productId,
				userId: userId
			});
			wishlistItems = wishlistItems.filter((item) => item.product_id != productId);

			toast.push('Product Unfavorited Successfully', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch (error) {
			toast.push('Failed to unfavorite product. Please try again.', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(220,38,38,0.9)',
					'--toastBarBackground': '#991B1B'
				}
			});
		} finally {
			setLoadingState(productId, false);
		}
	}

	onMount(() => {
		toast.pop(0);
	});

	onDestroy(() => {
		toast.pop(0);
	});
</script>

<SvelteToast />
<div class="font-poppins container mx-auto px-4 py-12">
	{#if wishlistItems && recommendations}
		<BreadCrumb items={breadcrumbItems} />

		<header class="mb-16 text-center">
			<h1
				class="flex items-center justify-center text-4xl font-bold tracking-tight text-indigo-900 dark:text-white"
			>
				<span class="mr-4 h-10 w-10 text-indigo-600 dark:text-indigo-300">
					<FaHeart />
				</span>
				Your Wishlist
			</h1>
		</header>

		{#if wishlistItems.length > 0}
			<div class="space-y-4">
				{#each wishlistItems as item}
					<div
						class="hover:scale-101 group relative cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-800"
						on:click={() => goto(`/home/shop-genie/${item.product_id}`)}
						tabindex="0"
						role="button"
						on:keypress={(e) => e.key === 'Enter' && goto(`/home/shop-genie/${item.product_id}`)}
						in:fade
					>
						<div class="flex items-center p-4">
							<div class="mr-4 h-24 w-24 flex-shrink-0">
								<img
									src={item.image_links[0]}
									alt={item.name}
									class="h-full w-full rounded-md object-cover"
								/>
							</div>
							<div class="flex-grow">
								<h3 class="text-lg font-medium text-gray-900 dark:text-white">{item.name}</h3>
								<p class="text-sm text-gray-600 dark:text-gray-300">{item.company}</p>
								<p class="mt-2 font-bold text-indigo-600 dark:text-indigo-400">{item.price}</p>
							</div>
							<div class="flex items-center space-x-4">
								<a
									href={item.link}
									target="_blank"
									rel="noopener noreferrer"
									class="text-indigo-600 hover:scale-110 hover:text-indigo-800"
									on:click|stopPropagation
									aria-label="View on external site"
								>
									<div class="h-5 w-5">
										<FaExternalLinkAlt />
									</div>
								</a>
								<button
									on:click|stopPropagation={() => removeFromWishlist(item.product_id)}
									class="flex h-8 w-8 items-center justify-center rounded-full bg-white bg-opacity-70 text-indigo-600 transition-all duration-200 hover:scale-110 hover:bg-opacity-100 hover:text-indigo-700 dark:bg-gray-800"
									aria-label="Remove from wishlist"
								>
									{#if loadingStates.get(item.product_id)}
										<div
											class="h-5 w-5 animate-spin rounded-full border-b-2 border-indigo-600"
										></div>
									{:else}
										<div class="h-5 w-5">
											<FaHeart />
										</div>
									{/if}
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center">
				<p class="text-xl text-gray-600 dark:text-gray-300">Your wishlist is empty.</p>
				<button
					on:click={() => goto('/home/shop-genie')}
					class="mt-4 rounded-full bg-indigo-600 px-6 py-2 text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
				>
					Explore Products
				</button>
			</div>
		{/if}
		<!-- New Recommendations Section -->
		<section class="mt-16">
			<h2 class="mb-8 text-3xl font-bold text-indigo-900 dark:text-white">Recommended Products</h2>
			{#if recommendations && recommendations.length > 0}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each recommendations as product}
					<div
					class="hover:scale-105 cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-gray-800"
					on:click={() => goto(`/home/shop-genie/${product.product_id}`)}
					tabindex="0"
					role="button"
					on:keypress={(e) =>
						e.key === 'Enter' && goto(`/home/shop-genie/${product.product_id}`)}
				>
					<img
						src={product.image_links[0]}
						alt={product.name}
						class="h-auto w-full object-cover"
					/>
					<div class="p-4">
						<h4
							class="text-lg font-medium text-gray-900 transition-colors duration-200 group-hover:text-indigo-600 dark:text-white"
						>
							{product.name}
						</h4>
						<p class="mb-2 text-sm text-gray-600 dark:text-gray-300">{product.company}</p>
						<p class="mt-2 font-bold text-indigo-600 dark:text-indigo-400">
							{product.price}
						</p>
					</div>
				</div>
					{/each}
				</div>
			{:else}
				<p class="text-center text-xl text-gray-600 dark:text-gray-300">
					No recommendations available at the moment.
				</p>
			{/if}
		</section>
	{:else}
		<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
			<div
				class="spinner h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
			></div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		font-family: 'Poppins', sans-serif;
	}

	.hover\:scale-101:hover {
		transform: scale(1.01);
	}
</style>
