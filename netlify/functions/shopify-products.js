
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // This function now only supports GET requests
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    console.log("Attempting to fetch products from Shopify...");

    // 1. Get Shopify credentials from Netlify environment variables
    const { SHOPIFY_STORE_URL, SHOPIFY_API_PASSWORD } = process.env;

    if (!SHOPIFY_STORE_URL || !SHOPIFY_API_PASSWORD) {
        console.error("CRITICAL: Missing Shopify environment variables (SHOPIFY_STORE_URL or SHOPIFY_API_PASSWORD). Go to your Netlify site's 'Deploy settings' > 'Environment' and set these values.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration error: Shopify credentials are not set.' })
        };
    }
    console.log("SUCCESS: Found Shopify credentials in environment variables.");

    // 2. Construct the Shopify API URL
    const shopifyUrl = `https://${SHOPIFY_STORE_URL}/admin/api/2023-10/products.json`;
    console.log(`Attempting to fetch products from Shopify URL: ${shopifyUrl}`);

    try {
        // 3. Make the request to the Shopify API
        const response = await fetch(shopifyUrl, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_API_PASSWORD,
                'Content-Type': 'application/json',
            },
        });

        // 4. Handle the response from Shopify
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`ERROR: Shopify API responded with status ${response.status}. Body:`, errorBody);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Shopify API error: ${response.statusText}` })
            };
        }

        const data = await response.json();
        console.log(`SUCCESS: Received ${data.products?.length || 0} products from Shopify.`);

        // 5. Return the product data
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error("FATAL: An unexpected error occurred while fetching from Shopify.", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `An internal error occurred: ${error.message}` })
        };
    }
};
