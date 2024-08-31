<script>
	import { slide } from 'svelte/transition';
	import logo from '$lib/assets/logo.png';

	let isMenuOpen = false;

	// const navItems = [
	//   { href: '/#', title: 'Home' },
	//   { href: '/#features', title: 'Features' },
	//   { href: '/#pricing', title: 'Pricing' },
	//   { href: '/#demo', title: 'Book Demo' },
	//   { href: '/#contact', title: 'Contact' }
	// ];

	const navItems = [
		{ href: '/login', title: 'Login' },
		{ href: '/signup', title: 'Signup' }
	];

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
	}
</script>

<nav class="sticky top-0 z-20 bg-white shadow-lg dark:bg-gray-800">
	<div class="container mx-auto px-6 py-3">
		<div class="flex items-center justify-between">
			<a href="/" class="flex items-center text-2xl font-bold text-indigo-900 dark:text-white">
				<img src={logo} class="mr-2 h-10" alt="InsightAI Logo" />
				Insight<span class="text-purple-600">AI</span>
			</a>
			<div class="flex md:hidden">
				<button
					on:click={toggleMenu}
					class="text-indigo-900 transition-colors duration-300 hover:text-purple-600 focus:text-purple-600 focus:outline-none dark:text-white dark:hover:text-purple-400"
				>
					<svg
						class="h-6 w-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16m-7 6h7"
						/>
					</svg>
				</button>
			</div>
			<ul class="hidden space-x-1 md:flex">
				{#each navItems as { href, title }}
					<li>
						<a
							{href}
							class="rounded-full px-4 py-2 text-sm font-medium text-indigo-900 transition duration-300 hover:bg-purple-100 hover:text-purple-600 dark:text-white dark:hover:bg-purple-900 dark:hover:text-purple-300"
							on:click={closeMenu}
						>
							{title}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
	{#if isMenuOpen}
		<div
			transition:slide
			class="absolute left-0 top-full z-20 w-full bg-white shadow-lg md:hidden dark:bg-gray-800"
		>
			<ul class="space-y-2 px-6 py-4">
				{#each navItems as { href, title }}
					<li>
						<a
							{href}
							class="block rounded-full px-4 py-2 text-sm font-medium text-indigo-900 transition duration-300 hover:bg-purple-100 hover:text-purple-600 dark:text-white dark:hover:bg-purple-900 dark:hover:text-purple-300"
							on:click={closeMenu}
						>
							{title}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</nav>
