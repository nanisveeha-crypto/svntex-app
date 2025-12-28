
# Project Blueprint: SVNTEX Affiliate Marketing App

## 1. Overview

This document outlines the development plan for the SVNTEX Affiliate Marketing App. The goal is to create a robust system that manages affiliate onboarding, sales tracking, and a unique monthly income calculation based on personal performance and company-wide revenue.

## 2. Technical Stack

*   **Frontend:** React (with Vite)
*   **Styling:** Material-UI (MUI)
*   **Routing:** React Router DOM
*   **Backend:** Firebase (Firestore, Firebase Functions, Firebase Authentication)
*   **eCommerce:** Shopify
*   **Payment Gateway:** Razorpay

## 3. Business Logic & System Workflow

This section details the complete, end-to-end workflow of the affiliate system.

### 3.1. Affiliate Onboarding

1.  **Join:** A new user decides to become an affiliate by purchasing the specific "Affiliate Join SKU" from Shopify (a ₹4,000 product).
2.  **Payment & Webhook:** The user completes the purchase via Shopify. Upon successful payment (`order/paid` event), Shopify sends a webhook with the order data to our Firebase backend.
3.  **Account Creation:** A Firebase Function is triggered by the webhook.
    *   It verifies that the order contains the correct Affiliate Join SKU.
    *   It creates a new document in the `affiliates` collection in Firestore.
    *   The new affiliate account is initialized with the following data:
        *   `affiliate_id` (unique ID, can be the Firestore document ID)
        *   `referral_code` (a unique, shareable code)
        *   `self_pv` (Personal Volume): `0`
        *   `share_units`: `10` (initially **LOCKED**)
        *   `is_active`: `false`
        *   `wallet`: `0`
4.  **Dashboard Access:** The affiliate can now log in to their dashboard, where they will find their unique referral link/code.

### 3.2. Customer Purchase & Order Processing

1.  **Referral:** The affiliate shares their referral link.
2.  **Customer Purchase:** A customer clicks the link, is taken to the Shopify store, and purchases one or more standard products.
3.  **Order Webhook:** Shopify sends another `order/paid` webhook to the Firebase backend.
4.  **Order Handler (Firebase Function):**
    *   Receives the order data.
    *   Identifies the `referral_code` used for the purchase (this might be stored in cart attributes or customer tags).
    *   Maps the `referral_code` back to the `affiliate_id`.
    *   Calculates the Personal Volume (PV) for the order: `PV = order_value / pv_rate` (where `pv_rate` is a configurable value, e.g., 80).
    *   Saves the processed order details in a new `orders` collection in Firestore, linking it to the affiliate.

### 3.3. Affiliate Sales & Status Update

This logic is triggered immediately after an order is processed.

1.  **Update `self_pv`:** The calculated `PV` from the order is added to the affiliate's `self_pv`.
2.  **Update `company_monthly_pv`:** The `PV` is also added to a global `company_monthly_pv` counter.
3.  **Calculate `share_units`:** The affiliate's total `share_units` are recalculated: `share_units = FLOOR(self_pv / 500)`.
4.  **Activate Account:** If the affiliate's total `self_pv` becomes `>= 500`, their status is updated: `is_active = true`. This unlocks their initial 10 share units and makes them eligible for monthly income.

### 3.4. Month-End Income Calculation

This process is run automatically at the end of each month (e.g., via a scheduled Firebase Function).

1.  **Calculate Active Units per Affiliate:**
    *   The system iterates through each affiliate.
    *   It checks if `is_active = true`.
    *   It calculates the PV required to maintain their units for the month: `required_pv = share_units * 50`.
    *   It compares this with the affiliate's `monthly_self_pv` (a temporary counter that resets each month).
    *   If `monthly_self_pv >= required_pv`, the affiliate's `active_units` for the month are equal to their `share_units`.
    *   Otherwise, their `active_units` for the month are `0`.
2.  **Calculate Total Active Units:** The system sums up the `active_units` from all eligible affiliates to get `total_active_units` for the month.
3.  **Calculate Affiliate Income:**
    *   The income for each eligible affiliate is calculated with the formula:
        `affiliate_income = (active_units / total_active_units) * company_monthly_pv`
    *   The calculated `affiliate_income` is added to the affiliate's `wallet` balance.

### 3.5. Payout

*   The final wallet balance is displayed in the affiliate's dashboard.
*   Payouts to the affiliate's bank/UPI are handled by an admin, either manually or through a separate automated process.

## 4. Development Plan

**Current Task:** Refactor the user onboarding flow to align with the new model.

*   **Step 1:** Modify the frontend to remove the multi-plan selection. Create a simple "Join Now" page or button that directs users to the single Shopify product for joining.
*   **Step 2:** Set up Firebase Functions and create the initial webhook endpoint to receive `orders/paid` data from Shopify.
*   **Step 3:** Implement the affiliate account creation logic within the Firebase Function as detailed in section 3.1.
npx ngrok http 5001
