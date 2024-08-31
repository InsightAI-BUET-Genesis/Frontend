<script>
  // @ts-nocheck
  import { createEventDispatcher } from 'svelte';
  import { marked } from 'marked';

  export let text = '';
  export let sender = 'user';
  export let id = '';
  export let payload = null;

  let showPayload = false;

  const dispatch = createEventDispatcher();

  function togglePayload() {
    showPayload = !showPayload;
  }

  function showFileContent(file) {
    dispatch('showFileContent', file);
  }

  // Parse markdown content
  $: parsedText = marked(text);
</script>

<div class="flex {sender === 'user' ? 'justify-end' : 'justify-start'} mb-4 group">
  <div class="max-w-[75%] p-3 rounded-lg shadow-md relative {sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}">
    <div class="text-base prose prose-sm {sender === 'user' ? 'prose-invert' : ''}" on:click|stopPropagation>
      {@html parsedText}
    </div>
    {#if payload}
      <button 
        on:click={togglePayload}
        class="text-sm {sender === 'user' ? 'text-blue-200' : 'text-blue-600'} mt-2 underline"
      >
        View source documents
      </button>
    {/if}
  </div>
</div>

{#if showPayload && payload}
  <div class="bg-gray-100 p-2 rounded mt-2 mb-4">
    <h4 class="font-semibold mb-1">Source Documents:</h4>
    {#each payload as file, index}
      <div class="text-sm flex items-center">
        <button 
          on:click={() => showFileContent(file)}
          class="text-blue-600 hover:underline cursor-pointer"
        >
          <!-- {file.file_name} (Page {file.page_no}) -->
          Source: {index} (Page {file.page_no})
        </button>
        <a href={file.file_url} target="_blank" rel="noopener noreferrer" class="ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500 hover:text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    {/each}
  </div>
{/if}