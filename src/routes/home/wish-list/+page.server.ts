import apiService from "$lib/apiService.js";
// @ts-nocheck

export const load = async ({ locals: { supabase }, params, fetch }) => {
    async function getProducts() {
        let userId = (await supabase.auth.getUser()).data.user!.id
        const ret = await apiService.get(`cart/${userId}`);

        if (ret) {
            const products = await apiService.postPython('product_retrieve/retrieve-multiple', { product_ids: ret["productIds"] })
            const recommendations = await apiService.postPython('product_retrieve/retrieve-similar-multiple', { product_ids: ret["productIds"] })

            // console.log(ret["productIds"])
            // console.log(recommendations)

            if(products && recommendations){
                
                return {
                    products: products['products'],
                    recommendations: recommendations['products']
                }
            }
            return {
                products: [],
                recommendations: []
            }
        }

        return {
            products: [],
            recommendations: []
        }
    }

    return {
        productList: getProducts()
    }
}