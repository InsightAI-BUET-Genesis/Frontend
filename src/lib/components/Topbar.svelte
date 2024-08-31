<!-- src/components/Topbar.svelte -->
<script>
	// @ts-nocheck
	import { fade } from 'svelte/transition';
	import FaUser from 'svelte-icons/fa/FaUser.svelte';
	import FaUserCircle from 'svelte-icons/fa/FaUserCircle.svelte';
	import FaSignOutAlt from 'svelte-icons/fa/FaSignOutAlt.svelte';
	import FaHeart from 'svelte-icons/fa/FaHeart.svelte';
	import logo from '$lib/assets/logo.png';

	export let username = 'Jane Smith'; // This would typically come from a user store or API
	export let userPic;
	export let navItems = [];

	let userMenuOpen = false;

	function toggleUserMenu() {
		userMenuOpen = !userMenuOpen;
	}

	function handleClickOutside(event) {
		if (userMenuOpen && !event.target.closest('.user-menu')) {
			userMenuOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<header class="z-20 bg-white shadow-lg dark:bg-gray-800">
	<div class="container mx-auto flex items-center justify-between px-4 py-4">
		<div class="flex items-center space-x-8">
			<a href="/home" class="flex items-center text-2xl font-bold text-indigo-900 dark:text-white">
				<img src={logo} class="mr-2 h-10" alt="InsightAI Logo" />
				Insight<span class="text-purple-600">AI</span>
			</a>
			<nav>
				<ul class="flex space-x-6">
					{#each navItems as item}
						<li>
							<a
								href={item.href}
								class="font-medium text-gray-600 transition-colors duration-200 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
								>{item.title}</a
							>
						</li>
					{/each}
				</ul>
			</nav>
		</div>
		<div class="user-menu flex items-center space-x-4">
			<a
				href="/home/wish-list"
				class="relative flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-all duration-200 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-800 dark:focus:ring-offset-gray-800"
			>
				<div class="h-5 w-5">
					<FaHeart />
				</div>
				<!-- {#if cartItemCount > 0}
					<span
						class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
					>
						{cartItemCount}
					</span>
				{/if} -->
			</a>
			<span class="font-medium text-gray-700 dark:text-gray-300">{username}</span>

			<div class="relative">
				{#if userPic}
					<button
						on:click={toggleUserMenu}
						class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-900 dark:text-indigo-400 dark:focus:ring-offset-gray-800"
					>
						<img src={userPic} alt="User Pic" class="rounded-full" />
					</button>
				{:else}
					<button
						on:click={toggleUserMenu}
						class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-900 dark:text-indigo-400 dark:focus:ring-offset-gray-800"
					>
						<div class="h-5 w-5">
							<FaUser />
						</div>
					</button>
				{/if}
				{#if userMenuOpen}
					<div
						class="absolute right-0 z-10 mt-2 w-56 rounded-md border bg-white py-1 shadow-lg dark:bg-gray-800"
						transition:fade={{ duration: 150 }}
					>
						<a
							href="/home/profile"
							class="block px-4 py-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-indigo-50 dark:text-gray-300 dark:hover:bg-indigo-900"
						>
							<div class="mr-2 inline-block h-4 w-4 text-indigo-600 dark:text-indigo-400">
								<FaUserCircle />
							</div>
							Profile
						</a>
						<a
							href="/home/logout"
							class="block px-4 py-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-indigo-50 dark:text-gray-300 dark:hover:bg-indigo-900"
						>
							<div class="mr-2 inline-block h-4 w-4 text-indigo-600 dark:text-indigo-400">
								<FaSignOutAlt />
							</div>
							Logout
						</a>
					</div>
				{/if}
			</div>
		</div>
	</div>
</header>
