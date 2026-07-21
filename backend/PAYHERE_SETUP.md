# PayHere Payment Gateway Setup

Cash on Delivery has been removed. Orders now use PayHere online payment.

## 1. Database migration

Run:

```sql
backend/database/migrations/003_add_payhere_payment.sql
```

If you are creating a fresh database, use the updated `backend/database/indiwari_complete.sql`.

## 2. Backend `.env`

Copy the values from `backend/.env.example` into your backend `.env`:

```env
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

PAYHERE_SANDBOX=true
PAYHERE_MERCHANT_ID=YOUR_MERCHANT_ID
PAYHERE_MERCHANT_SECRET=YOUR_MERCHANT_SECRET
```

Use `PAYHERE_SANDBOX=true` for testing. Set it to `false` for live payments.

## 3. PayHere account

Create/get the Merchant ID and Merchant Secret from the PayHere merchant dashboard and add them to `.env`.

The PayHere notification URL must be publicly reachable by PayHere. For local testing, use a public tunnel such as your approved development tunnel URL and set:

```env
BACKEND_URL=https://your-public-backend-domain.com
```

## 4. Payment flow

1. Customer fills checkout details.
2. Backend creates the order.
3. Backend creates the PayHere hash securely.
4. Customer is redirected to PayHere.
5. PayHere sends a signed notification to:
   `/api/payments/payhere/notify`
6. Backend verifies the signature, amount, currency, and updates:
   - `payment_status`
   - `payment_id`
7. Customer returns to the order detail page.

Never put `PAYHERE_MERCHANT_SECRET` in the frontend.
