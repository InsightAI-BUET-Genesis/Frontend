<script>
	// @ts-nocheck
	import { onMount, onDestroy } from 'svelte';
	import FaSearch from 'svelte-icons/fa/FaSearch.svelte';
	import FaImage from 'svelte-icons/fa/FaImage.svelte';
	import mockProductData from '$lib/data/mockProducts.json';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import apiService from '$lib/apiService';
	import { goto } from '$app/navigation';

	let breadcrumbItems = [
		{ name: 'Home', href: '../' },
		{ name: 'Shop Genie', href: './' },
		{ name: 'Search', href: '' }
	];

	export let data;
	let userId = data.userInfo.userId;

	let searchText = '';
	let previewUrl = null;
	let imageFile = null;
	let searchResults = [];
	let loading = false;
	let searchType = null;

	function handleImageUpload(event) {
		imageFile = event.target.files[0];
		if (imageFile) {
			const reader = new FileReader();
			reader.onload = (e) => {
				previewUrl = e.target.result;
			};
			reader.readAsDataURL(imageFile);
		}
		event.target.value = '';
	}

	async function performSearch() {
		if (!searchText && !imageFile) {
			toast.push('Please enter search text or upload an image.', {
				theme: {
					'--toastBackground': '#F56565',
					'--toastBarBackground': '#C53030'
				}
			});
			return;
		}

		loading = true;
		searchResults = [];

		// Print search values for future API integration
		console.log('Search Type:', searchType);
		console.log('Search Text:', searchText);
		console.log('Search Image:', imageFile ? 'Image uploaded' : 'No image');

		if (searchType == 'text') {
			let payload = { query: searchText };
			const res = await apiService.postPython('product_search/text-search', payload);
			searchResults = res['products'];
			loading = false;
			// console.log(searchResults);
		} else if (searchType == 'image') {
			// console.log(imageFile)
			let timestamp = new Date().getTime();
			let name = timestamp + '_' + userId;
			const supabaseUrl = await apiService.uploadFileToSupabase(imageFile, 'searchImages', name);

			let payload = { image_link: supabaseUrl };
			const res = await apiService.postPython('product_search/image-search', payload);
			// console.log(res)
			searchResults = res['products'];
			loading = false;
			// console.log(searchResults);
		} else if (searchType == 'both'){
			let timestamp = new Date().getTime();
			let name = timestamp + '_' + userId;
			const supabaseUrl = await apiService.uploadFileToSupabase(imageFile, 'searchImages', name);
			
			let payload = { image_link: supabaseUrl, text_query: searchText };
			const res = await apiService.postPython('product_search/hybrid-search', payload);
			// console.log(res)
			searchResults = res['products'];
			loading = false;
		}
	}

	$: {
		if (imageFile && searchText) {
			searchType = 'both';
		} else if (imageFile) {
			searchType = 'image';
		} else if (searchText) {
			searchType = 'text';
		} else {
			searchType = null;
		}
	}

	function clearImage() {
		previewUrl = null
		imageFile = null
	}

	onMount(() => {
		// Any initialization logic can go here
		toast.pop(0);
	});

	onDestroy(() => {
		// This will remove all toasts
		toast.pop(0);
	});
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>
<SvelteToast />

<div class="font-poppins container mx-auto px-4 py-12">
	<BreadCrumb items={breadcrumbItems} />
	<div class="font-poppins container mx-auto max-w-4xl px-4 py-12">
		<h1 class="mb-8 text-center text-4xl font-bold text-indigo-900 dark:text-white">
			Search Products
		</h1>

		<div class="mb-8 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
			<div class="mb-4 flex flex-col items-center space-y-4 md:flex-row md:space-x-4 md:space-y-0">
				<div class="relative w-full md:w-2/3">
					<input
						type="text"
						bind:value={searchText}
						placeholder="Enter search terms..."
						class="w-full rounded-md border border-gray-300 p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
					<button
						on:click={performSearch}
						class="absolute right-2 top-1/2 -translate-y-1/2 transform rounded-md bg-indigo-600 p-2 text-white transition-colors duration-200 hover:bg-indigo-700"
						disabled={loading}
					>
						<div class="h-5 w-5">
							<FaSearch />
						</div>
					</button>
				</div>
				<div class="w-full md:w-1/3">
					<label
						for="image-upload"
						class="flex w-full cursor-pointer items-center justify-center rounded-md bg-gray-200 p-3 text-gray-700 transition-colors duration-200 hover:bg-gray-300"
					>
						<div class="mr-2 h-5 w-5">
							<FaImage />
						</div>
						Upload Image
					</label>
					<input
						id="image-upload"
						type="file"
						accept="image/*"
						on:change={handleImageUpload}
						class="hidden"
					/>
				</div>
			</div>
			{#if previewUrl}
				<div class="relative mt-4">
					<div class="flex justify-center">
						<div class="relative">
							<img
								src={previewUrl}
								alt="Uploaded"
								class="h-32 w-32 rounded-md object-cover shadow-md"
							/>
							<button
							on:click={clearImage}
							class="absolute -right-3 -top-3 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-110"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>

		{#if loading}
			<div class="flex h-64 items-center justify-center">
				<div class="loader"></div>
			</div>
		{:else if searchResults && searchResults.length > 0}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each searchResults as product}
					<div
						class="cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-transform duration-300 hover:scale-105 dark:bg-gray-800"
						on:click={() => goto(`/home/shop-genie/${product.product_id}`)}
					>
						<img
							src={product.image_links[0]}
							alt={product.name}
							class="h-auto w-full object-cover"
						/>
						<div class="p-4">
							<h2 class="text-lg font-medium text-gray-900 dark:text-white">{product.name}</h2>
							<p class="mb-2 text-sm text-gray-600 dark:text-gray-300">{product.company}</p>
							<p class="mt-2 font-bold text-indigo-600 dark:text-indigo-400">{product.price}</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-center text-lg text-gray-600 dark:text-gray-400">
				No results found. Try a different search.
			</p>
		{/if}
	</div>
</div>

<style>
	.loader {
		border: 5px solid #f3f3f3;
		border-top: 5px solid #3498db;
		border-radius: 50%;
		width: 50px;
		height: 50px;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	:global(.toasted-container) {
		font-family: 'Poppins', sans-serif;
	}
</style>
