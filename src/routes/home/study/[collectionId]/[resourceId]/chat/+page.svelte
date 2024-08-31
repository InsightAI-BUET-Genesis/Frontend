<!-- Revamped -->
<script>
	// @ts-nocheck
	import ChatWindow from '$lib/components/ChatWindow.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { marked } from 'marked';
	import apiService from '$lib/apiService.ts';

	export let data;
	let breadcrumbItems = [];
	let resource = null;
	let collection = null;

	onMount(() => {
		data.resourceData.then((res) => {
			resource = res;
			breadcrumbItems = [
				{ name: 'Home', href: '../../../' },
				{ name: 'Study', href: '../../' },
				{ name: `${resource.collectionName}`, href: `../` },
				{ name: `${resource.name}`, href: `./` },
				{ name: `Chat`, href: `` }
			];
		});

		data.collectionData.then((res) => {
			collection = res;
		});
	});

	let messages = [{ id: 1, text: 'Hello! How can I help you today?', sender: 'assistant' }];

	let selectedTemplate = 'General';
	let selectedModel = 'GPT-4o';

	const promptTemplates = [
		{ id: 'General', name: 'General' },
		{ id: 'Summarizer', name: 'Summarizer' },
		{ id: 'Analyzer', name: 'Analyzer' },
		{ id: 'Teacher', name: 'Teacher' },
		{ id: 'Researcher', name: 'Researcher' },
		{ id: 'Creative Writer', name: 'Creative Writer' },
		{ id: 'Coder Assistant', name: 'Code Assistant' },
		// { id: 'Translator', name: 'Translator' },
		{ id: 'Interviewer', name: 'Interviewer' },
		{ id: 'Storyteller', name: 'Storyteller' }
	];

	const llModels = [
		{ id: 'GPT-4o', name: 'GPT-4o' },
		{ id: 'GPT-4o-mini', name: 'GPT-4o-mini' }
	];

	let chatContainer;

	let isWaitingForResponse = false;
	let showModal = false;
	let selectedFileContent = {file_url:'',page_no:'',content:''};

	$: parsedContent = marked(selectedFileContent.content);

	async function handleSendMessage(event) {
		const newMessage = event.detail;
		const newMessageObject = { id: Date.now(), text: newMessage, sender: 'user' };
		messages = [...messages, newMessageObject];
		isWaitingForResponse = true;

		let formattedeMessages = messages.slice(1).map((msg) => ({
			sender: msg.sender,
			text: msg.text
		}));

		let payload = {
			messages: formattedeMessages,
			template_category: selectedTemplate,
			collection_id: collection.id,
			collection_name: collection.originalName,
			file_id: resource.id,
			limit: 5
		};
		// Log all relevant data to the console
		console.log(payload);

		try {
			const response = await apiService.postPython('chats/on-file', payload);

			const aiResponse = {
				id: Date.now() + 1,
				text: response['content'],
				sender: 'assistant',
				payload: response['knowledge']
			};
			messages = [...messages, aiResponse];
		} catch (e) {
			console.log('Error getting message ', e);
		} finally {
			scrollToBottom();
			isWaitingForResponse = false;
		}
	}

	function handleShowFileContent(event) {
		selectedFileContent = event.detail;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		selectedFileContent = {file_url:'',page_no:'',content:''};
	}

	function scrollToBottom() {
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	}

	$: scrollToBottom();
</script>

<div class="font-poppins container mx-auto px-4 py-12">
	{#if resource && collection}
		<BreadCrumb bind:items={breadcrumbItems} />
		<div class="flex flex-col items-center">
			<div
				class="flex w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl lg:flex-row max-h-[90vh]"
			>
				<!-- Sidebar -->
				<div
					class="w-full flex-shrink-0 border-b border-gray-200 bg-gray-50 p-4 lg:w-72 lg:border-r lg:p-6"
				>
					<h2 class="mb-4 text-xl font-semibold text-gray-800 lg:mb-6">Settings</h2>

					<div class="mb-6 lg:mb-8">
						<h3 class="mb-2 text-sm font-medium text-gray-700 lg:mb-3">Prompt Template</h3>
						<select
							bind:value={selectedTemplate}
							class="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
						>
							{#each promptTemplates as template}
								<option value={template.id}>{template.name}</option>
							{/each}
						</select>
					</div>

					<div>
						<h3 class="mb-2 text-sm font-medium text-gray-700 lg:mb-3">Language Model</h3>
						<div class="space-y-2">
							{#each llModels as model}
								<label class="flex items-center">
									<input
										type="radio"
										bind:group={selectedModel}
										value={model.id}
										class="form-radio text-blue-600"
									/>
									<span class="ml-2 text-gray-700">{model.name}</span>
								</label>
							{/each}
						</div>
					</div>
				</div>

				<!-- Chat Area -->
				<div class="flex flex-1 flex-col">
					<header class="bg-blue-600 p-3 text-white lg:p-4">
						<h1 class="text-center text-xl font-bold lg:text-2xl">AI Chat</h1>
					</header>

					<main class="flex h-[400px] flex-col lg:h-[600px]">
						<div class="flex-grow overflow-y-auto p-3 lg:p-4" bind:this={chatContainer}>
							<ChatWindow
								{messages}
								{isWaitingForResponse}
								on:showFileContent={handleShowFileContent}
							/>
						</div>
						<div class="border-t border-gray-200 bg-gray-50 p-3 lg:p-4">
							<ChatInput on:sendMessage={handleSendMessage} {isWaitingForResponse} />
						</div>
					</main>
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

{#if showModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
		on:click={closeModal}
		transition:fade
	>
		<div
			class="max-h-[80vh] max-w-2xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-gray-800"
			on:click|stopPropagation
		>
			<!-- <h2 class="mb-4 text-2xl font-bold">{selectedFileContent.file_name}</h2> -->
			<p class="mb-2"><strong>Page:</strong> {selectedFileContent.page_no}</p>
			<div class="rounded bg-gray-100 p-4 dark:bg-gray-700">
				<div class="prose prose-sm dark:prose-invert">
					{@html parsedContent}
				</div>
			</div>
			<button
				on:click={closeModal}
				class="mt-4 rounded bg-blue-600 px-4 py-2 text-white transition-colors duration-300 hover:bg-blue-700"
			>
				Close
			</button>
		</div>
	</div>
{/if}

<style>
	/* Add any global styles here */
	:global(.form-radio) {
		@apply h-4 w-4 text-blue-600 transition duration-150 ease-in-out;
	}
	:global(.form-radio:focus) {
		@apply outline-none ring-2 ring-blue-500 ring-offset-2;
	}
</style>
