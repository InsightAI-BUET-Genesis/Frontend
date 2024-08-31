<!-- $lib/components/ChatPopup.svelte -->
<script>
    // @ts-nocheck
	import { fade, fly, slide } from 'svelte/transition';
	import FaComment from 'svelte-icons/fa/FaComment.svelte';
	import FaTimes from 'svelte-icons/fa/FaTimes.svelte';
	import FaExternalLinkAlt from 'svelte-icons/fa/FaExternalLinkAlt.svelte';
	import FaPaperPlane from 'svelte-icons/fa/FaPaperPlane.svelte';
	import FaRobot from 'svelte-icons/fa/FaRobot.svelte';
	import { marked } from 'marked';
	import ChatWindow from './ChatWindow.svelte';

	let isOpen = false;
	let messages = [{ id: 1, text: 'Hello! How can I help you today?', sender: 'assistant' }];
	let isWaitingForResponse = false;
	let showModal = false;
	let selectedFileContent = { file_url: '', page_no: '', content: '' };

	$: parsedContent = marked(selectedFileContent.content);

	function toggleChat() {
		isOpen = !isOpen;
	}

	async function handleSendMessage(event) {
		const newMessage = event.target.message.value;
		event.target.reset();

		const newMessageObject = { id: Date.now(), text: newMessage, sender: 'user' };
		messages = [...messages, newMessageObject];
		isWaitingForResponse = true;

		// Simulate API call with setTimeout
		setTimeout(() => {
			const aiResponse = {
				id: Date.now() + 1,
				text: `You said: "${newMessage}". This is a simulated response.`,
				sender: 'assistant',
				payload: [
					{
						file_name: 'document1.pdf',
						file_url: 'https://example.com/doc1.pdf',
						page_no: '1',
						content: 'This is some sample content from document1.pdf'
					}
				]
			};
			messages = [...messages, aiResponse];
			isWaitingForResponse = false;
		}, 2000); // 2 second delay
	}

	function handleShowFileContent(event) {
		selectedFileContent = event.detail;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		selectedFileContent = { file_url: '', page_no: '', content: '' };
	}

	$: if (!isOpen) {
		messages = [{ id: 1, text: 'Hello! How can I help you today?', sender: 'assistant' }];
	}
</script>

<div class="fixed bottom-4 right-4 z-50">
	{#if !isOpen}
		<button
			on:click={toggleChat}
			class="rounded-full bg-indigo-600 p-4 text-white shadow-lg transition-colors duration-300 hover:scale-105 hover:bg-indigo-700"
		>
			<div class="h-6 w-6">
				<FaComment />
			</div>
		</button>
	{:else}
		<div
			class="p-3 fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50"
		>
			<div
				class="mx-4 flex min-h-[50vh] max-h-[800px] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl sm:w-3/4 dark:bg-gray-800"
			>
			<div class="flex items-center justify-between rounded-t-lg bg-indigo-600 p-4 text-white">
				<div class="font-bold flex flex-row items-center justify-start text-xl">
					<div class="w-8 h-8 mr-3">
						<FaRobot/>
					</div>
					InsightAI Chatbot
				</div>
				<button on:click={toggleChat} class="text-white hover:text-gray-200">
					<div class="h-4 w-4">
						<FaTimes />
					</div>
				</button>
			</div>
				<div class="flex-1 overflow-y-auto">
                    <div class="h-full p-3 lg:p-4">
                        <ChatWindow
                            {messages}
                            {isWaitingForResponse}
                            on:showFileContent={handleShowFileContent}
                        />
                    </div>
                </div>
				<div class="border-t p-4 dark:border-gray-700">
					<form on:submit|preventDefault={handleSendMessage} class="flex items-center">
						<input
							name="message"
							type="text"
							placeholder="Type your message..."
							disabled={isWaitingForResponse}
							class="flex-1 rounded-l-lg border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
						<button
							type="submit"
							disabled={isWaitingForResponse}
							class="rounded-r-lg bg-indigo-600 p-2 text-white transition-colors duration-300 hover:bg-indigo-700 disabled:opacity-50"
						>
							<div class="h-6 w-6">
								<FaPaperPlane />
							</div>
						</button>
					</form>
				</div>
			</div>
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
	/* Ensure icons display correctly */
	:global(svg) {
		width: 100%;
		height: 100%;
	}
</style>
