<!-- src/lib/components/Breadcrumb.svelte -->
<script>
    //@ts-nocheck
    import { goto } from '$app/navigation';
    import FaChevronRight from 'svelte-icons/fa/FaChevronRight.svelte';

    export let items = [];

    function handleClick(href) {
        goto(href);
    }
</script>

<nav class="flex mb-6" aria-label="Breadcrumb">
    <ol class="inline-flex items-center flex-wrap">
        {#each items as item, index}
            <li class="inline-flex items-center">
                {#if index > 0}
                    <span class="mx-2 text-gray-400 dark:text-gray-500 w-4 h-4 flex items-center justify-center">
                        <FaChevronRight />
                    </span>
                {/if}
                {#if item.href && index !== items.length - 1}
                    <button 
                        on:click={() => handleClick(item.href)}
                        class="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-200"
                    >
                        {item.name}
                    </button>
                {:else}
                    <span class="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {item.name}
                    </span>
                {/if}
            </li>
        {/each}
    </ol>
</nav>