<script>
	// @ts-nocheck
	import { goto } from '$app/navigation';
	import FaFolder from 'svelte-icons/fa/FaFolder.svelte';
	import FaPlus from 'svelte-icons/fa/FaPlus.svelte';
	import FaSearch from 'svelte-icons/fa/FaSearch.svelte';
	import { fade } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';
	import { BACKEND_URL } from '$lib/config';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import apiService from '$lib/apiService.ts';

	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	let breadcrumbItems = [
		{ name: 'Home', href: './' },
		{ name: 'Study', href: './study' }
	];

	export let data;
	let userId = data.user.id;

	let collections = null;
	let filteredCollections = [];

	onMount(() => {
		data.collectionList.then((res) => {
			if (res.length > 0) {
				collections = res;
			} else {
				collections = [];
			}
			// console.log(collections);
		});
	});

	let showCreateModal = false;
	let newCollectionName = '';
	let searchQuery = '';
	let showCollectionMenu = null;
	let showEditModal = false;
	let editCollectionName = '';
	let editCollectionId = null;

	let isLoading = true;
	let isCreating = false;
	let isDeleting = false;
	let isUpdating = false;

	$: if (collections) {
		filteredCollections = collections.filter((collection) =>
			collection.name.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}

	function openCreateModal() {
		showCreateModal = true;
		newCollectionName = '';
	}

	function closeCreateModal() {
		showCreateModal = false;
	}

	const createCollection = async () => {
		if (!newCollectionName) {
			toast.push('Collection name is empty!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(187,72,120,0.9)',
					'--toastBarBackground': '#880808'
				}
			});
			return;
		}
		isCreating = true;
		try {
			const data = await apiService.post(`collections/create`, { userId, name: newCollectionName });
			if (!data) {
				toast.push('Collection Creation Failed in DB!', {
					theme: {
						'--toastColor': 'mintcream',
						'--toastBackground': 'rgba(187,72,120,0.9)',
						'--toastBarBackground': '#880808'
					}
				});
			} else {
				const data2 = await apiService.postPython(`collection-manage/create_collection`, {
					user_id: data.id,
					collection_name: newCollectionName
				});
				if (!data2) {
					toast.push('Collection Creation Failed in Qdrant!', {
						theme: {
							'--toastColor': 'mintcream',
							'--toastBackground': 'rgba(187,72,120,0.9)',
							'--toastBarBackground': '#880808'
						}
					});
				} else {
					collections = [...collections, data];
					toast.push('Collection Successfully Created', {
						theme: {
							'--toastColor': 'mintcream',
							'--toastBackground': 'rgba(72,187,120,0.9)',
							'--toastBarBackground': '#2F855A'
						}
					});
				}
			}
			closeCreateModal();
		} catch (error) {
			console.error('Error creating collection:', error);
		} finally {
			isCreating = false;
		}
	};

	async function deleteCollection(collectionId, originalName) {
		isDeleting = true;
		try {
			await apiService.del(`collections/${collectionId}`);
			await apiService.postPython('collection-manage/delete_collection', {
				user_id: collectionId,
				collection_name: originalName
			});

			collections = collections.filter((c) => c.id !== collectionId);
			showCollectionMenu = null;
			toast.push('Collection Deleted Successfully', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch (error) {
			console.error('Error deleting collection:', error);
			showCollectionMenu = null;
			toast.push('Error Deleting Collection', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(187,72,120,0.9)',
					'--toastBarBackground': '#880808'
				}
			});
		} finally {
			isDeleting = false;
		}
	}

	async function updateCollectionName(collectionId, newName) {
		console.log(newName);
		isUpdating = true;
		try {
			const updatedCollection = await apiService.put(`collections/${collectionId}/updateName`, {
				name: newName
			});
			collections = collections.map((c) => (c.id === collectionId ? updatedCollection : c));
			showCollectionMenu = null;
			toast.push('Collection Updated Successfully', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch (error) {
			console.error('Error updating collection:', error);
			showCollectionMenu = null;
			toast.push('Error Updating Collection', {
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
		editCollectionName = collection.name;
		editCollectionId = collection.id;
	}

	function closeEditModal() {
		showEditModal = false;
		editCollectionName = '';
		editCollectionId = null;
	}

	// Custom action to detect click outside the element
	function clickOutside(node) {
		const handleClick = (event) => {
			// Check if the click is outside the element
			if (!node.contains(event.target)) {
				showCollectionMenu = null;
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
</script>

<div class="font-poppins container mx-auto px-4 py-12">
	<SvelteToast />
	<BreadCrumb items={breadcrumbItems} />
	<div class="mx-auto max-w-7xl">
		<div class="mb-10 flex flex-col items-center justify-between sm:flex-row">
			<h1 class="mb-4 text-4xl font-extrabold text-indigo-900 sm:mb-0 dark:text-indigo-200">
				Study Collections
			</h1>
			<button
				on:click={openCreateModal}
				class="flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
			>
				<span class="mr-2 h-5 w-5"><FaPlus /></span>
				Create New Collection
			</button>
		</div>

		<div class="relative mb-8">
			<input
				type="text"
				placeholder="Search collections..."
				bind:value={searchQuery}
				class="w-full rounded-lg border-2 border-gray-300 py-2 pl-10 pr-4 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			/>
			<div
				class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-300"
			>
				<FaSearch />
			</div>
		</div>
		{#if collections}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#if filteredCollections.length > 0}
					{#each filteredCollections as collection}
						<div
							class="relative flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
						>
							<div class="absolute right-3 top-3">
								<!-- Three Dots Menu Button -->
								<button
									on:click={() => (showCollectionMenu = collection.id)}
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
								{#if showCollectionMenu === collection.id}
									<div
										class="collection-menu absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800"
										on:click={() => (showCollectionMenu = null)}
										use:clickOutside
									>
										<button
											on:click={() => {
												showCollectionMenu = null;
												openEditModal(collection);
											}}
											class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
										>
											Edit
										</button>
										<button
											on:click={() => deleteCollection(collection.id, collection.originalName)}
											class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
										>
											Delete
										</button>
									</div>
								{/if}
							</div>
							<div on:click={() => goto(`./study/${collection.id}`)} class="cursor-pointer">
								<div class="mb-4 flex items-center">
									<span
										class="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600"
									>
										<div class="h-6 w-6">
											<FaFolder />
										</div>
									</span>
									<h3 class="text-xl font-semibold text-gray-800 dark:text-white">
										{collection.name}
									</h3>
								</div>
								<span class="text-sm font-medium text-gray-500 dark:text-gray-400">
									{collection.count}
									{collection.count === 1 ? 'resource' : 'resources'}
								</span>
							</div>
						</div>
					{/each}
				{:else}
					<p>No collections found.</p>
				{/if}
			</div>
		{:else}
			<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
				<div
					class="spinner h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
				></div>
			</div>
		{/if}
	</div>
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
						Collection Name
					</label>
					<input
						type="text"
						id="editCollectionName"
						bind:value={editCollectionName}
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
						on:click={() => updateCollectionName(editCollectionId, editCollectionName)}
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

{#if showCreateModal}
	<div
		class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
		transition:fade
	>
		<div class="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
			<h2 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Create New Collection</h2>
			<form>
				<div class="mb-6">
					<label
						for="collectionName"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Collection Name
					</label>
					<input
						type="text"
						id="collectionName"
						bind:value={newCollectionName}
						class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>
				<div class="flex justify-end space-x-4">
					<button
						on:click={closeCreateModal}
						class="rounded-lg bg-gray-300 px-6 py-3 text-gray-700 transition-colors duration-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
					>
						Cancel
					</button>
					<button
						on:click={createCollection}
						class="rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
						disabled={isCreating}
					>
						{#if isCreating}
							<div
								class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
							></div>
						{:else}
							Create
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
