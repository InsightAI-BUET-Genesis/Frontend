import apiService from "$lib/apiService.js";

export const load = async ({ locals: { supabase }, params, fetch }) => {
    async function getCollections() {
        let userId = (await supabase.auth.getUser()).data.user?.id
        const ret = await apiService.get(`collections/user/${userId}`)
        return ret;
    }

    return {
        collectionList: getCollections()
    }
};