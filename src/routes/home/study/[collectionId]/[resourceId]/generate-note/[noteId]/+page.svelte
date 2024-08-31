<script>
	// @ts-nocheck
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import FaPlus from 'svelte-icons/fa/FaPlus.svelte';
	import { marked } from 'marked';
	import PDFDownload from '$lib/components/PDFDownload.svelte';

	export let data;
	let resource = null;
	let metadata = null;
	let note = null;
	let videos = null;

	let breadcrumbItems = [];
	let currentSlideIndex = 0;

	onMount(async () => {
		try {
			resource = await data.resourceData;
			const noteData = await data.noteData;

			console.log(resource);
			console.log(noteData);

			metadata = {
				id: noteData.id,
				title: noteData.title,
				topic: noteData.topic,
				knowledgeLevel: noteData.knowledgeLevel
			};

			note = noteData.note.note;
			videos = noteData.note.videos;

			breadcrumbItems = [
				{ name: 'Home', href: '../../../../' },
				{ name: 'Study', href: '../../../' },
				{ name: resource.collectionName, href: '../../' },
				{ name: resource.name, href: '../' },
				{ name: 'Notes', href: './' },
				{ name: metadata.title, href: '' }
			];

			console.log(note);
			console.log(videos);
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	});

	let currentSection = 'introduction';

	const sections = [
		{ id: 'introduction', title: 'Introduction' },
		{ id: 'slides', title: 'Slides' },
		{ id: 'questions', title: 'Questions' },
		{ id: 'conclusion', title: 'Conclusion' }
	];

	function nextSlide() {
		if (currentSlideIndex < note.slides.length - 1) {
			currentSlideIndex++;
		} else if (currentSection === 'slides') {
			currentSection = 'questions';
		}
	}

	function previousSlide() {
		if (currentSlideIndex > 0) {
			currentSlideIndex--;
		} else if (currentSection === 'slides') {
			currentSection = 'introduction';
		}
	}

	function goToSection(sectionId) {
		currentSection = sectionId;
		if (sectionId === 'slides') {
			currentSlideIndex = 0;
		}
	}

	// Add this function to format the duration
	function formatDuration(duration) {
		const [minutes, seconds] = duration.split(':').map(Number);
		return `${minutes}m ${seconds}s`;
	}
</script>

<div class="font-poppins container mx-auto px-4 py-12">
	{#if !resource || !metadata || !note || !videos}
		<div class="flex h-screen items-center justify-center">
			<div
				class="spinner h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
			></div>
		</div>
	{:else}
		<div class="container mx-auto px-4 py-8">
			<BreadCrumb items={breadcrumbItems} />

			<!-- Metadata Section -->
			<div class="mb-8 rounded-lg bg-white p-8 shadow-lg">
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
				  <div class="mb-4 sm:mb-0">
					<h1 class="mb-4 text-4xl font-bold">{metadata.title}</h1>
					<p class="text-gray-600">Topic: {metadata.topic}</p>
					<p class="text-gray-600">Knowledge Level: {metadata.knowledgeLevel}</p>
				  </div>
				  <div class="mt-4 sm:mt-0">
					{#if note && metadata}
					  <PDFDownload {note} {metadata} />
					{/if}
				  </div>
				</div>
			  </div>

			<!-- Navigation Tabs -->
			<div class="mb-8 rounded-lg bg-white p-4 shadow-lg">
				<nav class="flex space-x-4">
					{#each sections as section}
						<button
							on:click={() => goToSection(section.id)}
							class="rounded px-4 py-2 {currentSection === section.id
								? 'bg-indigo-500 text-white'
								: 'hover:bg-gray-200'}"
						>
							{section.title}
						</button>
					{/each}
				</nav>
			</div>

			<!-- Main Content Section -->
			<div class="mb-8 rounded-lg bg-white p-8 shadow-lg">
				<div class="mx-auto max-w-2xl">
					{#if currentSection === 'introduction'}
						<div in:fade>
							<h2 class="mb-4 text-3xl font-semibold">Introduction</h2>
							<div class="prose prose-lg max-w-none">
								{@html marked(note.introduction_and_motivation)}
							</div>
						</div>
					{:else if currentSection === 'slides'}
						<div in:fade>
							<h2 class="mb-4 text-3xl font-semibold">
								{note.slides[currentSlideIndex].slide_name}
							</h2>
							<div class="prose prose-lg mb-8 max-w-none">
								{@html marked(note.slides[currentSlideIndex].slide_content)}
							</div>
							<div class="mt-4 flex justify-between">
								<button on:click={previousSlide} class="rounded bg-indigo-500 px-4 py-2 text-white"
									>Previous</button
								>
								<span>{currentSlideIndex + 1} / {note.slides.length}</span>
								<button on:click={nextSlide} class="rounded bg-indigo-500 px-4 py-2 text-white"
									>Next</button
								>
							</div>
						</div>
					{:else if currentSection === 'questions'}
						<div in:fade>
							<h2 class="mb-4 text-3xl font-semibold">Questions</h2>
							{#each note.questions as question}
								<div class="mb-8">
									<h3 class="mb-2 text-2xl font-semibold">{question.question}</h3>
									<div class="prose prose-lg max-w-none">
										{@html marked(question.answer)}
									</div>
								</div>
							{/each}
						</div>
					{:else if currentSection === 'conclusion'}
						<div in:fade>
							<h2 class="mb-4 text-3xl font-semibold">Conclusion</h2>
							<div class="prose prose-lg max-w-none">
								{@html marked(note.conclusion)}
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Video Section -->
			<div class="rounded-lg bg-white p-8 shadow-lg">
				<h2 class="mb-6 text-3xl font-semibold">Related Videos</h2>
				<div class="space-y-6">
					{#each videos as video}
						{#if video.imageUrl && video.title && video.date && video.duration}
							<div class="flex items-center overflow-hidden rounded-lg bg-gray-100 p-2">
								<img
									src={video.imageUrl}
									alt={video.title}
									class="h-16 w-16 rounded object-cover"
								/>
								<div class="ml-4 flex flex-grow items-center justify-between">
									<div>
										<h3 class="text-lg font-semibold">{video.title}</h3>
										<p class="text-xs text-gray-600">{video.source}</p>
									</div>
									<div class="text-right">
										<p class="text-sm text-gray-600">{formatDuration(video.duration)}</p>
										<p class="text-xs text-gray-500">{video.date}</p>
									</div>
								</div>
								<a
									href={video.link}
									target="_blank"
									rel="noopener noreferrer"
									class="ml-4 rounded bg-indigo-500 px-3 py-1 text-sm text-white transition-colors hover:bg-indigo-600"
								>
									Watch
								</a>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
