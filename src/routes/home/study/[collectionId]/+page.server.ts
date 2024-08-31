import apiService from "$lib/apiService.js";

export const load = async ({ locals: { supabase }, params, fetch }) => {
    async function getCollection() {
        let collectionId = params.collectionId
        const ret = await apiService.get(`collections/${collectionId}`)
        return ret;
    }

    async function getResources() {
        let collectionId = params.collectionId
        const ret = await apiService.get(`files/collection/${collectionId}`)
        return ret;
    }

    return {
        collectionData: getCollection(),
        resourceList: getResources()
    }
};
