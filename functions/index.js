const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const crypto = require("crypto");

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();
const app = express();

const SHOPIFY_WEBHOOK_SECRET = "0f4c25e00fd773084cf3eb0bfd1728ebc83ecd20b460687d9079d2870fe1339b";

// Use express.json() with a 'verify' callback to get the raw body.
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

const verifyShopifyWebhook = (req, res, next) => {
    const hmac = req.get("X-Shopify-Hmac-Sha256");
    const rawBody = req.rawBody;

    if (!rawBody) {
        console.error("❌ Raw body buffer not found. Cannot verify webhook.");
        return res.status(400).send("Bad Request: Missing raw body.");
    }
    
    try {
        const hash = crypto
            .createHmac("sha256", SHOPIFY_WEBHOOK_SECRET)
            .update(rawBody) 
            .digest("base64");

        if (hmac === hash) {
            console.log("✅ Shopify webhook signature verified.");
            next(); // Signature is valid, proceed.
        } else {
            console.error("❌ HMAC signature mismatch.");
            return res.status(401).send("Unauthorized: Invalid signature.");
        }
    } catch (error) {
        console.error("🔥 Error during HMAC computation:", error);
        return res.status(500).send("Internal Server Error during verification.");
    }
};

const handleWebhook = async (req, res) => {
    const topic = req.get("X-Shopify-Topic");
    console.log(`- Webhook received. Topic: ${topic}`);

    try {
        // UPDATED: Now listening for the correct 'orders/paid' topic.
        if (topic === 'orders/paid') { 
            console.log("-- Processing 'orders/paid' topic --");
            const orderData = req.body;

            const customerEmail = orderData.customer && orderData.customer.email;
            const orderPV = parseFloat(orderData.total_price);

            if (!customerEmail) {
                console.log("No customer email in payload. Skipping.");
                return res.status(200).send("Webhook handled, but no customer email.");
            }

            console.log(`Processing order for ${customerEmail} with PV of ${orderPV}.`);
            
            // 1. Always increment company PV first. This is for ALL sales.
            const companyRef = db.collection('company_stats').doc('monthly_pv');
            await companyRef.set({ pv: admin.firestore.FieldValue.increment(orderPV) }, { merge: true });
            console.log(`Incremented company_monthly_pv by ${orderPV}.`);

            // 2. Now, check if the customer is also a registered affiliate user.
            const usersRef = db.collection('users');
            const querySnapshot = await usersRef.where('email', '==', customerEmail).limit(1).get();

            // 3. If they ARE an affiliate, update their personal stats.
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();
                const userId = userDoc.id;
                console.log(`Found affiliate user: ${userId}. Updating their stats.`);

                const currentSelfPV = userData.self_pv || 0;
                const newSelfPV = currentSelfPV + orderPV;
                const newShareUnits = Math.floor(newSelfPV / 500);

                const userUpdateData = {
                    self_pv: newSelfPV,
                    share_units: newShareUnits,
                };

                // Activate user if they cross the threshold
                if (newSelfPV >= 500 && !userData.is_active) {
                    userUpdateData.is_active = true;
                    console.log(`User ${userId} has been activated.`);
                }

                await db.collection('users').doc(userId).update(userUpdateData);
                console.log(`Updated user ${userId}: self_pv=${newSelfPV}, share_units=${newShareUnits}`);
            } else {
                 // 4. If they are NOT an affiliate, just log it. This is normal.
                console.log(`No affiliate user found for email: ${customerEmail}. Company PV was updated.`);
            }
            
            console.log("-- Successfully processed 'orders/paid' --");
            return res.status(200).send("Webhook processed successfully.");

        } else {
            console.log(`-- Ignoring topic: '${topic}' --`);
            return res.status(200).send(`Webhook received. Topic '${topic}' is not processed.`);
        }
    } catch (error) {
        console.error("🔥 FATAL ERROR in webhook handler:", error);
        return res.status(500).send("Internal Server Error while processing webhook.");
    }
};

app.post("/shopify-webhook", verifyShopifyWebhook, handleWebhook);

exports.api = functions.https.onRequest(app);