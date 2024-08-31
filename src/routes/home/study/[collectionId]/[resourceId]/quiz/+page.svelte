<!-- src/routes/study/[collectionId]/[studyId]/[resourceId]/quizzes/+page.svelte -->
<script>
	// @ts-nocheck
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import FaPlus from 'svelte-icons/fa/FaPlus.svelte';
	import FaEllipsisV from 'svelte-icons/fa/FaEllipsisV.svelte';
	import FaClipboard from 'svelte-icons/fa/FaClipboard.svelte';
	import FaClipboardList from 'svelte-icons/fa/FaClipboardList.svelte';
	import FaCalendarAlt from 'svelte-icons/fa/FaCalendarAlt.svelte';
	import FaListUl from 'svelte-icons/fa/FaListUl.svelte';
	import FaQuestionCircle from 'svelte-icons/fa/FaQuestionCircle.svelte';
	import FaRegClone from 'svelte-icons/fa/FaRegClone.svelte';
	import FaLayerGroup from 'svelte-icons/fa/FaLayerGroup.svelte';
	import { fade } from 'svelte/transition';
	import apiService from '$lib/apiService.ts';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';

	export let data;
	let breadcrumbItems = [];
	let resource = null;
	let questionSets = null;
	let editModalOpen = false;
	let deleteModalOpen = false;
	let currentEditSet = null;
	let currentDeleteSet = null;
	let editLoading = false;
	let deleteLoading = false;
	let showQuizMenu = null;

	onMount(async () => {
		data.resourceData.then((res) => {
			resource = res;
			breadcrumbItems = [
				{ name: 'Home', href: '../../../' },
				{ name: 'Study', href: '../../' },
				{ name: resource.collectionName, href: '../' },
				{ name: resource.name, href: './' },
				{ name: 'Quiz', href: '' }
			];
		});
		data.questionSets.then((res) => {
			if (res) {
				questionSets = res;
			} else {
				questionSets = [];
			}
			// console.log(questionSets)
		});
	});

	function showToast(message, success = true) {
		toast.push(message, {
			theme: {
				'--toastColor': 'mintcream',
				'--toastBackground': success ? 'rgba(72,187,120,0.9)' : 'rgba(187,72,120,0.9)',
				'--toastBarBackground': success ? '#2F855A' : '#880808'
			}
		});
	}

	function openEditModal(set, event) {
		event.stopPropagation();
		currentEditSet = { ...set };
		editModalOpen = true;
	}

	function openDeleteModal(set, event) {
		event.stopPropagation();
		currentDeleteSet = set;
		deleteModalOpen = true;
	}

	async function handleEdit() {
		editLoading = true;
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Update the questionSets array
		questionSets = questionSets.map((set) =>
			set.id === currentEditSet.id ? { ...set, title: currentEditSet.title } : set
		);

		editLoading = false;
		editModalOpen = false;
		showToast('Quiz edited successfully');
	}

	async function handleDelete() {
		deleteLoading = true;
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		questionSets = questionSets.filter((set) => set.id !== currentDeleteSet.id);

		deleteLoading = false;
		deleteModalOpen = false;
		showToast('Quiz deleted successfully');
	}

	function startQuiz(set) {
		if (set.type === 'mcq') {
			goto(`./quiz/mcq/${set.id}`);
		} else {
			goto(`./quiz/qa/${set.id}`);
		}
	}

	// Custom action to detect click outside the element
	function clickOutside(node) {
		const handleClick = (event) => {
			if (!node.contains(event.target)) {
				showQuizMenu = null;
			}
		};

		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}

	onMount(() => {
		toast.pop(0);
	});

	onDestroy(() => {
		toast.pop(0);
	});
</script>

<SvelteToast />
<div class="font-poppins container mx-auto px-4 py-12">
	{#if !resource || !questionSets}
		<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
			<div
				class="spinner h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
			></div>
		</div>
	{:else}
		<BreadCrumb items={breadcrumbItems} />

		<div class="mb-10 flex flex-col items-center justify-between sm:flex-row">
			<h1 class="mb-4 text-4xl font-extrabold text-indigo-900 sm:mb-0 dark:text-indigo-200">
				Quizzes for {resource.name}
			</h1>

			<a
				href="./quiz/new-quiz"
				class="flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
			>
				<span class="mr-2 h-5 w-5"><FaPlus /></span>
				New Quiz
			</a>
		</div>

		{#if questionSets.length > 0}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each questionSets as set}
					<div
						class="relative flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
					>
						<div class="absolute right-3 top-3">
							<button on:click={() => (showQuizMenu = set.id)} class="focus:outline-none">
								<div class="h-5 w-5 text-gray-600 dark:text-gray-300">
									<FaEllipsisV />
								</div>
							</button>

							{#if showQuizMenu === set.id}
								<div
									class="quiz-menu absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800"
									on:click={() => (showQuizMenu = null)}
									use:clickOutside
								>
									<button
										on:click={(e) => openEditModal(set, e)}
										class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
									>
										Edit
									</button>
									<button
										on:click={(e) => openDeleteModal(set, e)}
										class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
									>
										Delete
									</button>
								</div>
							{/if}
						</div>
						<div on:click={() => startQuiz(set)} class="cursor-pointer">
							<div class="mb-4 flex items-center">
								<span
									class="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600"
								>
									<div class="h-6 w-6">
										{#if set.type === 'mcq'}
											<FaListUl />
										{:else}
											<FaRegClone />
										{/if}
									</div>
								</span>
								<h3 class="text-xl font-semibold text-gray-800 dark:text-white">
									{set.title}
								</h3>
							</div>
							<div class="mt-4 grid grid-cols-2 gap-4 text-sm">
								<div class="flex items-center">
									<div
										class="mr-2 flex h-4 w-4 items-center justify-center text-gray-500 dark:text-gray-400"
									>
										<FaClipboardList />
									</div>
									<span class="text-gray-600 dark:text-gray-300">
										{set.type === 'mcq' ? 'MCQ' : 'Flashcards'}
									</span>
								</div>
								<div class="flex items-center">
									<div
										class="mr-2 flex h-4 w-4 items-center justify-center text-gray-500 dark:text-gray-400"
									>
										<FaQuestionCircle />
									</div>
									<span class="text-gray-600 dark:text-gray-300">
										{set.questionCount} Questions
									</span>
								</div>
								<div class="flex items-center">
									<div
										class="mr-2 flex h-4 w-4 items-center justify-center text-gray-500 dark:text-gray-400"
									>
										<FaCalendarAlt />
									</div>
									<span class="text-gray-600 dark:text-gray-300">
										{new Date(set.createdAt).toLocaleDateString()}
									</span>
								</div>
								{#if set.answerType}
									<div class="flex items-center">
										<div
											class="mr-2 flex h-4 w-4 items-center justify-center text-gray-500 dark:text-gray-400"
										>
											<FaLayerGroup />
										</div>
										<span class="text-gray-600 dark:text-gray-300">
											{set.answerType}
										</span>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-center text-gray-600 dark:text-gray-400">
				No quizzes created yet. Click "New Quiz" to get started!
			</p>
		{/if}
	{/if}
</div>

{#if editModalOpen}
	<div
		class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
		transition:fade
	>
		<div class="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
			<h2 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Edit Quiz Name</h2>
			<form>
				<div class="mb-6">
					<label
						for="editQuizName"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Quiz Name
					</label>
					<input
						type="text"
						id="editQuizName"
						bind:value={currentEditSet.title}
						class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>
				<div class="flex justify-end space-x-4">
					<button
						on:click={() => (editModalOpen = false)}
						class="rounded-lg bg-gray-300 px-6 py-3 text-gray-700 transition-colors duration-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
					>
						Cancel
					</button>
					<button
						on:click={handleEdit}
						class="rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
						disabled={editLoading}
					>
						{#if editLoading}
							<div
								class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
							></div>
						{:else}
							Update
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if deleteModalOpen}
	<div
		class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
		transition:fade
	>
		<div class="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
			<h2 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Delete Quiz</h2>
			<p class="mb-6 text-gray-700 dark:text-gray-300">
				Are you sure you want to delete the quiz "{currentDeleteSet.title}"? This action cannot be
				undone.
			</p>
			<div class="flex justify-end space-x-4">
				<button
					on:click={() => (deleteModalOpen = false)}
					class="rounded-lg bg-gray-300 px-6 py-3 text-gray-700 transition-colors duration-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
				>
					Cancel
				</button>
				<button
					on:click={handleDelete}
					class="rounded-lg bg-red-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
					disabled={deleteLoading}
				>
					{#if deleteLoading}
						<div
							class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
						></div>
					{:else}
						Delete
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(svg) {
		width: 100%;
		height: 100%;
	}
	.spinner {
		border-top-color: transparent;
	}
</style>
