import { BACKEND_URL } from '$lib/config';
import { redirect, type Actions } from '@sveltejs/kit';
import {supabaseClient} from '$lib/supabaseClient';
import apiService from '$lib/apiService.js';

export const load = async ({locals:{supabase}, params, fetch}) => {
    async function getUser(){
        let userId = (await supabase.auth.getUser()).data.user?.id
        console.log(userId)
        const ret = await apiService.get(`users/get-user/${userId}`);
        return ret;
    }

    return {
        userData: getUser()
    }
};

export const actions = {
    update: async (event) => {
        const formData = await event.request.formData();
        let data = Object.fromEntries(formData.entries()) as any;

        if (data.profilePic.size != 0) {

            let timestamp = new Date().getTime();
            let name = timestamp + '_' + data.userName;

            const { data: res, error: err } = await supabaseClient.storage
                .from('users')
                .upload(name, data.profilePic, {
                    cacheControl: '3600',
                    upsert: true
                });

            console.log(res)
            console.log(err)

            const { data: link } = await supabaseClient.storage.from('users').getPublicUrl(name);
            data.profilePictureUrl = link.publicUrl
        }
        delete data.profilePic;

        const ret = await fetch(`${BACKEND_URL}/users/update/${data.userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        console.log(data)
        console.log(ret.status)

        if (ret.ok) {
            return {
                success: true,
                message: "Profile Successfully Updated"
            };
        }
        else {
            return {
                success: false,
                message: "Some error occured"
            };
        }


    }
} satisfies Actions;