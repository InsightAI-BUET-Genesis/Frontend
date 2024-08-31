import apiService from "$lib/apiService.js";
// @ts-nocheck
export const load = async ({ locals: { supabase }, params, fetch }) => {
    async function getResource() {
        let resourceId = params.resourceId;
        const ret = await apiService.get(`files/${resourceId}`)
        return ret;
    }

    async function getNote() {
        let noteId = params.noteId;
        const ret = await apiService.get(`notes/${noteId}`)
        ret.note = JSON.parse(ret.note)
        return ret;
    }

    return {
        resourceData: getResource(),
        noteData: getNote()
    }
};