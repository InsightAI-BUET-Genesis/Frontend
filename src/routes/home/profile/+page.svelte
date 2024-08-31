<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
	import FaEnvelope from 'svelte-icons/fa/FaEnvelope.svelte';
	import FaUniversity from 'svelte-icons/fa/FaUniversity.svelte';
	import FaGraduationCap from 'svelte-icons/fa/FaGraduationCap.svelte';
	import FaBook from 'svelte-icons/fa/FaBook.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types.js';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import type { PageServerData } from './$types.js';

	export let data: PageServerData;
	export let form: ActionData;

	let userInfo: any = null;
	let isEditing = false;
	let formData: any = null;
	let selectedFile: File | null = null;
	let previewImageUrl: string | null = null;

	// Handle file selection for profile picture
	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			selectedFile = target.files[0];
			previewImageUrl = URL.createObjectURL(selectedFile);
		}
	}

	function cancelEdit() {
		selectedFile = null;
		previewImageUrl = null;
		isEditing = false;
	}

	let isLoading = false;
	async function onSubmit() {
		isLoading = true;
	}

	$: {
		if (form) {
			let status = form.success;
			let message = form.message;

			if (status) {
				window.location.reload();
				toast.push(message, {
					theme: {
						'--toastColor': 'mintcream',
						'--toastBackground': 'rgba(72,187,120,0.9)',
						'--toastBarBackground': '#2F855A'
					}
				});
			} else {
				toast.push(message, {
					theme: {
						'--toastColor': 'mintcream',
						'--toastBackground': 'rgba(187,72,120,0.9)',
						'--toastBarBackground': '#880808'
					}
				});
			}

			selectedFile = null;
			previewImageUrl = null;
			isEditing = false;
			isLoading = false;

			form = null;
			console.log('Done');
		}
	}

	onMount(() => {
		// Any initialization logic can go here
		toast.pop(0);

		data.userData.then((res) => {
			userInfo = res;
			formData = { ...userInfo };
		});
	});

	onDestroy(() => {
		// This will remove all toasts
		toast.pop(0);
	});
</script>

<div
	class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 px-4 py-12 sm:px-6 lg:px-8 dark:from-gray-900 dark:to-indigo-900"
>
	<SvelteToast />
	{#if userInfo != null}
		<div class="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
			<div class="relative h-48 bg-indigo-400 dark:bg-indigo-700">
				<!-- Profile Picture -->
				<img
					src={previewImageUrl || formData.profilePictureUrl}
					alt="Profile Picture"
					class="absolute bottom-0 left-1/2 h-32 w-32 -translate-x-1/2 translate-y-1/2 transform rounded-full border-4 border-white object-cover shadow-lg dark:border-gray-800"
				/>
			</div>
			<div class="px-6 pb-8 pt-16 sm:px-12">
				{#if isEditing}
					<!-- Editable Fields -->
					<form
						use:enhance
						action="?/update"
						method="post"
						enctype="multipart/form-data"
						on:submit={() => {
							onSubmit();
						}}
					>
						<div class="my-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
							<input name="userId" type="hidden" bind:value={formData.userId} />
							<div>
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
									>Name</label
								>
								<input
									name="userName"
									type="text"
									disabled={isLoading}
									bind:value={formData.userName}
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
								/>
							</div>
							<!-- <div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label
							>
							<input
								type="email"
								bind:value={formData.email}
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
							/>
						</div> -->
							<div>
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
									>Educational Institute</label
								>
								<input
									name="educationalInstitute"
									type="text"
									disabled={isLoading}
									bind:value={formData.educationalInstitute}
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
									>Academic Year</label
								>
								<input
									name="currentAcademicYear"
									type="text"
									disabled={isLoading}
									bind:value={formData.currentAcademicYear}
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
								/>
							</div>
							<div>
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
									>Academic Subject</label
								>
								<input
									name="academicSubject"
									type="text"
									disabled={isLoading}
									bind:value={formData.academicSubject}
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
								/>
							</div>
							<!-- Profile Picture Upload -->
							<div>
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
									>Profile Picture</label
								>
								<input
									name="profilePic"
									type="file"
									disabled={isLoading}
									accept="image/*"
									on:change={handleFileChange}
									class="mt-1 block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:placeholder-gray-400"
								/>
								{#if previewImageUrl}
									<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
										Previewing selected image...
									</p>
								{/if}
							</div>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
							<textarea
								name="userBio"
								disabled={isLoading}
								bind:value={formData.userBio}
								rows="4"
								class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
							></textarea>
						</div>
						<div class="mt-6 flex justify-end space-x-4">
							<button
								on:click={cancelEdit}
								disabled={isLoading}
								class="rounded-lg bg-gray-600 px-4 py-2 text-white">Cancel</button
							>
							<button
								type="submit"
								disabled={isLoading}
								class="flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-white"
							>
								{#if isLoading}
									<svg
										class="h-5 w-5 animate-spin text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											class="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
										></circle>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
								{:else}
									Save
								{/if}
							</button>
						</div>
					</form>
				{:else}
					<!-- View Mode -->
					<h1 class="mb-1 text-center text-3xl font-bold text-gray-800 dark:text-white">
						{userInfo.userName}
					</h1>
					<p class="mb-6 text-center text-xl text-indigo-600 dark:text-indigo-400">
						{userInfo.academicSubject}
					</p>
					<div class="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div class="flex items-center text-gray-700 dark:text-gray-300">
							<span class="mr-3 h-5 w-5 text-indigo-500 dark:text-indigo-400"><FaEnvelope /></span>
							<span>{userInfo.email}</span>
						</div>
						<div class="flex items-center text-gray-700 dark:text-gray-300">
							<span class="mr-3 h-5 w-5 text-indigo-500 dark:text-indigo-400"><FaUniversity /></span
							>
							<span>{userInfo.educationalInstitute}</span>
						</div>
						<div class="flex items-center text-gray-700 dark:text-gray-300">
							<span class="mr-3 h-5 w-5 text-indigo-500 dark:text-indigo-400"
								><FaGraduationCap /></span
							>
							<span>{userInfo.currentAcademicYear}</span>
						</div>
						<div class="flex items-center text-gray-700 dark:text-gray-300">
							<span class="mr-3 h-5 w-5 text-indigo-500 dark:text-indigo-400"><FaBook /></span>
							<span>{userInfo.academicSubject}</span>
						</div>
					</div>
					<div>
						<h2 class="mb-3 text-2xl font-semibold text-gray-800 dark:text-white">Bio</h2>
						<p class="leading-relaxed text-gray-700 dark:text-gray-300">{userInfo.userBio}</p>
					</div>
					<div class="mt-6 flex justify-end">
						<button
							on:click={() => (isEditing = true)}
							class="rounded-lg bg-indigo-600 px-4 py-2 text-white">Edit Profile</button
						>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
			<div
				class="spinner h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
			></div>
		</div>
	{/if}
</div>
