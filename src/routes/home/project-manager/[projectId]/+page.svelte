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
	import FaUndo from 'svelte-icons/fa/FaUndo.svelte';
	import FaMagic from 'svelte-icons/fa/FaMagic.svelte';
	import FaGlobe from 'svelte-icons/fa/FaGlobe.svelte';
	import FaArrowRight from 'svelte-icons/fa/FaArrowRight.svelte';
	import FaBrain from 'svelte-icons/fa/FaBrain.svelte';
	import FaSpinner from 'svelte-icons/fa/FaSpinner.svelte';
	import FaEdit from 'svelte-icons/fa/FaEdit.svelte';
	import FaTrash from 'svelte-icons/fa/FaTrash.svelte';
	import apiService from '$lib/apiService.ts';
	import { slide } from 'svelte/transition';
	import FaChevronDown from 'svelte-icons/fa/FaChevronDown.svelte';
	import FaChevronUp from 'svelte-icons/fa/FaChevronUp.svelte';
	import {marked} from 'marked'

	export let data;
	let project = null;
	let isFetchingData = true;
	let breadcrumbItems = [];
	let showAddTaskModal = false;
	let newTask = { name: '', deadline: '', status: 'Pending', description: '' };
	let taskFilter = 'pending';
	let filteredTasks = [];

	let isCreatingTask = false;
	let isUpdatingTask = false;
	let updatingTaskId = null;

	onMount(async () => {
		data.projectData.then((res) => {
			// console.log(res);

			project = res;

			if (res.tasks) {
				sortTasks();
			}
			breadcrumbItems = [
				{ name: 'Home', href: '../' },
				{ name: 'Project Manager', href: './' },
				{ name: project.name, href: '' }
			];
			isFetchingData = false;
		});
	});

	onMount(() => {
		toast.pop(0);
	});

	onDestroy(() => {
		toast.pop(0);
	});

	function sortTasks() {
		project.tasks.sort((a, b) => {
			// Check if either deadline is empty
			if (!a.deadline && !b.deadline) {
				return 0; // Both are empty, maintain their relative order
			}
			if (!a.deadline) {
				return 1; // Move task 'a' to the end
			}
			if (!b.deadline) {
				return -1; // Move task 'b' to the end
			}
			// If neither is empty, sort by deadline
			return a.deadline - b.deadline;
		});
	}

	function openAddTaskModal() {
		showAddTaskModal = true;
	}

	function closeAddTaskModal() {
		showAddTaskModal = false;
		newTask = { name: '', deadline: '', status: 'Pending', description: '' };
	}

	async function addTask() {
		isCreatingTask = true;

		let newTaskList = null;

		const taskToAdd = {
			...newTask,
			id: Date.now()
		};

		if (project.tasks) {
			newTaskList = [...project.tasks, taskToAdd];
		} else {
			newTaskList = [taskToAdd];
		}

		try {
			const response = await apiService.put(`projects/${project.id}/tasks`, {
				tasks: JSON.stringify(newTaskList)
			});
			project.tasks = newTaskList;

			toast.push('New task added successfully!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch {
			toast.push('Failed to create task. Please try again.', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(187,72,120,0.9)',
					'--toastBarBackground': '#880808'
				}
			});
		} finally {
			sortTasks();
			closeAddTaskModal();
			isCreatingTask = false;
		}
	}

	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	}

	async function toggleTaskStatus(task) {
		updatingTaskId = task.id;
		task.status = task.status === 'Pending' ? 'Completed' : 'Pending';

		try {
			const response = await apiService.put(`projects/${project.id}/tasks`, {
				tasks: JSON.stringify(project.tasks)
			});
			project.tasks = [...project.tasks];
		} catch (error) {
			console.error('Error updating task status:', error);
			// Revert the status change if the API call fails
			task.status = task.status === 'Pending' ? 'Completed' : 'Pending';
		} finally {
			updatingTaskId = null;
		}
	}

	$: if (project && project.tasks) {
		filteredTasks = project?.tasks.filter((task) => {
			if (taskFilter === 'all') return true;
			return task.status.toLowerCase() === taskFilter;
		});
	}

	let isGeneratingTasks = false;

	async function generateTasksWithAI() {
		isGeneratingTasks = true;
		try {
			console.log('Browsing the internet and generating tasks with AI...');
			const response = await apiService.postPython('task-planner', {
				title: project.name,
				description: project.description
			});

			console.log(response);
			const timeStamp = Date.now();

			const formattedTasks = response['tasks'].map((subtask, index) => ({
				id: timeStamp + index,
				name: subtask.subtask_name,
				description: subtask.subtask_description,
				status: 'Pending',
				deadline: ''
			}));

			const ret = await apiService.put(`projects/${project.id}/tasks`, {
				tasks: JSON.stringify(formattedTasks),
				searchResults: JSON.stringify(response['search_results'])
			});

			console.log({
				tasks: JSON.stringify(formattedTasks),
				searchResults: JSON.stringify(response['search_results'])
			});

			project.tasks = formattedTasks;
			project.searchResults = response['search_results'];
			project = project;

			toast.push('Tasks generated successfully!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch (error) {
			console.error('Error generating tasks:', error);
			toast.push('Failed to generate task. Please try again.', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(187,72,120,0.9)',
					'--toastBarBackground': '#880808'
				}
			});
		} finally {
			isGeneratingTasks = false;
		}
	}

	let showEditTaskModal = false;
	let editingTask = null;

	function openEditTaskModal(task) {
		editingTask = { ...task };
		showEditTaskModal = true;
	}

	function closeEditTaskModal() {
		showEditTaskModal = false;
		editingTask = null;
	}

	async function updateTask() {
		isUpdatingTask = true;
		const index = project.tasks.findIndex((t) => t.id === editingTask.id);

		project.tasks[index] = { ...editingTask };
		let newTaskList = [...project.tasks];

		try {
			const response = await apiService.put(`projects/${project.id}/tasks`, {
				tasks: JSON.stringify(newTaskList)
			});
			project.tasks = newTaskList;

			toast.push('Task updated successfully!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch {
			toast.push('Failed to update task. Please try again.', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(187,72,120,0.9)',
					'--toastBarBackground': '#880808'
				}
			});
		} finally {
			sortTasks();
			closeEditTaskModal();
			isUpdatingTask = false;
		}
	}

	async function deleteTask(taskId) {
		let newTaskList = project.tasks.filter((t) => t.id !== taskId);

		try {
			const response = await apiService.put(`projects/${project.id}/tasks`, {
				tasks: JSON.stringify(newTaskList)
			});
			project.tasks = newTaskList;

			toast.push('Task deleted successfully!', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(72,187,120,0.9)',
					'--toastBarBackground': '#2F855A'
				}
			});
		} catch {
			toast.push('Failed to delete task. Please try again.', {
				theme: {
					'--toastColor': 'mintcream',
					'--toastBackground': 'rgba(187,72,120,0.9)',
					'--toastBarBackground': '#880808'
				}
			});
		}
	}

	let isSearchResultsOpen = false;

	function toggleSearchResults() {
		isSearchResultsOpen = !isSearchResultsOpen;
	}
</script>

<SvelteToast />
<div class="font-poppins container mx-auto px-4 py-12">
	{#if isFetchingData}
		<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
			<div
				class="spinner h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
			></div>
		</div>
	{:else}
		<BreadCrumb items={breadcrumbItems} />
		<div class="mt-8">
			<div class="mb-6 flex items-center justify-between">
				<h1 class="text-3xl font-bold text-gray-900">{project.name}</h1>
				<button
					on:click={openAddTaskModal}
					class="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors duration-300 hover:bg-indigo-700"
				>
					<span class="mr-2 h-5 w-5"><FaPlus /></span>
					Add Task
				</button>
			</div>
			<p class="mb-6 text-gray-600">{project.description}</p>
			<div class="mb-8 flex flex-wrap gap-2">
				{#if project.tags}
					{#each project.tags as tag}
						<span
							class="rounded-full border border-gray-400 bg-white px-3 py-1 text-sm text-gray-800"
						>
							{tag}
						</span>
					{/each}
				{:else}
					<div class="mt-4">
						<p class="text-sm text-gray-500">No Tags</p>
					</div>
				{/if}
			</div>

			<!-- Display search results -->
			{#if project.searchResults && project.searchResults.length > 0}
				<div class="mb-8">
					<button
						on:click={toggleSearchResults}
						class="flex w-full items-center justify-between rounded-lg bg-white p-4 shadow-md transition-colors duration-200 hover:bg-gray-50"
					>
						<span class="text-lg font-semibold">Sources Used for Task Generation</span>
						<div class="h-5 w-5 text-gray-500">
							{#if isSearchResultsOpen}
								<FaChevronUp />
							{:else}
								<FaChevronDown />
							{/if}
						</div>
					</button>
					{#if isSearchResultsOpen}
						<div
							transition:slide={{ duration: 300 }}
							class="mt-2 rounded-lg bg-white p-4 shadow-md"
						>
							<ul class="list-inside list-disc space-y-2">
								{#each project.searchResults as result}
									<li>
										<a
											href={result.link}
											target="_blank"
											rel="noopener noreferrer"
											class="text-blue-600 hover:underline"
										>
											{result.title}
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			{/if}

			<div class="mb-4">
				<div class="flex space-x-2">
					<button
						class={`rounded-lg px-4 py-2 ${taskFilter === 'pending' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800'}`}
						on:click={() => (taskFilter = 'pending')}
					>
						Pending Tasks
					</button>
					<button
						class={`rounded-lg px-4 py-2 ${taskFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800'}`}
						on:click={() => (taskFilter = 'all')}
					>
						All Tasks
					</button>
					<button
						class={`rounded-lg px-4 py-2 ${taskFilter === 'completed' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800'}`}
						on:click={() => (taskFilter = 'completed')}
					>
						Completed Tasks
					</button>
				</div>
			</div>
			<h2 class="mb-4 text-2xl font-semibold">Tasks</h2>
			<div class="overflow-hidden rounded-lg bg-white shadow-md">
				{#if project.tasks && project.tasks.length > 0}
					{#each filteredTasks as task, index (task.id)}
						<div class="p-4 {index !== 0 ? 'border-t border-gray-200' : ''}">
							<div class="mb-2 flex items-center justify-between">
								<div class="flex items-center">
									{#if updatingTaskId === task.id}
										<div class="mr-4 h-5 w-5 animate-spin text-indigo-600">
											<FaSpinner />
										</div>
									{:else if task.status === 'Pending'}
										<input
											type="checkbox"
											class="mr-4 h-5 w-5 text-indigo-600"
											on:click|stopPropagation={() => toggleTaskStatus(task)}
										/>
									{:else}
										<button
											on:click|stopPropagation={() => toggleTaskStatus(task)}
											class="mr-4 text-gray-500 hover:text-indigo-600"
										>
											<div class="h-5 w-5"><FaUndo /></div>
										</button>
									{/if}
									<div>
										<h3
											class="text-lg font-semibold {task.status === 'Completed'
												? 'text-gray-500 line-through'
												: ''}"
										>
											{task.name}
										</h3>
										{#if task.deadline}
											{#if task.deadline.length > 0}
												<p class="text-sm text-gray-500">Deadline: {formatDate(task.deadline)}</p>
											{:else}
												<p class="text-sm text-gray-500">Deadline not set</p>
											{/if}
										{:else}
											<p class="text-sm text-gray-500">Deadline not set</p>
										{/if}
									</div>
								</div>
								<div class="flex items-center">
									<button
										on:click={() => openEditTaskModal(task)}
										class="mr-2 text-gray-500 hover:text-indigo-600"
									>
										<div class="h-5 w-5"><FaEdit /></div>
									</button>
									<button
										on:click={() => deleteTask(task.id)}
										class="text-gray-500 hover:text-red-600"
									>
										<div class="h-5 w-5"><FaTrash /></div>
									</button>
								</div>
							</div>
							{#if task.description}
								<p class="prose mb-2 text-gray-600 {task.status === 'Completed' ? 'line-through' : ''}">
									{@html marked(task.description)}
								</p>
							{:else}
								<p class="mb-2 text-gray-400 {task.status === 'Completed' ? 'line-through' : ''}">
									Description not set
								</p>
							{/if}
						</div>
					{/each}
				{:else}
					<div class="flex flex-col items-center justify-center p-8 text-center">
						<p class="mb-4 text-lg text-gray-600">No tasks created yet.</p>
						<p class="mb-4 text-sm text-gray-500">
							Click below to automatically generate tasks to reach your goal. Our AI will browse the
							internet for relevant information and create tasks based on the project description.
						</p>
						<button
							on:click={generateTasksWithAI}
							class=" flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors duration-300 hover:bg-indigo-700 disabled:opacity-50"
							disabled={isGeneratingTasks}
						>
							{#if isGeneratingTasks}
								<span class="mr-2 h-5 w-5 animate-spin"><FaSpinner /></span>
								Generating...
							{:else}
								<span class="mr-2 h-5 w-5"><FaGlobe /></span>
								<span class="mr-2 h-5 w-5"><FaArrowRight /></span>
								<span class="mr-2 h-5 w-5"><FaBrain /></span>
								Generate Tasks
							{/if}
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

{#if showAddTaskModal}
	<div
		class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
		transition:fade
	>
		<div class="w-full max-w-md rounded-lg bg-white p-8">
			<h2 class="mb-6 text-2xl font-bold">Add New Task</h2>
			<form on:submit|preventDefault={addTask}>
				<div class="mb-4">
					<label for="taskName" class="mb-2 block font-bold text-gray-700">Task Name</label>
					<input
						type="text"
						id="taskName"
						bind:value={newTask.name}
						class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						required
					/>
				</div>
				<div class="mb-4">
					<label for="taskDeadline" class="mb-2 block font-bold text-gray-700">Deadline</label>
					<input
						type="datetime-local"
						id="taskDeadline"
						bind:value={newTask.deadline}
						class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
				</div>
				<div class="mb-6">
					<label for="taskDescription" class="mb-2 block font-bold text-gray-700">Description</label
					>
					<textarea
						id="taskDescription"
						bind:value={newTask.description}
						class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						rows="3"
					></textarea>
				</div>
				<div class="flex justify-end space-x-4">
					<button
						type="button"
						on:click={closeAddTaskModal}
						class="rounded-lg bg-gray-300 px-4 py-2 text-gray-700 transition-colors duration-300 hover:bg-gray-400"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors duration-300 hover:bg-indigo-700 disabled:opacity-50"
						disabled={isCreatingTask}
					>
						{#if isCreatingTask}
							<span
								class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
								style="animation: spin 1s linear infinite;"
							></span>
						{/if}
						Add Task
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if showEditTaskModal}
	<div
		class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
		transition:fade
	>
		<div class="w-full max-w-md rounded-lg bg-white p-8">
			<h2 class="mb-6 text-2xl font-bold">Edit Task</h2>
			<form on:submit|preventDefault={updateTask}>
				<div class="mb-4">
					<label for="editTaskName" class="mb-2 block font-bold text-gray-700">Task Name</label>
					<input
						type="text"
						id="editTaskName"
						bind:value={editingTask.name}
						class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						required
					/>
				</div>
				<div class="mb-4">
					<label for="editTaskDeadline" class="mb-2 block font-bold text-gray-700">Deadline</label>
					<input
						type="datetime-local"
						id="editTaskDeadline"
						bind:value={editingTask.deadline}
						class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
				</div>
				<div class="mb-6">
					<label for="editTaskDescription" class="mb-2 block font-bold text-gray-700"
						>Description</label
					>
					<textarea
						id="editTaskDescription"
						bind:value={editingTask.description}
						class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						rows="3"
					></textarea>
				</div>
				<div class="flex justify-end space-x-4">
					<button
						type="button"
						on:click={closeEditTaskModal}
						class="rounded-lg bg-gray-300 px-4 py-2 text-gray-700 transition-colors duration-300 hover:bg-gray-400"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors duration-300 hover:bg-indigo-700 disabled:opacity-50"
						disabled={isUpdatingTask}
					>
						{#if isUpdatingTask}
							<span
								class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
								style="animation: spin 1s linear infinite;"
							></span>
						{/if}
						Update Task
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
