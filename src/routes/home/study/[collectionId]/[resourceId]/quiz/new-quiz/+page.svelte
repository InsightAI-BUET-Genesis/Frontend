<script>
	// @ts-nocheck
	import { onMount, onDestroy } from 'svelte';
	import BreadCrumb from '$lib/components/BreadCrumb.svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import FaListUl from 'svelte-icons/fa/FaListUl.svelte';
	import FaRegClone from 'svelte-icons/fa/FaRegClone.svelte';
	import FaClipboardList from 'svelte-icons/fa/FaClipboardList.svelte';
	import FaBookOpen from 'svelte-icons/fa/FaBookOpen.svelte';
	import FaChartBar from 'svelte-icons/fa/FaChartBar.svelte';
	import FaListOl from 'svelte-icons/fa/FaListOl.svelte';
	import FaQuestionCircle from 'svelte-icons/fa/FaQuestionCircle.svelte';
	import FaHeading from 'svelte-icons/fa/FaHeading.svelte';
	import FaStepForward from 'svelte-icons/fa/FaStepForward.svelte';
	import apiService from '$lib/apiService.ts';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';

	export let data;
	let breadcrumbItems = [];
	let resource = null;
	let quizType = null;
	let quizTitle = '';
	let topicType = '';
	let customTopic = '';
	let difficultyLevel = '';
	let questionType = '';
	let answerType = '';
	let numberOfQuestions = 5;
	let isCreatingQuiz = false;
	let collection = null

	onMount(async () => {
		data.resourceData.then((res) => {

			resource = res;
			breadcrumbItems = [
				{ name: 'Home', href: '../../../../' },
				{ name: 'Study', href: '../../../' },
				{ name: resource.collectionName, href: '../../' },
				{ name: resource.name, href: '../' },
				{ name: 'Quiz', href: './' },
				{ name: 'Create', href: '' }
			];


		});

		data.collectionData.then((res)=>{
			collection = res
		});
	});

	function resetForm() {
		quizType = null;
		topicType = '';
		customTopic = '';
		difficultyLevel = '';
		questionType = '';
		answerType = '';
		quizTitle = '';
		numberOfQuestions = 5;
	}

	$: if (quizType) {
		topicType = '';
		customTopic = '';
		difficultyLevel = '';
		questionType = '';
		answerType = '';
		quizTitle = '';
		numberOfQuestions = 5;
	}

	$: isFormValid =
		quizTitle.trim() !== '' &&
		(quizType == 'mcq' || (quizType == 'flashcard' && answerType)) &&
		difficultyLevel &&
		questionType &&
		(topicType === 'all' || (topicType === 'custom' && customTopic.trim() !== ''));

	async function handleSubmit() {
		if (!isFormValid) return;
		isCreatingQuiz = true;

		const payload = {
			topic_name: topicType === 'all' ? 'All' : customTopic,
			difficulty_level: difficultyLevel,
			collection_id: resource.collectionId,
			collection_name: collection.originalName,
			file_id: resource.id,
			number_of_questions: numberOfQuestions,
			question_type: questionType
		};
		console.log(payload)
		if (quizType === 'mcq') {
			try {
				const response = await apiService.postPython('generate-quiz', payload);
				console.log(response);

				const response2 = await apiService.post('question-sets/create', {
					title: quizTitle,
					type: quizType,
					questionCount: numberOfQuestions,
					resourceId: resource.id,
					questions: JSON.stringify(response['questions']),

					topicType: topicType === 'all' ? 'All' : customTopic,
					difficultyLevel: difficultyLevel,
					questionType: questionType,
					answerType: answerType
				});

				toast.push('Quiz created successfully!', {
					theme: {
						'--toastColor': 'mintcream',
						'--toastBackground': 'rgba(72,187,120,0.9)',
						'--toastBarBackground': '#2F855A'
					}
				});
				resetForm();
			} catch (error) {
				toast.push('Failed to create quiz. Please try again.', {
					theme: {
						'--toastColor': 'mintcream',
						'--toastBackground': 'rgba(187,72,120,0.9)',
						'--toastBarBackground': '#880808'
					}
				});
			} finally {
				isCreatingQuiz = false;
			}

			// Here you would send mcqData to your backend
		} else {
			if (answerType == 'stepped') {
				try {
					const response = await apiService.postPython('flashcard/step', payload);
					console.log(response);

					const response2 = await apiService.post('question-sets/create', {
						title: quizTitle,
						type: quizType,
						questionCount: numberOfQuestions,
						resourceId: resource.id,
						questions: JSON.stringify(response['questions']),

						topicType: topicType === 'all' ? 'All' : customTopic,
						difficultyLevel: difficultyLevel,
						questionType: questionType,
						answerType: answerType === 'stepped' ? "Stepped" : "Non-Stepped"
					});

					toast.push('Quiz created successfully!', {
						theme: {
							'--toastColor': 'mintcream',
							'--toastBackground': 'rgba(72,187,120,0.9)',
							'--toastBarBackground': '#2F855A'
						}
					});
					resetForm();
				} catch (error) {
					toast.push('Failed to create quiz. Please try again.', {
						theme: {
							'--toastColor': 'mintcream',
							'--toastBackground': 'rgba(187,72,120,0.9)',
							'--toastBarBackground': '#880808'
						}
					});
				} finally {
					isCreatingQuiz = false;
				}
			} else {
				try {
					const response = await apiService.postPython('flashcard/non-step', payload);
					console.log(response);

					const response2 = await apiService.post('question-sets/create', {
						title: quizTitle,
						type: quizType,
						questionCount: numberOfQuestions,
						resourceId: resource.id,
						questions: JSON.stringify(response['questions']),

						topicType: topicType === 'all' ? 'All' : customTopic,
						difficultyLevel: difficultyLevel,
						questionType: questionType,
						answerType: answerType
					});

					toast.push('Quiz created successfully!', {
						theme: {
							'--toastColor': 'mintcream',
							'--toastBackground': 'rgba(72,187,120,0.9)',
							'--toastBarBackground': '#2F855A'
						}
					});
					resetForm();
				} catch (error) {
					toast.push('Failed to create quiz. Please try again.', {
						theme: {
							'--toastColor': 'mintcream',
							'--toastBackground': 'rgba(187,72,120,0.9)',
							'--toastBarBackground': '#880808'
						}
					});
				} finally {
					isCreatingQuiz = false;
				}
			}
		}
		// Navigate back to the previous page
		// goto('./');
	}

	onMount(() => {
		// Any initialization logic can go here
		toast.pop(0);
	});

	onDestroy(() => {
		// This will remove all toasts
		toast.pop(0);
	});
</script>

<SvelteToast />
<div class="font-poppins container mx-auto px-4 py-12">
	{#if !resource || !collection}
		<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
			<div
				class="spinner h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
			></div>
		</div>
	{:else}
		<BreadCrumb items={breadcrumbItems} />
		<div class="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-md" transition:fade>
			<h1 class="mb-6 text-center text-3xl font-bold text-indigo-600">Create Quiz</h1>

			<div class="space-y-6">
				<!-- Quiz Type Section -->
				<div class="rounded-lg bg-gray-50 p-4 shadow-sm">
					<h2 class="mb-4 flex items-center text-xl font-semibold text-gray-700">
						<span class="mr-2 h-6 w-6"><FaClipboardList /></span>Choose Quiz Type
					</h2>
					<div class="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
						<button
							class="flex flex-1 items-center justify-center space-x-2 rounded-lg px-4 py-3 text-lg font-semibold transition-all duration-200 {quizType ===
							'mcq'
								? 'bg-indigo-600 text-white'
								: 'bg-white text-gray-700 hover:bg-gray-100'}"
							on:click={() => {
								quizType = 'mcq';
							}}
						>
							<span class="h-6 w-6"><FaListUl /></span>
							<span>Multiple Choice</span>
						</button>
						<button
							class="flex flex-1 items-center justify-center space-x-2 rounded-lg px-4 py-3 text-lg font-semibold transition-all duration-200 {quizType ===
							'flashcard'
								? 'bg-indigo-600 text-white'
								: 'bg-white text-gray-700 hover:bg-gray-100'}"
							on:click={() => {
								quizType = 'flashcard';
							}}
						>
							<span class="h-6 w-6"><FaRegClone /></span>
							<span>Flashcard</span>
						</button>
					</div>
				</div>

				{#if quizType === 'mcq'}
					<!-- Quiz Title Section -->
					<div class="rounded-lg bg-gray-50 p-4 shadow-sm">
						<h2 class="mb-3 flex items-center text-xl font-semibold text-gray-700">
							<span class="mr-2 h-6 w-6"><FaHeading /></span>Quiz Title
						</h2>
						<input
							type="text"
							bind:value={quizTitle}
							placeholder="Enter quiz title"
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
						/>
					</div>

					<!-- Topic Section -->
					<div class="rounded-lg bg-gray-50 p-4 shadow-sm">
						<h2 class="mb-3 flex items-center text-xl font-semibold text-gray-700">
							<span class="mr-2 h-6 w-6"><FaBookOpen /></span>Topic
						</h2>
						<div class="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
							<button
								class="flex-1 rounded-lg px-4 py-2 text-lg font-semibold transition-all duration-200 {topicType ===
								'all'
									? 'bg-indigo-600 text-white'
									: 'bg-white text-gray-700 hover:bg-gray-100'}"
								on:click={() => (topicType = 'all')}
							>
								All Topics
							</button>
							<button
								class="flex-1 rounded-lg px-4 py-2 text-lg font-semibold transition-all duration-200 {topicType ===
								'custom'
									? 'bg-indigo-600 text-white'
									: 'bg-white text-gray-700 hover:bg-gray-100'}"
								on:click={() => (topicType = 'custom')}
							>
								Custom Topic
							</button>
						</div>
						{#if topicType === 'custom'}
							<input
								type="text"
								bind:value={customTopic}
								placeholder="Enter custom topic"
								class="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							/>
						{/if}
					</div>

					<!-- Difficulty Level Section -->
					<div class="rounded-lg bg-gray-50 p-4 shadow-sm">
						<h2 class="mb-3 flex items-center text-xl font-semibold text-gray-700">
							<span class="mr-2 h-6 w-6"><FaChartBar /></span>Difficulty Level
						</h2>
						<div class="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
							{#each ['easy', 'medium', 'hard'] as level}
								<button
									class="flex-1 rounded-lg px-4 py-2 text-lg font-semibold transition-all duration-200 {difficultyLevel ===
									level
										? 'bg-indigo-600 text-white'
										: 'bg-white text-gray-700 hover:bg-gray-100'}"
									on:click={() => (difficultyLevel = level)}
								>
									{level.charAt(0).toUpperCase() + level.slice(1)}
								</button>
							{/each}
						</div>
					</div>

					<!-- Question Type Section -->
					<div class="rounded-lg bg-gray-50 p-4 shadow-sm">
						<h2 class="mb-3 flex items-center text-xl font-semibold text-gray-700">
							<span class="mr-2 h-6 w-6"><FaQuestionCircle /></span>Question Type
						</h2>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{#each ['Scenario Based', 'Conceptual', 'Factual', 'Analytic'] as type}
								<button
									class="rounded-lg px-4 py-2 text-lg font-semibold transition-all duration-200 {questionType ===
									type
										? 'bg-indigo-600 text-white'
										: 'bg-white text-gray-700 hover:bg-gray-100'}"
									on:click={() => (questionType = type)}
								>
									{type}
								</button>
							{/each}
						</div>
					</div>

					<!-- Number of Questions Section -->
					<div class="rounded-lg bg-gray-50 p-4 shadow-sm">
						<h2 class="mb-3 flex items-center text-xl font-semibold text-gray-700">
							<span class="mr-2 h-6 w-6"><FaListOl /></span>Number of Questions
						</h2>
						<div class="flex items-center space-x-4">
							<button
								class="rounded-lg bg-indigo-600 px-3 py-1 text-xl font-bold text-white transition-all duration-200 hover:bg-indigo-700"
								on:click={() => (numberOfQuestions = Math.max(1, numberOfQuestions - 1))}
							>
								-
							</button>
							<span class="text-2xl font-bold text-indigo-600">{numberOfQuestions}</span>
							<button
								class="rounded-lg bg-indigo-600 px-3 py-1 text-xl font-bold text-white transition-all duration-200 hover:bg-indigo-700"
								on:click={() => (numberOfQuestions = Math.min(20, numberOfQuestions + 1))}
							>
								+
							</button>
						</div>
					</div>
				{:else if quizType === 'flashcard'}
					<!-- Quiz Title Section -->
					<div class="rounded-lg bg-gray-50 p-4 shadow-sm">
						<h2 class="mb-3 flex items-center text-xl font-semibold text-gray-700">
							<span class="mr-2 h-6 w-6"><FaHeading /></span>Quiz Title
						</h2>
						<input
							type="text"
							bind:value={quizTitle}
							placeholder="Enter quiz title"
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
						/>
					</div>

					<!-- Topic Section -->
					<div class="rounded-lg bg-gray-50 p-4 shadow-sm">
						<h2 class="mb-3 flex items-center text-xl font-semibold text-gray-700">
							<span class="mr-2 h-6 w-6"><FaBookOpen /></span>Topic
						</h2>
						<div class="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
							<button
								class="flex-1 rounded-lg px-4 py-2 text-lg font-semibold transition-all duration-200 {topicType ===
								'all'
									? 'bg-indigo-600 text-white'
									: 'bg-white text-gray-700 hover:bg-gray-100'}"
								on:click={() => (topicType = 'all')}
							>
								All Topics
							</button>
							<button
								class="flex-1 rounded-lg px-4 py-2 text-lg font-semibold transition-all duration-200 {topicType ===
								'custom'
									? 'bg-indigo-600 text-white'
									: 'bg-white text-gray-700 hover:bg-gray-100'}"
								on:click={() => (topicType = 'custom')}
							>
								Custom Topic
							</button>
						</div>
						{#if topicType === 'custom'}
							<input
								type="text"
								bind:value={customTopic}
								placeholder="Enter custom topic"
								class="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							/>
						{/if}
					</div>

					<!-- Difficulty Level Section -->
					<div class="rounded-lg bg-gray-50 p-4 shadow-sm">
						<h2 class="mb-3 flex items-center text-xl font-semibold text-gray-700">
							<span class="mr-2 h-6 w-6"><FaChartBar /></span>Difficulty Level
						</h2>
						<div class="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
							{#each ['easy', 'medium', 'hard'] as level}
								<button
									class="flex-1 rounded-lg px-4 py-2 text-lg font-semibold transition-all duration-200 {difficultyLevel ===
									level
										? 'bg-indigo-600 text-white'
										: 'bg-white text-gray-700 hover:bg-gray-100'}"
									on:click={() => (difficultyLevel = level)}
								>
									{level.charAt(0).toUpperCase() + level.slice(1)}
								</button>
							{/each}
						</div>
					</div>

					<!-- Question Type Section -->
					<div class="rounded-lg bg-gray-50 p-4 shadow-sm">
						<h2 class="mb-3 flex items-center text-xl font-semibold text-gray-700">
							<span class="mr-2 h-6 w-6"><FaQuestionCircle /></span>Question Type
						</h2>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{#each ['Scenario Based', 'Conceptual', 'Factual', 'Analytic'] as type}
								<button
									class="rounded-lg px-4 py-2 text-lg font-semibold transition-all duration-200 {questionType ===
									type
										? 'bg-indigo-600 text-white'
										: 'bg-white text-gray-700 hover:bg-gray-100'}"
									on:click={() => (questionType = type)}
								>
									{type}
								</button>
							{/each}
						</div>
					</div>

					<!-- Answer Type: Stepped vs Non-Stepped -->
					<div class="rounded-lg bg-gray-50 p-4 shadow-sm">
						<h2 class="mb-3 flex items-center text-xl font-semibold text-gray-700">
							<span class="mr-2 h-6 w-6"><FaStepForward /></span>Answer Type
						</h2>
						<div class="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
							<button
								class="flex-1 rounded-lg px-4 py-2 text-lg font-semibold transition-all duration-200 {answerType ===
								'stepped'
									? 'bg-indigo-600 text-white'
									: 'bg-white text-gray-700 hover:bg-gray-100'}"
								on:click={() => (answerType = 'stepped')}
							>
								Stepped
							</button>
							<button
								class="flex-1 rounded-lg px-4 py-2 text-lg font-semibold transition-all duration-200 {answerType ===
								'non-stepped'
									? 'bg-indigo-600 text-white'
									: 'bg-white text-gray-700 hover:bg-gray-100'}"
								on:click={() => (answerType = 'non-stepped')}
							>
								Non-Stepped
							</button>
						</div>
					</div>

					<!-- Number of Questions Section -->
					<div class="rounded-lg bg-gray-50 p-4 shadow-sm">
						<h2 class="mb-3 flex items-center text-xl font-semibold text-gray-700">
							<span class="mr-2 h-6 w-6"><FaListOl /></span>Number of Questions
						</h2>
						<div class="flex items-center space-x-4">
							<button
								class="rounded-lg bg-indigo-600 px-3 py-1 text-xl font-bold text-white transition-all duration-200 hover:bg-indigo-700"
								on:click={() => (numberOfQuestions = Math.max(1, numberOfQuestions - 1))}
							>
								-
							</button>
							<span class="text-2xl font-bold text-indigo-600">{numberOfQuestions}</span>
							<button
								class="rounded-lg bg-indigo-600 px-3 py-1 text-xl font-bold text-white transition-all duration-200 hover:bg-indigo-700"
								on:click={() => (numberOfQuestions = Math.min(20, numberOfQuestions + 1))}
							>
								+
							</button>
						</div>
					</div>
				{/if}

				{#if quizType}
					<div class="mt-8 flex justify-center">
						<button
							class="rounded-lg px-8 py-3 text-xl font-bold transition-all duration-200 disabled:opacity-50 {isFormValid
								? 'bg-indigo-600 text-white hover:bg-indigo-700'
								: 'cursor-not-allowed bg-gray-300 text-gray-500'}"
							on:click={handleSubmit}
							disabled={!isFormValid || isCreatingQuiz}
						>
							{#if isCreatingQuiz}
								<span class="flex items-center">
									<svg
										class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
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
									Creating Quiz...
								</span>
							{:else}
								Create Quiz
							{/if}
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		font-family: 'Poppins', sans-serif;
	}
	:global(svg) {
		width: 100%;
		height: 100%;
	}
</style>
