<script>
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	let message = '';
	export let isWaitingForResponse = false;
	const dispatch = createEventDispatcher();

	function sendMessage() {
		if (message.trim()) {
			dispatch('sendMessage', message);
			message = '';
		}
	}
</script>

<div class="flex items-center rounded-lg bg-blue-500 p-2 shadow-md">
    <input
        disabled={isWaitingForResponse}
        type="text"
        bind:value={message}
        placeholder="Type a message..."
        class="flex-grow rounded-l-lg border-2 border-transparent bg-white p-2 text-sm sm:text-base text-gray-800 placeholder-gray-400 transition duration-300 focus:border-blue-300 focus:outline-none"
        on:keypress={(e) => e.key === 'Enter' && sendMessage()}
    />
    <button
        disabled={isWaitingForResponse}
        on:click={sendMessage}
        class="rounded-r-lg bg-white p-2 font-semibold text-blue-500 transition duration-300 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
        transition:fade
    >
        <div class="h-5 w-5 sm:h-6 sm:w-6">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-full w-full"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
            </svg>
        </div>
    </button>
</div>
