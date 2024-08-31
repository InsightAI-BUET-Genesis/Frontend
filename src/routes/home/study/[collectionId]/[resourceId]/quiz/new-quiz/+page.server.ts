import apiService from "$lib/apiService.js";
import mockQuestions from "$lib/data/mockQASets.json";

export const load = async ({ locals: { supabase }, params, fetch }) => {
    async function getResource() {
        let resourceId = params.resourceId;
        const ret = await apiService.get(`files/${resourceId}`)
        return ret;
    }

    async function getCollection() {
        let collectionId = params.collectionId;
        const ret = await apiService.get(`collections/${collectionId}`)
        return ret;
    }

    return {
        resourceData: getResource(),
        collectionData: getCollection()
    }
};
