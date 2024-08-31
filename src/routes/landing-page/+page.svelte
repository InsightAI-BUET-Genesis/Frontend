<script>
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import FaBook from 'svelte-icons/fa/FaBook.svelte';
	import FaCalendarAlt from 'svelte-icons/fa/FaCalendarAlt.svelte';
	import FaTasks from 'svelte-icons/fa/FaTasks.svelte';
	import FaShoppingCart from 'svelte-icons/fa/FaShoppingCart.svelte';
	import FaArrowRight from 'svelte-icons/fa/FaArrowRight.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	const features = [
		{
			Icon: FaBook,
			title: "AI Study Companion",
			description: "Organize and interact with study materials using cutting-edge AI technology."
		},
		// {
		// 	Icon: FaCalendarAlt,
		// 	title: "Smart Calendar",
		// 	description: "Effortlessly manage tasks and deadlines with AI-powered scheduling."
		// },
		{
			Icon: FaTasks,
			title: "Project Manager",
			description: "Track your projects and get detailed planned steps to achieve your goals."
		},
		{
			Icon: FaShoppingCart,
			title: "Shop-Genie",
			description: "Discover unbeatable fashion deals with AI-powered shopping assistance."
		}
	];
</script>

<style>
	:global(.icon) {
		width: 100%;
		height: 100%;
	}
	
	:global(body) {
		font-family: 'Roboto', sans-serif;
	}
</style>

<div class="row">
	<Navbar />
	<section
		class="flex min-h-screen items-center justify-center bg-gradient-to-b from-purple-100 to-indigo-200 dark:from-gray-900 dark:to-indigo-900"
	>
		<div class="relative z-10 mx-auto max-w-screen-xl px-4 py-12 text-center lg:py-20">
			<h1
				class="mb-4 text-5xl font-bold leading-tight tracking-tight text-indigo-900 lg:text-6xl dark:text-white"
			>
				Revolutionize Your Studies with <span class="text-purple-600">InsightAI</span>
			</h1>
			<p
				class="mb-8 text-xl font-medium text-gray-700 sm:px-16 lg:px-48 dark:text-gray-300"
			>
				Harness the power of AI to boost productivity and achieve academic excellence.
			</p>
			<div class="flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
				<button
					on:click={() => goto('/home')}
					class="text-lg inline-flex items-center rounded-full bg-purple-600 px-8 py-3 font-semibold text-white hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 transition-all duration-300 ease-in-out"
					transition:scale
				>
					Get Started
                    <div class="ml-2 h-5">
					<FaArrowRight class="ml-2" />
                </div>
				</button>
				<button
					on:click={() => goto('#')}
					class="text-lg inline-flex items-center rounded-full border-2 border-purple-600 bg-transparent px-8 py-3 font-semibold text-purple-600 hover:bg-purple-100 focus:ring-4 focus:ring-purple-300 transition-all duration-300 ease-in-out dark:text-purple-400 dark:hover:bg-purple-900"
					transition:scale
				>
					Demo Video
				</button>
			</div>
		</div>
	</section>

	<div class="bg-white dark:bg-gray-900">
		<div
			class="mx-auto min-h-screen max-w-screen-xl items-center gap-16 px-4 py-16 lg:grid lg:grid-cols-2"
		>
			<img class="rounded-lg shadow-xl" src="https://i.postimg.cc/NFk7y8d6/1x1-Images-11.png" alt="InsightAI Dashboard" />
			<div class="mt-8 lg:mt-0">
				<h2
					class="mb-6 text-4xl font-bold text-indigo-900 lg:text-5xl dark:text-white"
				>
					Why Choose <span class="text-purple-600">InsightAI?</span>
				</h2>
				<p
					class="mb-8 text-lg font-medium text-gray-700 lg:text-xl dark:text-gray-300"
				>
					Experience a revolutionary AI-powered study companion that transforms how you learn, organize, and achieve your academic goals.
				</p>
				<div class="flex flex-wrap gap-4">
					<span
						class="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-800 dark:bg-purple-900 dark:text-purple-200"
					>
						AI-Guided Learning
					</span>
					<span
						class="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-800 dark:bg-purple-900 dark:text-purple-200"
					>
						Smart Task Management
					</span>
					<span
						class="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-800 dark:bg-purple-900 dark:text-purple-200"
					>
						Intelligent Shopping
					</span>
				</div>
			</div>
		</div>
	</div>

	<section class="bg-gradient-to-b from-indigo-50 to-white py-16 dark:from-gray-900 dark:to-indigo-900">
		<div class="mx-auto max-w-screen-xl px-4">
			<div class="mb-12 max-w-3xl mx-auto text-center">
				<h2 class="mb-6 text-4xl font-bold text-indigo-900 lg:text-5xl dark:text-white">
					Empower Your Education with AI
				</h2>
				<p class="text-xl text-gray-700 dark:text-gray-300">
					InsightAI equips students with AI-driven tools for resource organization, task management, and smart shopping.
				</p>
			</div>
			<div class="grid gap-12 md:grid-cols-3 ">
                {#each features as { Icon, title, description }}
                  <div class="text-center">
                    <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                      <div class="h-8 w-8 text-purple-600 dark:text-purple-300">
                        <Icon />
                      </div>
                    </div>
                    <h3 class="mb-4 text-2xl font-bold text-indigo-900 dark:text-white">{title}</h3>
                    <p class="text-gray-700 dark:text-gray-300">
                      {description}
                    </p>
                  </div>
                {/each}
              </div>
		</div>
	</section>

	<div class="bg-white dark:bg-gray-900">
		<div
			class="mx-auto min-h-screen max-w-screen-xl items-center gap-16 px-4 py-16 lg:grid lg:grid-cols-2"
		>
			<div class="mb-8 lg:mb-0">
				<h2 class="mb-6 text-4xl font-bold text-indigo-900 lg:text-5xl dark:text-white">
					<span class="text-purple-600">Augmented Intelligence</span> for Academic Excellence
				</h2>
				<p class="mb-8 text-lg font-medium text-gray-700 dark:text-gray-300">
					Elevate your learning experience with AI-powered resource organization, intelligent task management, and efficient shopping assistance.
				</p>
				<div class="flex flex-wrap gap-4">
					<span
						class="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-800 dark:bg-purple-900 dark:text-purple-200"
					>
						AI Study Companion
					</span>
					<span
						class="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-800 dark:bg-purple-900 dark:text-purple-200"
					>
						Note Generation
					</span>
				</div>
			</div>
			<img
				class="rounded-lg shadow-xl"
				src="https://i.postimg.cc/R016yGXW/Untitled-design-10.png"
				alt="InsightAI Features"
			/>
		</div>
	</div>

	<div class="bg-gradient-to-b from-purple-100 to-indigo-200 dark:from-gray-900 dark:to-indigo-900">
		<div
			class="mx-auto min-h-screen max-w-screen-xl items-center gap-16 px-4 py-16 lg:grid lg:grid-cols-2"
		>
			<img class="rounded-lg shadow-xl mb-8 lg:mb-0" src="https://i.postimg.cc/9F1YCpRV/1x1-Images-12.png" alt="Data-Driven Insights" />
			<div>
				<h2
					class="mb-6 text-4xl font-bold text-indigo-900 lg:text-5xl dark:text-white"
				>
					Unlock Your Potential with <span class="text-purple-600">Data-Driven</span> Insights
				</h2>
				<p
					class="mb-8 text-lg font-medium text-gray-700 dark:text-gray-300"
				>
					Leverage advanced analytics to gain deep insights into your academic performance and continuously refine your study strategies.
				</p>
				<div class="flex flex-wrap gap-4">
					<span
						class="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-800 dark:bg-purple-900 dark:text-purple-200"
					>
						Performance Analytics
					</span>
					<span
						class="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-800 dark:bg-purple-900 dark:text-purple-200"
					>
						Personalized Insights
					</span>
				</div>
			</div>
		</div>
	</div>

	<Footer />
</div>