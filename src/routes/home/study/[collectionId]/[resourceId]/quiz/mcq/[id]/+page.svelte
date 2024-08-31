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
	let selectedAnswers = [];
	let quizCompleted = false;
	let score = 0;
	let mode = 'info'; // 'info', 'test', 'study', 'review', 'result'
	let isSubmittingQuiz = false;

	onMount(async () => {
		data.resourceData.then((res) => {
			resource = res;
		});

		data.questionData.then((res) => {
			questionSet = res;
			questions = JSON.parse(res.questions);
			selectedAnswers = new Array(questions.length).fill(null);
			console.log(questions)
		});
	});

	$: if (resource && questionSet) {
		breadcrumbItems = [
			{ name: 'Home', href: '../../../../../' },
			{ name: 'Study', href: '..././../../' },
			{ name: resource.collectionName, href: '../../../' },
			{ name: resource.name, href: '../' },
			{ name: 'Quiz', href: '../' },
			{ name: questionSet.title, href: '' }
		];
	}

	function startTest() {
		mode = 'test';
		resetQuiz();
	}

	function startStudy() {
		mode = 'study';
		currentQuestionIndex = 0;
	}

	function selectAnswer(index) {
		if (mode === 'test') {
			selectedAnswers[currentQuestionIndex] = index;
		}
	}

	function nextQuestion() {
		if (currentQuestionIndex < questions.length - 1) {
			currentQuestionIndex = currentQuestionIndex + 1;
		} else if (mode === 'test') {
			finishQuiz();
		} else if (mode === 'review' || mode === 'study') {
			currentQuestionIndex = currentQuestionIndex + 1; // This will trigger the completion screen for both review and study modes
		}
		console.log(currentQuestionIndex, questions[currentQuestionIndex].correctAnswer)
	}

	function prevQuestion() {
		if (currentQuestionIndex > 0) {
			currentQuestionIndex = currentQuestionIndex - 1;
		}
	}

	async function finishQuiz() {
		isSubmittingQuiz = true;
		score = selectedAnswers.reduce(
			(acc, answer, index) => (answer === questions[index].correctAnswer ? acc + 1 : acc),
			0
		);

		const response = await apiService.put(`question-sets/${questionSet.id}`, {
			highScore: score
		});

		questionSet.highScore = score;

		quizCompleted = true;
		mode = 'result';

		isSubmittingQuiz = false;
	}

	function resetQuiz() {
		currentQuestionIndex = 0;
		selectedAnswers = new Array(questions.length).fill(null);
		quizCompleted = false;
		score = 0;
	}

	function getButtonClass(questionIndex, optionIndex) {
		if (mode === 'test') {
			return selectedAnswers[questionIndex] === optionIndex
				? 'bg-indigo-100 dark:bg-indigo-900'
				: '';
		} else if (mode === 'review') {
			if (selectedAnswers[questionIndex] === optionIndex) {
				return optionIndex === questions[questionIndex].correctAnswer
					? 'bg-green-100 dark:bg-green-900' // Correct answer
					: 'bg-red-100 dark:bg-red-900'; // Incorrect answer
			} else if (optionIndex === questions[questionIndex].correctAnswer) {
				return 'bg-green-100 dark:bg-green-900'; // Correct answer not selected
			}
			return '';
		} else {
			// Study mode
			return optionIndex === questions[questionIndex].correctAnswer
				? 'bg-green-100 dark:bg-green-900'
				: '';
		}
	}

	function exitToInfo() {
		mode = 'info';
		resetQuiz();
	}

	function parseMarkdown(text) {
        return marked(text || '');
    }
</script>

<SvelteToast />
<div class="font-poppins container mx-auto px-4 py-12">
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
						<div class="h-5 w-5 mr-3">
							<FaFileAlt class="mr-3 text-indigo-600 dark:text-indigo-400" />
						</div>
						<span class="text-gray-700 dark:text-gray-300">Type: {questionSet.type}</span>
					</div>
					<div class="flex items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
						<div class="h-5 w-5 mr-3">
							<FaQuestionCircle class="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
						</div>
						<span class="text-gray-700 dark:text-gray-300"
							>Questions: {questionSet.questionCount}</span
						>
					</div>
					<div class="flex items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
						<div class="h-5 w-5 mr-3">
						<FaTrophy class="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
						</div>
						<span class="text-gray-700 dark:text-gray-300"
							>Highest Score: {questionSet.highScore}</span
						>
					</div>
					<div class="flex items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
						<div class="h-5 w-5 mr-3">
						<FaCalendarAlt class="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
						</div>
						<span class="text-gray-700 dark:text-gray-300"
							>Created: {new Date(questionSet.createdAt).toLocaleDateString()}</span
						>
					</div>
					<div class="flex items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
						<div class="h-5 w-5 mr-3">
						<FaChartBar class="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
					</div>
						<span class="text-gray-700 dark:text-gray-300"
							>Difficulty: {questionSet.difficultyLevel}</span
						>
					</div>
					<div class="flex items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
						<div class="h-5 w-5 mr-3">
						<FaClipboardList class="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
					</div>
						<span class="text-gray-700 dark:text-gray-300"
							>Question Type: {questionSet.questionType}</span
						>
					</div>
					{#if questionSet.answerType}
						<div class="flex items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
							<div class="h-5 w-5 mr-3">
							<FaLayerGroup class="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
							</div>
							<span class="text-gray-700 dark:text-gray-300"
								>Answer Type: {questionSet.answerType}</span
							>
						</div>
					{/if}
					<div class="flex items-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
						<div class="h-5 w-5 mr-3">
						<FaBookOpen class="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
						</div>
						<span class="text-gray-700 dark:text-gray-300">Topic Type: {questionSet.topicType}</span
						>
					</div>
				</div>	
				<div class="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
					<button
						on:click={startTest}
						class="flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-white transition-all duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					>	<div class="h-5 w-5 mr-2">
						<FaPlay class="mr-2 h-5 w-5" />
					</div>
						Take Test
					</button>
					<button
						on:click={startStudy}
						class="flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-white transition-all duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
					>
					<div class="h-5 w-5 mr-2">
						<FaBook class="mr-2 h-5 w-5" />
					</div>
						Study Mode
					</button>
				</div>
			</div>
		{/if}
		{#if mode === 'test'}
			<div class="space-y-4 mx-auto max-w-3xl  mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
				<div class="flex flex-row justify-end">
					<button
						on:click={exitToInfo}
						class=" text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-200"
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
				<h2 class="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
					Question {currentQuestionIndex + 1} of {questions.length}
				</h2>
				<p class="mb-6 text-xl text-gray-700 dark:text-gray-300">
					{questions[currentQuestionIndex].question}
				</p>

				<div class="space-y-4">
					{#each questions[currentQuestionIndex].options as option, index}
						<button
							on:click={() => selectAnswer(index)}
							class="prose prose-lg w-full rounded-lg border-2 border-gray-300 p-4 text-left transition-colors duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:hover:bg-gray-700 {getButtonClass(
								currentQuestionIndex,
								index
							)}"
						>
						{@html parseMarkdown(option)}
						</button>
					{/each}
				</div>

				<div class="mt-8 flex justify-between">
					<button
						on:click={prevQuestion}
						disabled={currentQuestionIndex === 0}
						class="rounded-lg bg-gray-300 px-6 py-3 text-gray-700 transition-colors duration-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
					>
						Previous
					</button>
					<button
						on:click={currentQuestionIndex === questions.length - 1 ? finishQuiz : nextQuestion}
						class="flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
						disabled={isSubmittingQuiz}
					>
						{#if isSubmittingQuiz}
							<span
								class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
								style="animation: spin 1s linear infinite;"
							></span>
						{/if}
						{currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
					</button>
				</div>
			</div>
		{/if}
		{#if mode === 'study'}
			{#if currentQuestionIndex < questions.length}
				<div class="space-y-4 mx-auto max-w-3xl  mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
					<div class="flex flex-row justify-end">
						<button
							on:click={exitToInfo}
							class=" text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-200"
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
					<h2 class="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
						Question {currentQuestionIndex + 1} of {questions.length}
					</h2>
					<p class="mb-6 text-xl text-gray-700 dark:text-gray-300 prose prose-lg">
						{@html parseMarkdown(questions[currentQuestionIndex].question)}
					</p>

					<div class="space-y-4">
						{#each questions[currentQuestionIndex].options as option, index}
							<button
								class="prose prose-lg w-full rounded-lg border-2 border-gray-300 p-4 text-left transition-colors duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:hover:bg-gray-700 {getButtonClass(
									currentQuestionIndex,
									index
								)}"
								disabled
							>
							{@html parseMarkdown(option)}
							</button>
						{/each}
					</div>

					<div
						class="mt-6 rounded-lg bg-blue-100 p-4 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
					>
						<h3 class="prose prose-lg mb-2 font-bold">Explanation:</h3>
						<p>{@html parseMarkdown(questions[currentQuestionIndex].explanation)}</p>
					</div>

					<div class="mt-8 flex justify-between">
						<button
							on:click={prevQuestion}
							disabled={currentQuestionIndex === 0}
							class="rounded-lg bg-gray-300 px-6 py-3 text-gray-700 transition-colors duration-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
						>
							Previous
						</button>
						<button
							on:click={nextQuestion}
							class="rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
						>
							{currentQuestionIndex === questions.length - 1 ? 'Finish Study' : 'Next'}
						</button>
					</div>
				</div>
			{:else}
				<div class="space-y-4 mx-auto max-w-3xl  rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
					<h2 class="mb-4 text-3xl font-bold text-gray-800 dark:text-white">Study Completed!</h2>
					<p class="mb-6 text-xl text-gray-700 dark:text-gray-300">
						You've reviewed all {questions.length} questions.
					</p>
					<div class="flex justify-center space-x-4">
						<button
							on:click={() => {
								resetQuiz();
								mode = 'test';
							}}
							class="rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
						>
							Take Test
						</button>
						<button
							on:click={() => {
								currentQuestionIndex = 0;
							}}
							class="rounded-lg bg-green-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
						>
							Study Again
						</button>
						<button
							on:click={() => {
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
		{#if mode === 'review'}
			{#if currentQuestionIndex < questions.length}
				<div class="space-y-4 mx-auto max-w-3xl  mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
					<div class="flex flex-row justify-end">
						<button
							on:click={exitToInfo}
							class=" text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-200"
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
					<h2 class="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
						Question {currentQuestionIndex + 1} of {questions.length}
					</h2>
					<p class="prose prose-lg mb-6 text-xl text-gray-700 dark:text-gray-300">
						{@html parseMarkdown(questions[currentQuestionIndex].question)}
					</p>

					<div class="space-y-4">
						{#each questions[currentQuestionIndex].options as option, index}
							<button
								class="prose prose-lg w-full rounded-lg border-2 border-gray-300 p-4 text-left transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 {getButtonClass(
									currentQuestionIndex,
									index
								)}"
								disabled
							>
							{@html parseMarkdown(option)}
								{#if selectedAnswers[currentQuestionIndex] === index}
									{index === questions[currentQuestionIndex].correctAnswer
										? ' ✅ (Your answer - Correct)'
										: ' ❌ (Your answer - Incorrect)'}
								{:else if index === questions[currentQuestionIndex].correctAnswer}
									' ✅ (Correct answer)'
								{/if}
							</button>
						{/each}
					</div>

					<div
						class="mt-6 rounded-lg bg-blue-100 p-4 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
					>
						<h3 class="prose prose-lg mb-2 font-bold">Explanation:</h3>
						<p>{@html parseMarkdown(questions[currentQuestionIndex].explanation)}</p>
					</div>

					<div class="mt-8 flex justify-between">
						<button
							on:click={prevQuestion}
							disabled={currentQuestionIndex === 0}
							class="rounded-lg bg-gray-300 px-6 py-3 text-gray-700 transition-colors duration-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
						>
							Previous
						</button>
						<button
							on:click={nextQuestion}
							class="rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
						>
							{currentQuestionIndex === questions.length - 1 ? 'Finish Review' : 'Next'}
						</button>
					</div>
				</div>
			{:else}
				<div class="space-y-4 mx-auto max-w-3xl rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
					<h2 class="mb-4 text-3xl font-bold text-gray-800 dark:text-white">Review Completed!</h2>
					<p class="mb-6 text-xl text-gray-700 dark:text-gray-300">
						Your score: {score} out of {questions.length}
					</p>
					<div class="flex justify-center space-x-4">
						<button
							on:click={() => {
								resetQuiz();
								mode = 'test';
							}}
							class="rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
						>
							Take Test Again
						</button>
						<button
							on:click={() => {
								mode = 'info';
							}}
							class="rounded-lg bg-green-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
						>
							Back to Info
						</button>
					</div>
				</div>
			{/if}
		{/if}
		{#if mode === 'result'}
			<div class="space-y-4 mx-auto max-w-3xl  rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
				<h2 class="mb-4 text-3xl font-bold text-gray-800 dark:text-white">Quiz Completed!</h2>
				<p class="mb-6 text-xl text-gray-700 dark:text-gray-300">
					Your score: {score} out of {questions.length}
				</p>
				<div class="flex justify-center space-x-4">
					<button
						on:click={() => {
							resetQuiz();
							mode = 'test';
						}}
						class="rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					>
						Take Test Again
					</button>
					<button
						on:click={() => {
							mode = 'review';
							currentQuestionIndex = 0;
						}}
						class="rounded-lg bg-green-600 px-6 py-3 text-white transition-colors duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
					>
						Review Answers
					</button>
					<button
						on:click={() => {
							exitToInfo();
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
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
