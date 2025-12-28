
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// =============================================================================
// IMPORTANT: FIREBASE ADMIN SDK INITIALIZATION
// =============================================================================
// This code needs a Firebase service account to securely connect to your
// database from the backend.
//
// HOW TO SET THIS UP:
// 1. Go to your Firebase Project Settings > Service accounts.
// 2. Click "Generate new private key" and save the JSON file.
// 3. Go to your Netlify site settings > Build & deploy > Environment.
// 4. Add a NEW environment variable called FIREBASE_SERVICE_ACCOUNT.
// 5. Copy the ENTIRE contents of the JSON file you downloaded and paste it
//    as the value for the FIREBASE_SERVICE_ACCOUNT variable.
// =============================================================================

try {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (e) {
  console.error('Firebase admin initialization error', e.stack);
}


exports.handler = async (event, context) => {
  // Allow only POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const db = admin.firestore();

  try {
    // 1. Fetch Shopify Credentials from Firestore
    const credsDocRef = db.collection('company_stats').doc('shopify');
    const credsDocSnap = await credsDocRef.get();

    if (!credsDocSnap.exists) {
      console.error("Shopify credentials not found in Firestore.");
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Shopify credentials not found. Please add them in the Shopify settings.' })
      };
    }
    const creds = credsDocSnap.data();
    
    // Validate credentials
    if (!creds.storeUrl || !creds.apiPassword) {
        console.error("Incomplete Shopify credentials in Firestore.", creds);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Incomplete Shopify credentials in the database.' })
        };
    }

    // 2. Construct the Shopify API URL
    const shopifyUrl = `https://${creds.storeUrl}/admin/api/2023-10/products.json`;

    // 3. Fetch products from Shopify
    const response = await fetch(shopifyUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': creds.apiPassword, // This is the Admin API Access Token
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Shopify API Error: ${response.status} ${response.statusText}`, errorBody);
      return { 
        statusCode: response.status, 
        body: JSON.stringify({ error: `Shopify API responded with an error: ${response.statusText}` })
      };
    }

    const data = await response.json();

    // 4. Return the product data
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error("Internal Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `An internal error occurred: ${error.message}` })
    };
  }
};
