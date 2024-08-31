<!-- src/routes/+layout.svelte -->
<script>
    // @ts-nocheck
        import { onMount } from 'svelte';
        import Topbar from '$lib/components/Topbar.svelte';
        import ChatPopup from '$lib/components/ChatPopup.svelte';
        import { fade } from 'svelte/transition';
    
        let loaded = false;
        export let data;
    
        let { session, supabase, authUser, userInfo } = data;
        $: ({ session, supabase, authUser, userInfo } = data);
        
        let username = userInfo.userName;
        let userPic = userInfo.profilePictureUrl;
        const navItems = [
            // Add your navigation items here when ready
        ];
    
        onMount(() => {
            loaded = true;
        });
    </script>
    
    <svelte:head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    </svelte:head>
    
    <style>
        :global(body) {
            font-family: 'Poppins', sans-serif;
        }
    </style>
    
    {#if loaded}
        <div in:fade={{ duration: 300 }} class="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            <!-- Topbar -->
            <Topbar {username} {userPic} {navItems} />
    
            <!-- Main content -->
            <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-800 dark:to-indigo-900">
                <slot />
            </main>
    
            <!-- Chat Popup -->
            <!-- <ChatPopup /> -->
        </div>
    {/if}