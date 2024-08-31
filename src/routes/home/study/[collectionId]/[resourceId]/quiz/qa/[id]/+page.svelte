<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { fade } from 'svelte/transition';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import apiService from '$lib/apiService.ts';
	import FaQuestionCircle from 'svelte-icons/fa/FaQuestionCircle.svelte';
	import FaFileAlt from 'svelte-icons/fa/FaFileAlt.svelte';
	import FaTrophy from 'svelte-icons/fa/FaTrophy.svelte';
	import FaCalendarAlt from 'svelte-icons/fa/FaCalendarAlt.svelte';
	import FaChartBar from 'svelte-icons/fa/FaChartBar.svelte';
	import FaBookOpen from 'svelte-icons/fa/FaBookOpen.svelte';
	import FaLayerGroup from 'svelte-icons/fa/FaLayerGroup.svelte';
	import FaClipboardList from 'svelte-icons/fa/FaClipboardList.svelte';
	import FaPlay from 'svelte-icons/fa/FaPlay.svelte';
	import FaBook from 'svelte-icons/fa/FaBook.svelte';
	import FaPlus from 'svelte-icons/fa/FaPlus.svelte';
	import { goto } from '$app/navigation';
	import { marked } from 'marked';

	export let data;
	let breadcrumbItems = [];
	let resource = null;
	let questionSet = null;
	let questions = null;
	let currentQuestionIndex = 0;
	let mode = 'info'; // 'info', 'study', 'review', 'result'
	let answerRevealed = false;
	let userFeedback = [];
	let score = 0;
	let isSubmittingQuiz = false;

	onMount(async () => {
		data.resourceData.then((res) => {
			resource = res;
		});

		data.questionData.then((res) => {
			questionSet = res;
			questions = JSON.parse(res.questions);
			console.log(questions);
			userFeedback = new Array(questions.length).fill(null);
		});
	});

	$: if (resource && questionSet) {
		breadcrumbItems = [
			{ name: 'Home', href: '../../../../../' },
			{ name: 'Study', href: '..././../../' },
			{ name: resource.collectionName, href: '../../../' },
			{ name: resource.name, href: '../../' },
			{ name: 'Quiz', href: '../' },
			{ name: questionSet.title, href: '' }
		];
	}

	function startStudy() {
		mode = 'study';
		currentQuestionIndex = 0;
	}

	function startReview() {
		mode = 'review';
		currentQuestionIndex = 0;
		answerRevealed = false;
	}

	function nextQuestion() {
		if (currentQuestionIndex < questions.length - 1) {
			currentQuestionIndex++;
			answerRevealed = mode === 'study';

			// Scroll the question container to the top
			document.querySelector('.question-container').scrollIntoView({ behavior: 'instant' });
			console.log("Here")
		} else {
			finishSession();
		}
	}

	function prevQuestion() {
		if (currentQuestionIndex > 0) {
			currentQuestionIndex--;
			answerRevealed = mode === 'study';
		}
	}

	function revealAnswer() {
		answerRevealed = true;
	}

	function provideFeedback(feedback) {
		userFeedback[currentQuestionIndex] = feedback;
	}

	async function finishSession() {
		isSubmittingQuiz = true;
		if (mode === 'review') {
			calculateScore();

			const response = await apiService.put(`question-sets/${questionSet.id}`, {
				highScore: score
			});

			questionSet.highScore = score;
		}
		mode = 'result';
		isSubmittingQuiz = false;
	}

	function calculateScore() {
		const feedbackScores = {
			Excellent: 5,
			Good: 4,
			Okay: 3,
			'Need Improvement': 2,
			Poor: 1
		};
		score = userFeedback.reduce((acc, feedback) => acc + (feedbackScores[feedback] || 0), 0);
		score = Math.round((score / (questions.length * 5)) * 100); // Convert to percentage
	}

	function resetSession() {
		currentQuestionIndex = 0;
		answerRevealed = false;
		userFeedback = new Array(questions.length).fill(null);
		score = 0;
	}

	function exitToInfo() {
		mode = 'info';
		resetSession();
	}

	function parseMarkdown(text) {
        return marked(text || '');
    }
</script>

<SvelteToast />
<div class="font-poppins container mx-auto px-4 py-12 question-container">
	{#if !resource || !questions}
		<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
			<div
				class="spinner h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
			></div>
		</div>
	{:else}
		<BreadCrumb items={breadcrumbItems} />

		{#if mode === 'info'}
			<div class="mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
				<h1 class="mb-6 text-4xl font-extrabold text-indigo-900 dark:text-indigo-200">
					{questionSet.title}
				</h1>
				<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
					<div class="flex items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
						<div class="mr-3 h-5 w-5">
							<FaFileAlt class="mr-3 text-indigo-600 dark:text-indigo-400" />
						</div>
						<span class="text-gray-700 dark:text-gray-300">Type: {questionSet.type}</span>
					</div>
					<div class="flex items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
						<div class="mr-3 h-5 w-5">
							<FaQuestionCircle class="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
						</div>
						<span class="text-gray-700 dark:text-gray-300"
							>Questions: {questionSet.questionCount}</span
						>
					</div>
					<div class="flex items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
						<div class="mr-3 h-5 w-5">
							<FaTrophy class="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
						</div>
						<span class="text-gray-700 dark:text-gray-300"
							>Highest Score: {questionSet.highScore}%</span
						>
					</div>
					<div class="flex items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
						<div class="mr-3 h-5 w-5">
							<FaCalendarAlt class="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
						</div>
						<span class="text-gray-700 dark:text-gray-300"
							>Created: {new Date(questionSet.createdAt).toLocaleDateString()}</span
						>
					</div>
					<div class="flex items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
						<div class="mr-3 h-5 w-5">
							<FaChartBar class="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
						</div>
						<span class="text-gray-700 dark:text-gray-300"
							>Difficulty: {questionSet.difficultyLevel.charAt(0).toUpperCase() +
								questionSet.difficultyLevel.slice(1)}</span
						>
					</div>
					<div class="flex items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
						<div class="mr-3 h-5 w-5">
							<FaClipboardList class="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
						</div>
						<span class="text-gray-700 dark:text-gray-300"
							>Question Type: {questionSet.questionType}</span
						>
					</div>
					{#if questionSet.answerType}
						<div class="flex items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
							<div class="mr-3 h-5 w-5">
								<FaLayerGroup class="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
							</div>
							<span class="text-gray-700 dark:text-gray-300"
								>Answer Type: {questionSet.answerType}</span
							>
						</div>
					{/if}
					<div class="flex items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
						<div class="mr-3 h-5 w-5">
							<FaBookOpen class="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
						</div>
						<span class="text-gray-700 dark:text-gray-300">Topic Type: {questionSet.topicType}</span
						>
					</div>
				</div>
				<div class="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
					<button
						on:click={startReview}
						class="flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-white transition-all duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					>
						<div class="mr-2 h-5 w-5">
							<FaPlay class="mr-2 h-5 w-5" />
						</div>
						Review
					</button>
					<button
						on:click={startStudy}
						class="flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-white transition-all duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
					>
						<div class="mr-2 h-5 w-5">
							<FaBook class="mr-2 h-5 w-5" />
						</div>
						Study Mode
					</button>
				</div>
			</div>
		{/if}

		{#if mode === 'study' || mode === 'review'}
			<div
				class="mx-auto mb-8 max-w-3xl space-y-4 rounded-lg bg-white p-4 shadow-lg sm:p-6 md:p-8 dark:bg-gray-800"
			>
				<div class="flex flex-row justify-end">
					<button
						on:click={exitToInfo}
						class="text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-200"
						aria-label="Exit to info"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<h2 class="mb-4 text-xl font-bold text-gray-800 sm:text-2xl dark:text-white">
					Flashcard {currentQuestionIndex + 1} of {questions.length}
				</h2>
				<div class="space-y-4">
					<!-- Question Card -->
					<div class="transform rounded-xl border bg-white p-6 shadow-lg transition duration-500">
						<h3 class="mb-4 text-2xl font-bold text-indigo-600">Question</h3>
						<p class="text-lg text-gray-700">{@html parseMarkdown(questions[currentQuestionIndex].question)}</p>
					</div>

					<!-- Answer Card (visible in study mode or when revealed) -->
					{#if mode === 'study' || answerRevealed}
						<div class="transform rounded-xl border bg-white p-6 shadow-lg transition duration-500">
							<h3 class="mb-4 text-2xl font-bold text-green-600">Answer</h3>
							{#if questionSet.answerType === 'Stepped'}
								{#each questions[currentQuestionIndex].answer as step, index}
									<div class="mb-6 rounded-lg border bg-gray-50 p-4">
										<h4 class="mb-2 text-xl font-semibold text-indigo-500">
											Step {index + 1}: {step.step_name}
										</h4>
										<p class="whitespace-pre-wrap text-lg text-gray-700 prose prose-lg">{@html parseMarkdown(step.step_solution)}</p>
									</div>
								{/each}
								{#if questions[currentQuestionIndex].conclusion}
									<div class="mt-6 rounded-lg border bg-indigo-50 p-4">
										<h4 class="mb-2 text-xl font-semibold text-indigo-600">Conclusion</h4>
										<p class="prose prose-lg whitespace-pre-wrap text-lg text-gray-700">
											{@html parseMarkdown(questions[currentQuestionIndex].conclusion)}
										</p>
									</div>
								{/if}
							{:else}
								<p class="prose prose-lg whitespace-pre-wrap border text-lg text-gray-700">
									{@html parseMarkdown(questions[currentQuestionIndex].answer)}
								</p>
							{/if}
						</div>

						<!-- Tips and Tricks Card -->
						<div class="transform rounded-xl border bg-white p-6 shadow-lg transition duration-500">
							<h3 class="mb-4 text-2xl font-bold text-yellow-600">Tips and Tricks</h3>
							<p class="text-lg text-gray-700 prose prose-lg">{@html parseMarkdown(questions[currentQuestionIndex].tips_and_tricks)}</p>
						</div>
					{/if}

					{#if mode === 'review' && !answerRevealed}
						<button
							on:click={revealAnswer}
							class="w-full rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						>
							Reveal Answer
						</button>
					{/if}

					{#if mode === 'review' && answerRevealed}
						<div class="flex flex-wrap justify-center gap-2">
							{#each ['Excellent', 'Good', 'Okay', 'Need Improvement', 'Poor'] as feedback}
								<button
									on:click={() => provideFeedback(feedback)}
									class="rounded-lg px-4 py-2 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
                                {userFeedback[currentQuestionIndex] === feedback
										? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
										: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}"
								>
									{feedback}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<div class="mt-8 flex justify-between">
					<button
						on:click={prevQuestion}
						disabled={currentQuestionIndex === 0}
						class="rounded-lg bg-gray-300 px-4 py-2 text-gray-700 transition-colors duration-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 sm:px-6 sm:py-3"
					>
						Previous
					</button>
					<button
						on:click={nextQuestion}
						class="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 sm:px-6 sm:py-3"
						disabled={isSubmittingQuiz}
					>
						{#if isSubmittingQuiz}
							<span
								class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
								style="animation: spin 1s linear infinite;"
							></span>
						{/if}
						{currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
					</button>
				</div>
			</div>
		{/if}

		{#if mode === 'result'}
			<div class="rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
				<h2 class="mb-4 text-3xl font-bold text-gray-800 dark:text-white">Session Completed!</h2>
				{#if score > 0}
					<p class="mb-6 text-xl text-gray-700 dark:text-gray-300">
						Your self-assessment score: {score}%
					</p>
				{/if}
				<div class="flex justify-center space-x-4">
					<button
						on:click={() => {
							resetSession();
							mode = 'review';
						}}
						class="rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					>
						Review Again
					</button>
					<button
						on:click={() => {
							resetSession();
							mode = 'study';
						}}
						class="rounded-lg bg-green-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
					>
						Study Mode
					</button>
					<button
						on:click={() => {
							resetSession();
							mode = 'info';
						}}
						class="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						Back to Info
					</button>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.spinner {
		border-top-color: transparent;
	}
</style>
