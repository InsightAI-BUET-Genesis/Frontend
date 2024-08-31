import mockProjects from "$lib/data/mockProjects.json";
import apiService from "$lib/apiService.js";
// @ts-nocheck

export const load = async ({ locals: { supabase }, params, fetch }) => {
    async function getProject() {
        let projectId = params.projectId;
        const response = await apiService.get(`projects/${projectId}`)
        if (response.tasks) {
            response.tasks = JSON.parse(response.tasks);
            response.tasks = response.tasks.map((task) => ({
                ...task
            }));
        }
        if (response.tags) {
            response.tags = response.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag !== '');
        }

        if(response.searchResults){
            response.searchResults = JSON.parse(response.searchResults)
        }

        return response
    }


    return {
        projectData: getProject()
    }
};