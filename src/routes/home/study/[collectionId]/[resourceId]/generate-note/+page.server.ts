import mockNotes from "$lib/data/mockNotes.json";
import apiService from "$lib/apiService.js";

export const load = async ({ locals: { supabase }, params, fetch }) => {
    async function getResource() {
        let resourceId = params.resourceId;
        const ret = await apiService.get(`files/${resourceId}`)
        return ret;
    }
    async function getCollection() {
        let collectionId = params.collectionId
        const ret = await apiService.get(`collections/${collectionId}`)
        return ret;
    }

    async function getNotes() {
        let resourceId = params.resourceId;
        const ret = await apiService.get(`notes/resource/${resourceId}`)
        return ret;
    }

    return {
        collectionData: getCollection(),
        resourceData: getResource(),
        noteList: getNotes()
    }
};
