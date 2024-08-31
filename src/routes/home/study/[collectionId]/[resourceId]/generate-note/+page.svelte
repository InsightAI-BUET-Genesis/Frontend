<script>
	// @ts-nocheck
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import FaPlus from 'svelte-icons/fa/FaPlus.svelte';
	import FaBook from 'svelte-icons/fa/FaBook.svelte';
	import apiService from '$lib/apiService.ts';

	export let data;

	let resource = null;
	let notes = null;
	let collection = null;

	let showCreateModal = false;
	let showUpdateModal = false;
	let newNote = { title: '', topic: 'All', knowledgeLevel: 'medium' };
	let showNoteMenu = null;
	let editingNote = null;

	let isCreatingNote = false;
	let isUpdatingNote = false;

	let breadcrumbItems = [];

	onMount(async () => {
		data.resourceData.then((res) => {
			resource = res;
			breadcrumbItems = [
				{ name: 'Home', href: '../../../' },
				{ name: 'Study', href: '../../' },
				{ name: resource.collectionName, href: '../' },
				{ name: resource.name, href: './' },
				{ name: 'Notes', href: '' }
			];
		});

		data.noteList.then((res) => {
			notes = res;
		});

		data.collectionData.then((res) => {
			collection = res;
		});
	});

	onMount(() => {
		toast.pop(0);
	});

	onDestroy(() => {
		toast.pop(0);
	});

	function openCreateModal() {
		showCreateModal = true;
	}

	function openUpdateModal(note) {
		editingNote = { ...note };
		showUpdateModal = true;
	}

	function closeModals() {
		showCreateModal = false;
		showUpdateModal = false;
		newNote = { title: '', topic: 'All', knowledgeLevel: 'medium' };
		editingNote = null;
	}

	async function createNote() {
		isCreatingNote = true;
		let payload = {
			topic_name: newNote.topic,
			knowledge_level: newNote.knowledgeLevel,
			collection_id: collection.id,
			collection_name: collection.originalName,
			file_id: resource.id
		};

		let payload2 = {
			title: newNote.title,
			topic: newNote.topic,
			knowledgeLevel: newNote.knowledgeLevel,
			resourceId: resource.id
		};

		// console.log(payload);
		try {
			const response = await apiService.postPython('note_take', payload);

			let payload2 = {
				title: newNote.title,
				topic: newNote.topic,
				knowledgeLevel: newNote.knowledgeLevel,
				resourceId: resource.id,
				note: JSON.stringify(response)
			};

			// console.log(payload2)

			const response2 = await apiService.post('notes/create',payload2);
			notes = [...notes, response2];

			toast.push('New note created successfully!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch {
			toast.push('Failed to create note. Please try again.', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(187,72,120,0.9)',
					'--toastBarBackground': '#880808'
				}
			});
		} finally {
			closeModals();
			isCreatingNote = false;
		}
	}

	async function updateNote() {
		isUpdatingNote = true;
		try {
			const response = await apiService.put(`notes/${editingNote.id}`, {
				title: editingNote.title
			});

			notes = notes.map((n) => (n.id === editingNote.id ? response : n));

			toast.push('Note updated successfully!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch {
			toast.push('Failed to update note. Please try again.', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(187,72,120,0.9)',
					'--toastBarBackground': '#880808'
				}
			});
		} finally {
			closeModals();
			isUpdatingNote = false;
		}
	}

	async function deleteNote(noteId) {
		showNoteMenu = null;
		try {
			await apiService.del(`notes/${noteId}`);
			notes = notes.filter((n) => n.id !== noteId);
			toast.push('Note deleted successfully!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch {
			toast.push('Failed to delete note. Please try again.', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(187,72,120,0.9)',
					'--toastBarBackground': '#880808'
				}
			});
		}
	}

	function clickOutside(node) {
		const handleClick = (event) => {
			if (!node.contains(event.target)) {
				showNoteMenu = null;
			}
		};

		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}
</script>

<SvelteToast />
<div class="font-poppins container mx-auto px-4 py-12">
	{#if !resource || !notes || !collection}
		<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
			<div
				class="spinner h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
			></div>
		</div>
	{:else}
		<BreadCrumb items={breadcrumbItems} />
		<div class="mx-auto max-w-7xl">
			<div class="mb-10 flex flex-col items-center justify-between sm:flex-row">
				<div class="flex flex-col items-center sm:items-start">
					<h1 class="mb-4 text-4xl font-extrabold text-indigo-900 sm:mb-2 dark:text-indigo-200">
						Notes for {resource.name}
					</h1>
				</div>
				<button
					on:click={openCreateModal}
					class="mt-4 flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0"
				>
					<span class="mr-2 h-5 w-5"><FaPlus /></span>
					New Note
				</button>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each notes as note}
					<div
						class="max-w-sm cursor-pointer rounded-lg bg-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl"
						on:click={()=>goto(`./generate-note/${note.id}`)}
					>
						<div class="relative p-6">
							<div class="absolute right-4 top-4">
								<button
									on:click|stopPropagation={() => (showNoteMenu = note.id)}
									class="text-gray-400 hover:text-gray-600 focus:outline-none"
								>
									<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
										<path
											d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
										/>
									</svg>
								</button>

								{#if showNoteMenu === note.id}
									<div
										class="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-700"
										on:click|stopPropagation={() => (showNoteMenu = null)}
										use:clickOutside
									>
										<button
											on:click={() => openUpdateModal(note)}
											class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
										>
											Edit
										</button>
										<button
											on:click|stopPropagation={() => deleteNote(note.id)}
											class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
										>
											Delete
										</button>
									</div>
								{/if}
							</div>

							<div class="mb-4 flex items-center">
								<span
									class="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600"
								>
									<div class="h-8 w-8">
										<FaBook />
									</div>
								</span>
								<div>
									<h3 class="text-xl font-bold text-gray-800 dark:text-white">
										{note.title}
									</h3>
									<p class="text-sm text-gray-600 dark:text-gray-400">
										Topic: {note.topic}
									</p>
								</div>
							</div>

							<div class="flex items-center justify-between">
								<span
									class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
								>
									Knowledge Level: {note.knowledgeLevel}
								</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Update Create Note Modal -->
{#if showCreateModal}
	<div
		class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
		transition:fade
	>
		<div class="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
			<h2 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Create New Note</h2>
			<form on:submit|preventDefault={createNote}>
				<div class="mb-6">
					<label
						for="noteTitle"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Note Title
					</label>
					<input
						type="text"
						id="noteTitle"
						bind:value={newNote.title}
						class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						required
					/>
				</div>
				<div class="mb-6">
					<label
						for="noteTopic"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Topic
					</label>
					<input
						type="text"
						id="noteTopic"
						bind:value={newNote.topic}
						class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						required
					/>
				</div>
				<div class="mb-6">
					<label
						for="knowledgeLevel"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Knowledge Level
					</label>
					<select
						required
						id="knowledgeLevel"
						bind:value={newNote.knowledgeLevel}
						class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						<option value="easy">Easy</option>
						<option value="medium">Medium</option>
						<option value="hard">Hard</option>
					</select>
				</div>
				<div class="flex justify-end space-x-4">
					<button
						type="button"
						on:click={closeModals}
						class="rounded-lg bg-gray-300 px-6 py-3 text-gray-700 transition-colors duration-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
						disabled={isCreatingNote}
					>
						{#if isCreatingNote}
							<span
								class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
								style="animation: spin 1s linear infinite;"
							></span>
						{/if}
						Create
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Update Note Modal -->
{#if showUpdateModal}
	<div
		class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
		transition:fade
	>
		<div class="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
			<h2 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Update Note</h2>
			<form on:submit|preventDefault={updateNote}>
				<div class="mb-6">
					<label
						for="editNoteTitle"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Note Title
					</label>
					<input
						type="text"
						id="editNoteTitle"
						bind:value={editingNote.title}
						class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						required
					/>
				</div>
				<div class="flex justify-end space-x-4">
					<button
						type="button"
						on:click={closeModals}
						class="rounded-lg bg-gray-300 px-6 py-3 text-gray-700 transition-colors duration-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
						disabled={isUpdatingNote}
					>
						{#if isUpdatingNote}
							<span
								class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
								style="animation: spin 1s linear infinite;"
							></span>
						{/if}
						Update
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
