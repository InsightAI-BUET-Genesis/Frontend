<!-- src/routes/study/[collectionId]/add-resource/+page.svelte -->
<script>
	//@ts-nocheck
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import FaUpload from 'svelte-icons/fa/FaUpload.svelte';
	import FaYoutube from 'svelte-icons/fa/FaYoutube.svelte';
	import FaFile from 'svelte-icons/fa/FaFile.svelte';
	import FaPlus from 'svelte-icons/fa/FaPlus.svelte';
	import FaSearch from 'svelte-icons/fa/FaSearch.svelte';
	import FaLink from 'svelte-icons/fa/FaLink.svelte';
	import apiService from '$lib/apiService.ts';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';

	export let data;
	let activeTab = 'file';
	let newResource = { name: '', type: 'file', file: null, youtubeLink: '', url: '' };
	let urlContent = '';
	let collection = null;
	let breadcrumbItems = [];

	onMount(() => {
		data.collectionData.then((res) => {
			collection = res;

			breadcrumbItems = [
				{ name: 'Home', href: '../../' },
				{ name: 'Study', href: '../' },
				{ name: `${collection.name}`, href: `./` },
				{ name: `Add New Resource`, href: `` }
			];
		});
	});

	function handleFileSelect(event) {
		const file = event.target.files[0];
		if (file) {
			newResource.file = file;
			newResource.name = file.name.split('.')[0];
		}
	}

	let isFetchingUrl = false;

	async function fetchUrlContent() {
		if (newResource.youtubeLink) {
			isFetchingUrl = true;
			try {
				const res = await apiService.postPython('url-content', { url: newResource.youtubeLink });
				urlContent = res['text_content'];
				console.log(res);
				toast.push('URL content fetched successfully', {
					theme: {
						'--toastColor': 'mintcream',
						'--toastBackground': 'rgba(72,187,120,0.9)',
						'--toastBarBackground': '#2F855A'
					}
				});
			} catch (error) {
				console.error('Error fetching URL content:', error);
				toast.push('Error fetching URL content', {
					theme: {
						'--toastColor': 'mintcream',
						'--toastBackground': 'rgba(187,72,120,0.9)',
						'--toastBarBackground': '#880808'
					}
				});
			} finally {
				isFetchingUrl = false;
			}
		}
	}

	function getYouTubeVideoID(url) {
		const regex =
			/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
		const match = url.match(regex);
		return match ? match[1] : null;
	}

	let isAddingResource = false;

	async function addResource() {
		if (!newResource.name) {
			toast.push('Name field is empty!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(187,72,120,0.9)',
					'--toastBarBackground': '#880808'
				}
			});
			return;
		}

		isAddingResource = true;

		let supabaseUrl;
		let timestamp = new Date().getTime();
		let name = timestamp + '_' + newResource.name;

		if (activeTab === 'file') {
			if (!newResource.file) {
				toast.push('No file is chosen!', {
					theme: {
						'--toastColor': 'mintcream',
						'--toastBackground': 'rgba(187,72,120,0.9)',
						'--toastBarBackground': '#880808'
					}
				});
				return;
			}
			supabaseUrl = await apiService.uploadFileToSupabase(newResource.file, 'files', name);
		} else if (activeTab === 'url') {
			if (!newResource.youtubeLink || !urlContent) {
				toast.push('URL, content is missing!', {
					theme: {
						'--toastColor': 'mintcream',
						'--toastBackground': 'rgba(187,72,120,0.9)',
						'--toastBarBackground': '#880808'
					}
				});
				return;
			}
			const blob = new Blob([urlContent], { type: 'text/plain' });
			const file = new File([blob], name, { type: 'text/plain' });
			supabaseUrl = await apiService.uploadFileToSupabase(file, 'files', name);
		} else if (activeTab === 'youtube') {
			if (!newResource.youtubeLink) {
				toast.push('No YouTube link is given!', {
					theme: {
						'--toastColor': 'mintcream',
						'--toastBackground': 'rgba(187,72,120,0.9)',
						'--toastBarBackground': '#880808'
					}
				});
				return;
			}

			let videoId = getYouTubeVideoID(newResource.youtubeLink);

			const res = await apiService.post('transcription/youtube', { videoId: videoId });
			const transcript = res['transcript'];

			const blob = new Blob([transcript], { type: 'text/plain' });
			const file = new File([blob], name, { type: 'text/plain' });
			supabaseUrl = await apiService.uploadFileToSupabase(file, 'files', name);
		}

		const payload = {
			collectionId: collection.id,
			name: newResource.name,
			type: activeTab,
			youtubeUrl: newResource.youtubeLink,
			url: supabaseUrl
		};

		try {
			const data = await apiService.post('files/create', payload);
			// await apiService.postPython("process-file",{
			// 	file_url: data.url,
			// 	file_id: data.id,
			// 	user_id: collection.id,
			// 	collection_name: collection.originalName
			// })
			// console.log({
			// 	file_url: data.url,
			// 	file_id: data.id,
			// 	user_id: collection.id,
			// 	collection_name: collection.originalName
			// });
			if (data) {
				toast.push('File Successfully Uploaded', {
					theme: {
						'--toastColor': 'mintcream',
						'--toastBackground': 'rgba(72,187,120,0.9)',
						'--toastBarBackground': '#2F855A'
					}
				});
				// goto(`../`);
				newResource = { name: '', type: 'file', file: null, youtubeLink: '', url: '' };
				urlContent = '';
			} else {
				toast.push('File Uploading Failed!', {
					theme: {
						'--toastColor': 'mintcream',
						'--toastBackground': 'rgba(187,72,120,0.9)',
						'--toastBarBackground': '#880808'
					}
				});
			}
		} catch (error) {
			console.error('Error uploading file:', error);
			toast.push('Error uploading file', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(187,72,120,0.9)',
					'--toastBarBackground': '#880808'
				}
			});
		} finally {
			isAddingResource = false;
		}
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

<SvelteToast />
<div class="font-poppins container mx-auto px-4 py-12">
	{#if !collection}
		<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
			<div
				class="spinner h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
			></div>
		</div>
	{:else}
		<BreadCrumb items={breadcrumbItems} />
		<div class="mx-auto max-w-3xl">
			<div class="mt-8 overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
				<div class="px-4 py-5 sm:p-6">
					<h1 class="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Add New Resource</h1>

					<div class="mb-8">
						<div class="flex space-x-1 rounded-lg bg-gray-200 p-1 dark:bg-gray-700">
							<button
								class={`flex-1 rounded-md px-4 py-2 transition-colors duration-200 ${activeTab === 'file' ? 'bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'}`}
								on:click={() => (activeTab = 'file')}
							>
								<span class="flex items-center justify-center">
									<span class="mr-2 h-5 w-5"><FaFile /></span>
									File
								</span>
							</button>
							<button
								class={`flex-1 rounded-md px-4 py-2 transition-colors duration-200 ${activeTab === 'url' ? 'bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'}`}
								on:click={() => (activeTab = 'url')}
							>
								<span class="flex items-center justify-center">
									<span class="mr-2 h-5 w-5"><FaLink /></span>
									URL
								</span>
							</button>
							<button
								class={`flex-1 rounded-md px-4 py-2 transition-colors duration-200 ${activeTab === 'youtube' ? 'bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'}`}
								on:click={() => (activeTab = 'youtube')}
							>
								<span class="flex items-center justify-center">
									<span class="mr-2 h-5 w-5"><FaYoutube /></span>
									YouTube
								</span>
							</button>
						</div>
					</div>

					<div class="space-y-6">
						<div>
							<label
								for="resourceName"
								class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>Resource Name</label
							>
							<input
								type="text"
								id="resourceName"
								bind:value={newResource.name}
								required
								class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
						</div>

						{#if activeTab === 'file'}
							<div>
								<label
									for="fileUpload"
									class="inline-flex cursor-pointer items-center rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
								>
									<span class="mr-2 h-5 w-5"><FaUpload /></span>
									Choose File
								</label>
								<input
									required
									id="fileUpload"
									type="file"
									accept=".pdf,.ppt,.pptx,.doc,.docx"
									class="hidden"
									on:change={handleFileSelect}
								/>
								{#if newResource.file}
									<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
										{newResource.file.name}
									</p>
								{/if}
							</div>
						{:else if activeTab === 'url'}
							<div>
								<label
									for="urlInput"
									class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">URL</label
								>
								<div class="space-y-2 sm:flex sm:space-x-2 sm:space-y-0">
									<div class="flex-grow">
										<input
											type="url"
											id="urlInput"
											bind:value={newResource.youtubeLink}
											required
											class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
											placeholder="Enter URL"
										/>
									</div>
									<div class="flex justify-end sm:justify-start">
										<button
											on:click={fetchUrlContent}
											disabled={isFetchingUrl || !newResource.youtubeLink}
											class="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 sm:w-auto"
										>
											Fetch Content
										</button>
									</div>
								</div>
							</div>
							{#if isFetchingUrl}
								<div class="mt-4 text-center">
									<div
										class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
									></div>
									<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
										Fetching URL content...
									</p>
								</div>
							{:else if urlContent}
								<div class="mt-4">
									<label
										for="urlContent"
										class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
										>Content</label
									>
									<textarea
										id="urlContent"
										bind:value={urlContent}
										rows="5"
										class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
									></textarea>
								</div>
							{/if}
						{:else if activeTab === 'youtube'}
							<div>
								<label
									for="youtubeLink"
									class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
									>YouTube Link</label
								>
								<input
									required
									type="text"
									id="youtubeLink"
									bind:value={newResource.youtubeLink}
									class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
							</div>
						{/if}
					</div>

					<div class="mt-8 flex justify-end space-x-4">
						<button
							on:click={addResource}
							disabled={isAddingResource}
							class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
						>
							{#if isAddingResource}
								<div
									class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
								></div>
							{/if}
							Add Resource
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
