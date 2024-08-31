import { BACKEND_URL } from '$lib/config.js';

export const load = async ({ locals: { supabase }, fetch }) => {
    // Get the user from Supabase
    const { data: { user } } = await supabase.auth.getUser();
    // console.log(user);

    
    // const formData = new FormData();
    // formData.append('userId', user.id);

    // Use event.fetch instead of global fetch
    const res = await fetch(`${BACKEND_URL}/users/get-user/${user!.id}`, {
        method: 'GET'
    });

    
    const data = await res.json();
    const userInfo = data
    // console.log(data);

    let authUser = user
    return { authUser, userInfo: userInfo };
};