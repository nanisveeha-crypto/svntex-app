
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Wrap the entire initialization in a function to log errors more effectively
function initializeFirebase() {
    console.log("Attempting to initialize Firebase Admin SDK...");

    // 1. Check if the environment variable exists at all
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.error("CRITICAL: FIREBASE_SERVICE_ACCOUNT environment variable is NOT SET.");
        return false; // Stop initialization
    }
    console.log("SUCCESS: FIREBASE_SERVICE_ACCOUNT environment variable was found.");

    // 2. Try to parse the environment variable
    let serviceAccount;
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log("SUCCESS: Environment variable was parsed as JSON successfully.");
    } catch (e) {
        console.error("CRITICAL: Failed to parse FIREBASE_SERVICE_ACCOUNT. The JSON is invalid.", e.message);
        return false; // Stop initialization
    }

    // 3. Try to initialize the Firebase app
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("SUCCESS: Firebase Admin SDK initialized successfully.");
        } else {
            console.log("INFO: Firebase Admin SDK was already initialized.");
        }
        return true; // Initialization successful
    } catch (e) {
        console.error("CRITICAL: admin.initializeApp failed.", e.stack);
        return false; // Stop initialization
    }
}

// Run the initialization
const isFirebaseInitialized = initializeFirebase();

exports.handler = async (event, context) => {
    // Check if Firebase is even initialized before proceeding
    if (!isFirebaseInitialized) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Firebase Admin SDK failed to initialize. Check the function logs.' })
        };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const db = admin.firestore();
    console.log("Attempting to fetch Shopify credentials from Firestore...");

    try {
        const credsDocRef = db.collection('company_stats').doc('shopify');
        const credsDocSnap = await credsDocRef.get();

        if (!credsDocSnap.exists) {
            console.error("ERROR: Shopify credentials document not found in Firestore.");
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Shopify credentials not found in Firestore.' })
            };
        }
        
        const creds = credsDocSnap.data();
        console.log("SUCCESS: Fetched Shopify credentials from Firestore.");

        if (!creds.storeUrl || !creds.apiPassword) {
            console.error("ERROR: Incomplete credentials in Firestore document.", creds);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Incomplete Shopify credentials in the database.' })
            };
        }

        const shopifyUrl = `https://${creds.storeUrl}/admin/api/2023-10/products.json`;
        console.log(`Attempting to fetch products from Shopify URL: ${shopifyUrl}`);

        const response = await fetch(shopifyUrl, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': creds.apiPassword,
                'Content-Type': 'application/json',
            },
        });

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

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error("FATAL: An unexpected error occurred in the handler.", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `An internal error occurred: ${error.message}` })
        };
    }
};
