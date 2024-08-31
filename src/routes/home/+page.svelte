<!-- src/routes/+page.svelte -->
<script>
    //@ts-check
    import { onMount } from 'svelte';
    import FaBook from 'svelte-icons/fa/FaBook.svelte';
    import FaCalendarAlt from 'svelte-icons/fa/FaCalendarAlt.svelte';
    import FaTasks from 'svelte-icons/fa/FaTasks.svelte';
    import FaShoppingCart from 'svelte-icons/fa/FaShoppingCart.svelte';
    import ChatPopup from '$lib/components/ChatPopup.svelte';

    import BreadCrumb from '$lib/components/BreadCrumb.svelte';
    let breadcrumbItems = [{name:"Home", href:"./"}]

    const modules = [
        { title: "Study Companion", icon: FaBook, href: "/home/study", color: "bg-blue-100 dark:bg-blue-800" },
        // { title: "Smart Calendar", icon: FaCalendarAlt, href: "/home/smart-calender", color: "bg-green-100 dark:bg-green-800" },
        { title: "Project Manager", icon: FaTasks, href: "/home/project-manager", color: "bg-yellow-100 dark:bg-yellow-800" },
        { title: "Shop-Genie", icon: FaShoppingCart, href: "/home/shop-genie", color: "bg-pink-100 dark:bg-pink-800" },
    ];

    onMount(() => {
        // Any initialization logic can go here
    });
</script>

<svelte:head>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="container mx-auto px-4 py-12 font-poppins">
    <BreadCrumb items={breadcrumbItems}/>
    <header class="mb-16 text-center">
        <h1 class="text-4xl font-bold text-indigo-900 dark:text-white mb-4 tracking-tight">Welcome to Insight<span class="text-purple-600">AI</span></h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 font-light">What would you like to focus on today?</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each modules as module}
            <a href={module.href} class="{module.color} rounded-xl shadow-lg p-8 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div class="text-indigo-600 dark:text-indigo-300 w-20 h-20 mb-6">
                    <svelte:component this={module.icon} />
                </div>
                <h2 class="text-2xl font-semibold text-gray-800 dark:text-white text-center">{module.title}</h2>
            </a>
        {/each}
    </div>
    <!-- <ChatPopup/> -->
</div>

<style>
    :global(body) {
        font-family: 'Poppins', sans-serif;
    }
</style>