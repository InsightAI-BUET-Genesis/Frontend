import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import { BACKEND_URL } from '$lib/config.js';

export const load = async (event) => {
    const form = await superValidate(event, userSchema);
    return { form }
};



const userSchema = z.object({
    name: z
        .string({ required_error: 'Your Name is required' })
        .min(3, { message: 'At least 3 characters' })
        .max(256, { message: 'At most 256 characters' }),
    email: z
        .string({ required_error: 'Your Email is required' })
        .min(1, { message: 'Email is required' })
        .max(256, { message: 'Email must be less than 256 characters' })
        .email({ message: 'Email must be a valid email address' }),

    password: z
        .string({ required_error: 'Password is required' })
        .min(8, { message: 'Password must be at least 8 characters' })
        .max(32, { message: 'Password must be less than 32 characters' })
        .regex(new RegExp('.*[A-Z].*'), 'Password must contain at least one uppercase character')
        .regex(new RegExp('.*[a-z].*'), 'Password must contain at least one lowercase character')
        .regex(new RegExp('.*\\d.*'), 'Password must contain at least one number')
        .regex(
            new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
            'Password must contain at least one special character'
        )
        .trim()
});

const deployPathLogin = "http://localhost:5173/login"
export const actions = {
    register: async (event) => {


        const form = await superValidate(event, userSchema);
        // console.log(form);

        if (!form.valid) {
            return message(form, 'Invalid form')
        }

        const body = form.data;
        console.log(body)



        const { data: dtt, error: err } = await event.locals.supabase.auth.signUp({
            email: body.email as string,
            password: body.password as string,
            options: {
                emailRedirectTo: deployPathLogin,
            },
        });


        console.log(dtt, err)

        if (dtt.user && dtt.user.identities && dtt.user.identities.length === 0) {
            return message(form, 'Email already in use', {
                status: 400
            });
        }

        console.log("Attempt done")

        if (err) {
            console.log(err); //------------------------------------------> this is where I am getting the bug
            if (err instanceof AuthApiError && err.status === 400) {
                return message(form, 'Invalid credentials', {
                    status: 400
                })
            }

            return message(form, 'Server error. Try again later', {
                status: 500
            })
        }
        else {

            console.log("Attempt Successful")

            const formData = new FormData();
            formData.append('userId', dtt.user!.id);
            formData.append('userName', body.name);
            formData.append('email', body.email);

            const ret = await event.fetch(`${BACKEND_URL}/users/register`, {
                method: 'POST',
                body: formData
            })

            return message(form, 'SignUp Successful. Check Inbox', {
                status: 400
            })

        }

    }
};