<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import FaBook from 'svelte-icons/fa/FaBook.svelte';
	import FaCalendarAlt from 'svelte-icons/fa/FaCalendarAlt.svelte';
	import FaTasks from 'svelte-icons/fa/FaTasks.svelte';
	import FaShoppingCart from 'svelte-icons/fa/FaShoppingCart.svelte';
	import FaArrowRight from 'svelte-icons/fa/FaArrowRight.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import consumer_login from '$lib/assets/login_page.gif';
	import logo from '$lib/assets/logo.png';

	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';
	import { z } from 'zod';

	export let data: PageData;

	const userSchema = z.object({
		email: z
			.string({ required_error: 'Your Email is required' })
			.min(1, { message: 'Email is required' })
			.max(256, { message: 'Email must be less than 256 characters' })
			.email({ message: 'Email must be a valid email address' }),

		password: z
			.string({ required_error: 'Password is required' })
			.min(8, { message: 'Password must be at least 8 characters' })
			.max(32, { message: 'Password must be less than 32 characters' })
			.regex(new RegExp('.*[A-Z].*'), 'Password must contain at least one uppercase character')
			.regex(new RegExp('.*[a-z].*'), 'Password must contain at least one lowercase character')
			.regex(new RegExp('.*\\d.*'), 'Password must contain at least one number')
			.regex(
				new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
				'Password must contain at least one special character'
			)
			.trim()
	});

	const { form, errors, enhance, constraints, message } = superForm(data.form, {
		validators: userSchema
	});

	let isLoading = false;

	async function onSubmit() {
		isLoading = true;
		setTimeout(() => {
			isLoading = false;
		}, 5000);
	}
</script>

<div class="flex flex-col min-h-screen">
    <Navbar />
    <section class="flex-1 flex items-center justify-center bg-gradient-to-b from-purple-100 to-indigo-200 dark:from-gray-900 dark:to-indigo-900">
        <div class="w-[90%] max-w-4xl my-8 bg-white bg-opacity-95 rounded-lg shadow-2xl overflow-hidden">
            <div class="grid md:grid-cols-5">
                <div class="bg-[#001936] md:col-span-2 flex flex-col items-center justify-center p-8">
                    <img src={consumer_login} alt="Consumer Login" class="w-[180px] md:w-[250px] mb-6 animate-float" />
                    <a href="/" class="flex items-center justify-center text-2xl font-bold text-white">
                        Insight<span class="text-purple-400">AI</span>
                    </a>
                </div>
                <div class="md:col-span-3 flex items-center justify-center p-8">
                    <div class="w-full max-w-md">
                        <h2 class="text-3xl font-bold mb-6 text-indigo-900">Welcome Back</h2>
                        <form
                            use:enhance
                            action="?/login"
                            method="post"
                            class="space-y-6"
                            on:submit={onSubmit}
                        >
                            {#if $message}
                                <div class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {$message}
                                </div>
                            {/if}

                            <div class="space-y-2">
                                <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
                                <div class="relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        bind:value={$form.email}
                                        class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                                {#if $errors.email}
                                    <p class="text-red-500 text-xs italic">{$errors.email[0]}</p>
                                {/if}
                            </div>

                            <div class="space-y-2">
                                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                                <div class="relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                                    </svg>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        bind:value={$form.password}
                                        class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                {#if $errors.password}
                                    <p class="text-red-500 text-xs italic">{$errors.password[0]}</p>
                                {/if}
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    class="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                                    disabled={isLoading}
                                >
                                    {#if isLoading}
                                        <svg class="animate-spin mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    {/if}
                                    Sign In
                                </button>
                            </div>
                        </form>

                        <p class="mt-6 text-center text-sm text-gray-600">
                            Don't have an account?
                            <a href="/signup" class="font-medium text-indigo-600 hover:text-indigo-500">
                                Sign up now
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>

<style>
    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
    }

    .animate-float {
        animation: float 3s ease-in-out infinite;
    }
</style>