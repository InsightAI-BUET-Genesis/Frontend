import mockProjects from "$lib/data/mockProjects.json";
import apiService from "$lib/apiService.js";
// @ts-nocheck

export const load = async ({ locals: { supabase }, params, fetch }) => {

    // async function getProjects() {
    //     return new Promise((resolve) => {
    //         setTimeout(() => {
    //             resolve(mockProjects);
    //         }, 100);
    //     });
    // }

    async function getProjects() {
        let userId = (await supabase.auth.getUser()).data.user?.id
        const response = await apiService.get(`projects/user/${userId}`)

        if (response) {
            response.forEach((element) => {
                // console.log(element);
                if (element.tags) {
                    element.tags = element.tags
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter((tag) => tag !== '');
                }
            });
        }
        else {
            response = []
        }

        return response
    }


    return {
        projectList: getProjects()
    }
};