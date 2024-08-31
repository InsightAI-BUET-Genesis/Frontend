<!-- src/routes/study/[collectionId]/+page.svelte -->
<script>
	//@ts-nocheck
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import FaUpload from 'svelte-icons/fa/FaUpload.svelte';
	import FaYoutube from 'svelte-icons/fa/FaYoutube.svelte';
	import FaFile from 'svelte-icons/fa/FaFile.svelte';
	import FaPlus from 'svelte-icons/fa/FaPlus.svelte';
	import FaSearch from 'svelte-icons/fa/FaSearch.svelte';
	import FaLink from 'svelte-icons/fa/FaLink.svelte';
	import { fade } from 'svelte/transition';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { BACKEND_URL } from '$lib/config';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import apiService from '$lib/apiService.ts';
	import FaComment from 'svelte-icons/fa/FaComment.svelte';
	import FaStickyNote from 'svelte-icons/fa/FaStickyNote.svelte';

	let searchQuery = '';
	let filteredResources = [];
	let collection = null;
	let resources = null;
	let breadcrumbItems = [];
	let showResourceMenu = null;
	let showEditModal = false;
	let editResourceName = '';
	let editResourceId = null;

	export let data;

	onMount(() => {
		data.collectionData.then((res) => {
			collection = res;

			breadcrumbItems = [
				{ name: 'Home', href: '../' },
				{ name: 'Study', href: './' },
				{ name: `${collection.name}`, href: `` }
			];
		});

		data.resourceList.then((res) => {
			resources = res;
		});
	});

	let isUpdating = false;

	$: if (resources) {
		filteredResources = resources.filter((resource) =>
			resource.name.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}

	async function deleteResource(resourceId) {
		try {
			await apiService.del(`files/${resourceId}`);
			resources = resources.filter((c) => c.id !== resourceId);
			showResourceMenu = null;
			toast.push('File Deleted Successfully', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch (error) {
			console.error('Error deleting file:', error);
			showResourceMenu = null;
			toast.push('Error Deleting File', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(187,72,120,0.9)',
					'--toastBarBackground': '#880808'
				}
			});
		}
	}

	async function updateResourceName(resourceId, newName) {
		isUpdating = true;
		try {
			const updatedResource = await apiService.put(`files/${resourceId}/updateName`, {
				name: newName
			});
			resources = resources.map((c) => (c.id === resourceId ? updatedResource : c));
			showResourceMenu = null;
			toast.push('File Updated Successfully', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch (error) {
			console.error('Error Updating File:', error);
			showResourceMenu = null;
			toast.push('Error Updating File', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(187,72,120,0.9)',
					'--toastBarBackground': '#880808'
				}
			});
		} finally {
			isUpdating = false;
			closeEditModal();
		}
	}

	function openEditModal(collection) {
		showEditModal = true;
		editResourceName = collection.name;
		editResourceId = collection.id;
	}

	function closeEditModal() {
		showEditModal = false;
		editResourceName = '';
		editResourceId = null;
	}

	// Custom action to detect click outside the element
	function clickOutside(node) {
		const handleClick = (event) => {
			// Check if the click is outside the element
			if (!node.contains(event.target)) {
				showResourceMenu = null;
			}
		};

		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}

	onMount(() => {
		// Any initialization logic can go here
		toast.pop(0);
	});

	onDestroy(() => {
		// This will remove all toasts
		toast.pop(0);
	});

	$: allResourcesPending =
		resources && resources.every((resource) => resource.status === 'Pending');

	const getStatusColor = (status) => {
		switch (status) {
			case 'Completed':
				return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
			case 'Cancelled':
				return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
			case 'Pending':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
		}
	};
</script>

<SvelteToast />
<div class="font-poppins container mx-auto px-4 py-12">
	{#if !collection}
		<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
			<div
				class="spinner h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
			></div>
		</div>
	{:else}
		<BreadCrumb bind:items={breadcrumbItems} />
		<div class="mx-auto max-w-7xl">
			<div class="mb-10 flex flex-col items-center justify-between sm:flex-row">
				<div class="flex flex-col items-center sm:items-start">
					<h1 class="mb-4 text-4xl font-extrabold text-indigo-900 sm:mb-2 dark:text-indigo-200">
						{collection.name}
					</h1>
					<div class="flex space-x-4">
						<button
							class="flex items-center rounded-lg px-4 py-2 text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 {allResourcesPending
								? 'cursor-not-allowed bg-gray-400'
								: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400'}"
							disabled={allResourcesPending}
							on:click={() => !allResourcesPending && goto(`./${collection.id}/chat`)}
						>
							<span class="mr-2 h-5 w-5"><FaComment /></span>
							Chat with Collection
						</button>
						<!-- <button
							class="flex items-center rounded-lg px-4 py-2 text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 {allResourcesPending
								? 'cursor-not-allowed bg-gray-400'
								: 'bg-green-500 hover:bg-green-600 focus:ring-green-400'}"
							disabled={allResourcesPending}
							on:click={() => !allResourcesPending && goto(`./${collection.id}/generate-note`)}
						>
							<span class="mr-2 h-5 w-5"><FaStickyNote /></span>
							Generate Collection Notes
						</button> -->
					</div>
					<div class="mt-8">
						{#if allResourcesPending}
							<div class="mb-4 rounded-md bg-yellow-50 p-4 dark:bg-yellow-900">
								<div class="flex">
									<div class="flex-shrink-0">
										<svg
											class="h-5 w-5 text-yellow-400"
											viewBox="0 0 20 20"
											fill="currentColor"
											aria-hidden="true"
										>
											<path
												fill-rule="evenodd"
												d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
												clip-rule="evenodd"
											/>
										</svg>
									</div>
									<div class="ml-3">
										<h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-100">
											Processing in progress
										</h3>
										<div class="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
											<p>Chat and Generate options will be available once any file is processed.</p>
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
				<button
					on:click={() => goto(`${collection.id}/add-resource`)}
					class="mt-4 flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0"
				>
					<span class="mr-2 h-5 w-5"><FaPlus /></span>
					Add New Resource
				</button>
			</div>

			<div class="relative mb-8">
				<input
					type="text"
					placeholder="Search resources..."
					bind:value={searchQuery}
					class="w-full rounded-lg border-2 border-gray-300 py-2 pl-10 pr-4 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
				<div
					class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-300"
				>
					<FaSearch />
				</div>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#if resources}
					{#if filteredResources.length > 0}
						{#each filteredResources as resource}
							<div
								class="relative flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
							>
								<div class="absolute right-3 top-3">
									<!-- Three Dots Menu Button -->
									<button
										on:click={() => (showResourceMenu = resource.id)}
										class="focus:outline-none"
									>
										<div class="h-5 w-5 text-gray-600 dark:text-gray-300">
											<!-- Replace with a vertical dots icon -->
											<svg fill="currentColor" viewBox="0 0 20 20">
												<path
													fill-rule="evenodd"
													d="M10 4a2 2 0 110-4 2 2 0 010 4zm0 5a2 2 0 110-4 2 2 0 010 4zm0 5a2 2 0 110-4 2 2 0 010 4z"
													clip-rule="evenodd"
												/>
											</svg>
										</div>
									</button>

									<!-- Menu Items -->
									{#if showResourceMenu === resource.id}
										<div
											class="resource-menu absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800"
											on:click={() => (showResourceMenu = null)}
											use:clickOutside
										>
											<button
												on:click={() => {
													showResourceMenu = null;
													openEditModal(resource);
												}}
												class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
											>
												Edit
											</button>
											<button
												on:click={() => deleteResource(resource.id)}
												class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
											>
												Delete
											</button>
										</div>
									{/if}
								</div>
								<div
									on:click={() => goto(`./${collection.id}/${resource.id}`)}
									class="cursor-pointer"
								>
									<div class="mb-4 flex items-center">
										<span
											class="mr-4 flex h-12 w-12 items-center justify-center rounded-full {resource.type ===
											'file'
												? 'bg-indigo-100 text-indigo-600'
												: resource.type === 'youtube'
													? 'bg-red-100 text-red-600'
													: 'bg-blue-100 text-blue-600'}"
										>
											{#if resource.type === 'file'}
												<FaFile />
											{:else if resource.type === 'youtube'}
												<FaYoutube />
											{:else}
												<FaLink />
											{/if}
										</span>
										<h3 class="text-xl font-semibold text-gray-800 dark:text-white">
											{resource.name}
										</h3>
									</div>
									<div class="flex items-center justify-between">
										<span class="text-sm font-medium text-gray-500 dark:text-gray-400">
											{resource.type}
										</span>
										<span
											class={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(resource.status)}`}
										>
											{resource.status}
										</span>
									</div>
								</div>
							</div>
						{/each}
					{:else}
						<p>No resources found.</p>
					{/if}
				{:else}
					<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
						<div
							class="spinner h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
						></div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

{#if showEditModal}
	<div
		class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
		transition:fade
	>
		<div class="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
			<h2 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Edit Collection Name</h2>
			<form>
				<div class="mb-6">
					<label
						for="editCollectionName"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Resource Name
					</label>
					<input
						type="text"
						id="editResourceName"
						bind:value={editResourceName}
						class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>
				<div class="flex justify-end space-x-4">
					<button
						on:click={closeEditModal}
						class="rounded-lg bg-gray-300 px-6 py-3 text-gray-700 transition-colors duration-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
					>
						Cancel
					</button>
					<button
						on:click={() => updateResourceName(editResourceId, editResourceName)}
						class="rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
						disabled={isUpdating}
					>
						{#if isUpdating}
							<div
								class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
							></div>
						{:else}
							Update
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
