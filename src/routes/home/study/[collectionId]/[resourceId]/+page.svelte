<!-- src/routes/study/[collectionId]/[studyId]/+page.svelte -->
<script>
	//@ts-nocheck
	import { page } from '$app/stores';
	import FaFile from 'svelte-icons/fa/FaFile.svelte';
	import FaYoutube from 'svelte-icons/fa/FaYoutube.svelte';
	import FaComment from 'svelte-icons/fa/FaComment.svelte';
	import FaLink from 'svelte-icons/fa/FaLink.svelte';
	import FaStickyNote from 'svelte-icons/fa/FaStickyNote.svelte';
	import FaQuestionCircle from 'svelte-icons/fa/FaQuestionCircle.svelte';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import apiService from '$lib/apiService.ts';
	import { onMount, onDestroy } from 'svelte';

	export let data;

	let breadcrumbItems = [];
	let resource = null;

	const actions = [
		{
			title: 'Chat with Data',
			icon: FaComment,
			href: `./${$page.params.resourceId}/chat`,
			color: 'bg-blue-100 dark:bg-blue-800'
		},
		{
			title: 'Generate Notes',
			icon: FaStickyNote,
			href: `./${$page.params.resourceId}/generate-note`,
			color: 'bg-green-100 dark:bg-green-800'
		},
		{
			title: 'Quiz',
			icon: FaQuestionCircle, // You'll need to import this icon
			href: `./${$page.params.resourceId}/quiz`,
			color: 'bg-purple-100 dark:bg-purple-800'
		}
	];

	const isProcessingComplete = (status) => status === 'Completed';

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

	const getResourceIcon = (type) => {
		switch (type) {
			case 'file':
				return FaFile;
			case 'youtube':
				return FaYoutube;
			case 'url':
				return FaLink;
			default:
				return FaFile;
		}
	};

	onMount(() => {
		data.resourceData.then((res) => {
			resource = res;
			breadcrumbItems = [
				{ name: 'Home', href: '../../' },
				{ name: 'Study', href: '../' },
				{ name: `${resource.collectionName}`, href: `./` },
				{ name: `${resource.name}`, href: `` }
			];
		});
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
	{#if resource}
		<BreadCrumb bind:items={breadcrumbItems} />
		<div
			class="font-poppins min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 dark:from-gray-900 dark:to-indigo-900"
		>
			<div class="mx-auto max-w-4xl">
				<header class="mb-8 text-center sm:mb-12">
					<h1
						class="mb-4 text-3xl font-bold tracking-tight text-indigo-900 sm:text-4xl dark:text-white"
					>
						{resource.name}
					</h1>
				</header>

				<div class="mb-8 rounded-xl bg-white p-6 shadow-lg sm:mb-12 sm:p-8 dark:bg-gray-800">
					<div class="flex flex-col space-y-6">
						<div
							class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
						>
							<div class="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
								<span class="h-6 w-6 text-indigo-600 sm:h-8 sm:w-8 dark:text-indigo-400">
									<svelte:component this={getResourceIcon(resource.type)} />
								</span>
								<span class="text-base capitalize sm:text-lg">{resource.type}</span>
							</div>
							<!-- ... (collection name code) -->
						</div>
						<div class="h-px w-full bg-gray-200 dark:bg-gray-700"></div>
						<div>
							<h3 class="mb-2 text-base font-semibold text-gray-800 sm:text-lg dark:text-gray-200">
								{resource.type === 'youtube' ? 'YouTube Link:' : 'Source Link:'}
							</h3>
							<div class="flex items-center justify-between">
								{#if resource.type == 'file'}
									<a
										href={resource.url}
										target="_blank"
										class="break-all text-sm text-indigo-600 transition-colors duration-300 hover:underline sm:text-base dark:text-indigo-400"
									>
										{resource.name}
									</a>
								{:else}
									<a
										href={resource.youtubeUrl}
										target="_blank"
										class="break-all text-sm text-indigo-600 transition-colors duration-300 hover:underline sm:text-base dark:text-indigo-400"
									>
										{resource.name}
									</a>
								{/if}
								<span
									class={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(resource.status)}`}
								>
									{resource.status}
								</span>
							</div>
						</div>
						{#if resource.type === 'youtube' || resource.type === 'url'}
							<div>
								<h3
									class="mb-2 text-base font-semibold text-gray-800 sm:text-lg dark:text-gray-200"
								>
									Extracted Data:
								</h3>

								<a
									href={resource.url}
									target="_blank"
									class="break-all text-sm text-indigo-600 transition-colors duration-300 hover:underline sm:text-base dark:text-indigo-400"
								>
									View extracted data
								</a>
							</div>
						{/if}
					</div>
				</div>

				<div class="mt-8">
					{#if !isProcessingComplete(resource.status)}
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
										<p>Chat and Generate options will be available once the file is processed.</p>
									</div>
								</div>
							</div>
						</div>
					{/if}

					<div class="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
						{#each actions as action}
							<div
								class={`rounded-xl p-6 shadow-lg transition-all duration-300 ${isProcessingComplete(resource.status) ? 'hover:-translate-y-2 hover:shadow-2xl' : 'cursor-not-allowed opacity-50'} ${action.color}`}
							>
								{#if isProcessingComplete(resource.status)}
									<a href={action.href} class="flex flex-col items-center justify-center">
										<div
											class="mb-4 h-12 w-12 text-indigo-600 sm:mb-6 sm:h-16 sm:w-16 dark:text-indigo-300"
										>
											<svelte:component this={action.icon} />
										</div>
										<h2
											class="text-center text-lg font-semibold text-gray-800 sm:text-xl dark:text-white"
										>
											{action.title}
										</h2>
									</a>
								{:else}
									<div class="flex flex-col items-center justify-center">
										<div class="mb-4 h-12 w-12 text-gray-400 sm:mb-6 sm:h-16 sm:w-16">
											<svelte:component this={action.icon} />
										</div>
										<h2 class="text-center text-lg font-semibold text-gray-400 sm:text-xl">
											{action.title}
										</h2>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
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
	:global(svg) {
		width: 100%;
		height: 100%;
	}
</style>
