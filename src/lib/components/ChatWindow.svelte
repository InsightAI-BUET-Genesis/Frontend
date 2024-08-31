<script>
	// @ts-nocheck
	import { onMount, afterUpdate, createEventDispatcher } from 'svelte';
	import ChatMessage from './ChatMessage.svelte';

	export let messages = [];
	export let isWaitingForResponse = false;

	const dispatch = createEventDispatcher();

	function handleShowFileContent(event) {
		dispatch('showFileContent', event.detail);
	}
</script>

<div
	class="scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100 flex-grow space-y-4 overflow-y-auto p-4"
>
	{#each messages as message (message.id)}
		<div class="fade-in">
			<ChatMessage {...message} on:showFileContent={handleShowFileContent} />
		</div>
	{/each}
	{#if isWaitingForResponse}
		<div class="mb-4 flex justify-start">
			<div class="rounded-lg bg-gray-100 p-3 shadow-md">
				<div class="typing-indicator">
					<span></span>
					<span></span>
					<span></span>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.fade-in {
		animation: fadeIn 0.3s ease-in-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Scrollbar styles */
	.scrollbar-thin::-webkit-scrollbar {
		width: 6px;
	}
	.scrollbar-thumb-blue-300::-webkit-scrollbar-thumb {
		background-color: #93c5fd;
		border-radius: 3px;
	}
	.scrollbar-track-blue-100::-webkit-scrollbar-track {
		background-color: #dbeafe;
	}

	.typing-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 30px;
	}

	.typing-indicator span {
		height: 10px;
		width: 10px;
		float: left;
		margin: 0 2px;
		background-color: #9880ff;
		display: block;
		border-radius: 50%;
		opacity: 0.4;
		animation: typing 1s infinite alternate;
	}

	.typing-indicator span:nth-of-type(2) {
		animation-delay: 0.33s;
	}

	.typing-indicator span:nth-of-type(3) {
		animation-delay: 0.66s;
	}

	@keyframes typing {
		0% {
			transform: translateY(0px);
		}
		100% {
			transform: translateY(-10px);
		}
	}
</style>
