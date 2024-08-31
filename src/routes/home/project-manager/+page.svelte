<script>
	// @ts-nocheck
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import FaPlus from 'svelte-icons/fa/FaPlus.svelte';
	import FaSearch from 'svelte-icons/fa/FaSearch.svelte';
	import FaTasks from 'svelte-icons/fa/FaTasks.svelte';
	import apiService from '$lib/apiService.ts';

	export let data;
	let projects = null;
	let searchQuery = '';
	let showCreateModal = false;
	let showUpdateModal = false;
	let newProject = { name: '', description: '', tags: '' };
	let showProjectMenu = null;
	let editingProject = null;

	let isCreatingProject = false;
	let isUpdatingProject = false;

	let breadcrumbItems = [
		{ name: 'Home', href: './' },
		{ name: 'Project Manager', href: '' }
	];

	onMount(async () => {
		data.projectList.then((res) => {
			projects = res;
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

	function openUpdateModal(project) {
		editingProject = { ...project };
		showUpdateModal = true;
	}

	function closeModals() {
		showCreateModal = false;
		showUpdateModal = false;
		newProject = { name: '', description: '', tags: '' };
		editingProject = null;
	}

	async function createProject() {
		isCreatingProject = true;

		try {
			const response = await apiService.post('projects/create', {
				name: newProject.name,
				description: newProject.description,
				tags: newProject.tags,
				userId: data.userInfo.userId
			});

			console.log(response);

			if (response.tags) {
				response.tags = response.tags
					.split(',')
					.map((tag) => tag.trim())
					.filter((tag) => tag !== '');
			}

			projects = [...projects, response];

			toast.push('New project created successfully!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch {
			toast.push('Failed to create project. Please try again.', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(187,72,120,0.9)',
					'--toastBarBackground': '#880808'
				}
			});
		} finally {
			closeModals();
			isCreatingProject = false;
		}
	}

	async function updateProject() {
		isUpdatingProject = true;
		try {
			// console.log(editingProject.tags)
			const response = await apiService.put(`projects/${editingProject.id}`, {
				name: editingProject.name,
				description: editingProject.description,
				tags: editingProject.tags.join(',')
			});

			if (response.tags) {
				response.tags = response.tags
					.split(',')
					.map((tag) => tag.trim())
					.filter((tag) => tag !== '');
			}

			projects = projects.map((p) => (p.id === editingProject.id ? response : p));

			toast.push('Project updated successfully!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch {
			toast.push('Failed to update project. Please try again.', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(187,72,120,0.9)',
					'--toastBarBackground': '#880808'
				}
			});
		} finally {
			closeModals();
			isUpdatingProject = false;
		}
	}

	async function deleteProject(projectId) {
		showProjectMenu = null;
		try {
			const response = await apiService.del(`projects/${projectId}`);
			projects = projects.filter((p) => p.id !== projectId);
			toast.push('Project deleted successfully!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch {
			toast.push('Failed to delete project. Please try again.', {
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
				showProjectMenu = null;
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
	{#if !projects}
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
						Project Manager
					</h1>
				</div>
				<button
					on:click={openCreateModal}
					class="mt-4 flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0"
				>
					<span class="mr-2 h-5 w-5"><FaPlus /></span>
					New Project
				</button>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each projects as project}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="max-w-sm cursor-pointer rounded-lg bg-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl"
						on:click={() => goto(`./project-manager/${project.id}`)}
					>
						<div class="relative p-6">
							<div class="absolute right-4 top-4">
								<button
									on:click|stopPropagation={() => (showProjectMenu = project.id)}
									class="text-gray-400 hover:text-gray-600 focus:outline-none"
								>
									<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
										<path
											d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
										/>
									</svg>
								</button>

								{#if showProjectMenu === project.id}
									<!-- svelte-ignore a11y-no-static-element-interactions -->
									<div
										class="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-700"
										on:click|stopPropagation={() => (showProjectMenu = null)}
										use:clickOutside
									>
										<button
											on:click={() => openUpdateModal(project)}
											class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
										>
											Edit
										</button>
										<button
											on:click|stopPropagation={() => deleteProject(project.id)}
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
										<FaTasks />
									</div>
								</span>
								<h3 class="text-xl font-bold text-gray-800 dark:text-white">
									{project.name}
								</h3> 
							</div>

							<!-- <p class="mb-6 text-gray-600 dark:text-gray-300">{project.description}</p> -->

							<div class="flex items-center justify-between">
								<span
									class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
								>
									<svg class="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
										<path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
										<path
											fill-rule="evenodd"
											d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
											clip-rule="evenodd"
										/>
									</svg>
									{project.tasks ? JSON.parse(project.tasks).length : 0} Tasks
								</span>
							</div>

							<div class="mt-4 flex flex-wrap gap-2">
								{#each project.tags as tag}
									<span
										class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
									>
										{tag}
									</span>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Create Project Modal -->
{#if showCreateModal}
	<div
		class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
		transition:fade
	>
		<div class="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
			<h2 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Create New Project</h2>
			<form on:submit|preventDefault={createProject}>
				<div class="mb-6">
					<label
						for="projectName"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Project Name
					</label>
					<input
						type="text"
						id="projectName"
						bind:value={newProject.name}
						class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						required
					/>
				</div>
				<div class="mb-6">
					<label
						for="projectDescription"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Project Description
					</label>
					<textarea
						id="projectDescription"
						bind:value={newProject.description}
						class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						rows="3"
						required
					></textarea>
				</div>
				<div class="mb-6">
					<label
						for="projectTags"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Tags (comma-separated)
					</label>
					<input
						type="text"
						id="projectTags"
						bind:value={newProject.tags}
						placeholder="e.g. web, design, marketing"
						class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
						disabled={isCreatingProject}
					>
						{#if isCreatingProject}
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

<!-- Update Project Modal -->
{#if showUpdateModal}
	<div
		class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
		transition:fade
	>
		<div class="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
			<h2 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Update Project</h2>
			<form on:submit|preventDefault={updateProject}>
				<div class="mb-6">
					<label
						for="editProjectName"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Project Name
					</label>
					<input
						type="text"
						id="editProjectName"
						bind:value={editingProject.name}
						class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						required
					/>
				</div>
				<div class="mb-6">
					<label
						for="editProjectDescription"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Project Description
					</label>
					<textarea
						id="editProjectDescription"
						bind:value={editingProject.description}
						class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						rows="3"
						required
					></textarea>
				</div>
				<div class="mb-6">
					<label
						for="editProjectTags"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Tags (comma-separated)
					</label>
					<input
						type="text"
						id="editProjectTags"
						bind:value={editingProject.tags}
						placeholder="e.g. web, design, marketing"
						class="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
						disabled={isUpdatingProject}
					>
						{#if isUpdatingProject}
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
