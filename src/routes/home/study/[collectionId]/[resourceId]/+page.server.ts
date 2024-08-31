import apiService from "$lib/apiService.js";

export const load = async ({ locals: { supabase }, params, fetch }) => {
    async function getResource() {
        let resourceId = params.resourceId;
        const ret = apiService.get(`files/${resourceId}`)
        return ret;
    }

    return {
        resourceData: getResource()
    }
};
