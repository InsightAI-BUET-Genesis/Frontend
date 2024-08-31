import apiService from "$lib/apiService.js";
import mockQuestions from "$lib/data/mockQASets.json";
import mockQuiz from "$lib/data/mockQuiz.json";
import mockQA from "$lib/data/mockQA.json";

export const load = async ({ locals: { supabase }, params, fetch }) => {
    async function getResource() {
        let resourceId = params.resourceId;
        const ret = await apiService.get(`files/${resourceId}`)
        return ret;
    }

    async function getQuestion() {
        let id = params.id;
        const response = await apiService.get(`question-sets/${id}`);
        return response;
    }

    return {
        resourceData: getResource(),
        questionData: getQuestion()
    }
};
