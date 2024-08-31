import type { RequestHandler } from "@sveltejs/kit";
import { insertUser } from "$lib/server/queries"

export const POST: RequestHandler = async (event) => {
    const formData = await event.request.formData();

    // Extract data from formData
    const userId = formData.get('userId') as string;
    const userName = formData.get('userName') as string;
    const email = formData.get('email') as string;

    // console.log(userName, email)

    // Create the new bank company object
    const newUser = {
        userId,
        userName,
        email
    };

    console.log(newUser);

    // Insert the new bank company into the database
    await insertUser(newUser);

    return new Response('User Registered successfully');
}