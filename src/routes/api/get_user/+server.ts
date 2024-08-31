
import type { RequestHandler } from "@sveltejs/kit";
import { getUser } from "$lib/server/queries"

export const POST: RequestHandler = async (event) => {
    const formData = await event.request.formData();

    // Extract data from formData
    const userId = formData.get('userId') as string;

    // console.log(companyId)

    // Insert the new bank company into the database
    const res = await getUser(userId);
    // console.log(res)

    return new Response(
        JSON.stringify(res)
    )
}