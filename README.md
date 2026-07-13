# Indiwari Cake — Order Management System

A full-stack cake ordering system: Node.js/Express + MySQL backend, React (Vite) frontend.
Customers browse the menu, place orders, and get a QR code they can scan to track delivery status.
Admins manage the menu, orders, customers, and view sales reports.

---

## ✅ What was fixed in this pass

The project had several real bugs that would have broken the site. All are fixed now:

1. **Frontend wouldn't build at all** — the bundled `node_modules` was missing the native
   Linux binding for Vite's bundler (it was likely installed on Windows/Mac and zipped as-is).
   Fixed by deleting `node_modules`/`package-lock.json` and reinstalling clean.
2. **QR code order-tracking page was completely unreachable** — `qrRoutes.js` existed and
   worked, but `app.js` never mounted it. Anyone scanning a QR code got a 404. Now mounted at
   `/order/:token`.
3. **QR code was never generated when an order was placed** — `qr_code_data_url` stayed `NULL`
   forever unless an admin manually called a "regenerate" endpoint that also wasn't wired up.
   Both are now fixed: QR is generated at order creation and the admin regenerate route exists.
4. **New orders never got an initial status-history entry** — `order_status_history` stayed
   empty until the first admin status change. Now the "Pending" entry is recorded immediately.
5. **Admin dashboard summary cards always showed blank/zero** — a destructuring bug in
   `reportService.js` (`db.query()` returns `[rows, fields]`, code only unwrapped one level)
   meant every card silently evaluated to `NaN`, which JSON serializes as `null`. Fixed.
6. **Empty database** — `backend/database/migrations` was empty, so a fresh install had no
   tables at all (this matches the screenshot you sent showing `menu_items` returning 0 rows).
   The real schema was sitting unused inside an accidentally-committed duplicate nested git
   repo (`indiwari-cake/`). That schema + seed data has been moved into
   `backend/database/migrations/001_schema.sql` and `backend/database/seed.sql` where they
   belong, and the duplicate nested repo has been deleted.
7. **Dead/duplicate scaffolding removed** — `backend/controllers`, `backend/models`,
   `backend/routes/*.js` (old dummy stub versions, superseded by `backend/src/*`) and
   `frontend/src/components/guards/*` (an earlier, unused version of the route guards) have
   been deleted so they don't cause confusion later.
8. **Exposed real credentials** — the uploaded `.env` contained a real Cloudinary API secret
   and a real Gmail App Password. These have been replaced with placeholders in this delivery.
   **Please rotate both immediately** (regenerate the Cloudinary secret in your Cloudinary
   dashboard, and revoke/regenerate the Gmail App Password at
   https://myaccount.google.com/apppasswords) since they were shared in the file you uploaded.
9. Removed an unused, deprecated `crypto` npm package (Node's built-in `crypto` module was
   always being used anyway; the extra dependency was just confusing dead weight).
10. Cleaned up ~30 ESLint errors (unused `React` imports left over from the old JSX transform,
    unused `catch` variables). The app worked fine either way — this is just cleanup.

Everything above was verified by actually running the backend against a real MySQL database,
hitting every API route with curl (register, login, place order, QR lookup, admin dashboard,
reports, customers), and building the frontend with `vite build`.

---

## 🚀 How to run it locally

You need **Node.js 18+** and **MySQL** (XAMPP works fine) installed.

### 1. Database
Start MySQL/XAMPP, then create the database and load the schema + sample data:
```bash
mysql -u root -e "CREATE DATABASE indiwari_db;"
mysql -u root indiwari_db < backend/database/migrations/001_schema.sql
mysql -u root indiwari_db < backend/database/seed.sql
```
This creates a working admin login:
- **Email:** `admin@indiwari.lk`
- **Password:** `Admin@1234`

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env      # then fill in your real Cloudinary + Gmail credentials
npm run dev                # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Open `http://localhost:5173` in your browser. Register a customer account, browse the menu,
place an order, then check the admin panel at `/admin` (log in with the admin account above)
to see it, update its status, and view the auto-generated QR code / reports.

### Postman collection
`postman/IndiwariCake_API.postman_collection.json` has ready-made requests for every endpoint,
paired with `postman/IndiwariCake_local.postman_environment.json`.

---

## 📁 Project structure
```
backend/            Express API (MySQL via mysql2, JWT auth, Cloudinary uploads, email)
  src/
    config/          DB, Cloudinary, Nodemailer setup
    controllers/      Route handler logic
    middleware/       Auth, role checks, validators, file upload
    routes/           Express routers, mounted from app.js
    services/         Business logic / DB queries
    templates/        HTML email templates
  database/
    migrations/       001_schema.sql — run this first on a fresh DB
    seed.sql           Admin user + sample menu items
frontend/            React 19 + Vite + Tailwind
  src/
    pages/             One file per route/screen
    components/        Reusable UI pieces (menu, order, admin, landing, common)
    context/            Auth + cart global state
    api/                Axios instance with JWT interceptor
postman/             API testing collection
```
