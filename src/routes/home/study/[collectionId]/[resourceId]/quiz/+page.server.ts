import apiService from "$lib/apiService.js";
import mockQuestions from "$lib/data/mockQASets.json";

export const load = async ({ locals: { supabase }, params, fetch }) => {
    async function getResource() {
        let resourceId = params.resourceId;
        const ret = await apiService.get(`files/${resourceId}`)
        return ret;
    }

    async function getQuestionSets() {
        let resourceId = params.resourceId;
        const response = await apiService.get(`question-sets/resource/${resourceId}`);
        return response;
    }

    return {
        resourceData: getResource(),
        questionSets: getQuestionSets()
    }
};
