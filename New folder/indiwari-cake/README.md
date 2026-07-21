# Indiwari Cake 🎂
## QR-Based Cake Order Management System

**Developer:** R.M.H.K. Bandaranayake (KUR/IT/2324/F/0029)  
**Institution:** SLIATE — ATI Kurunegala | HND in IT — Batch 2324(FT)  
**Module:** IT4052 | ICT Project

---

## Project Overview

Indiwari Cake digitises the complete order management lifecycle for a home-based cake business in Sri Lanka. Customers browse the online menu, place orders, and receive a unique QR code. The QR code links to a public order-tracking page — no login required — showing real-time delivery status.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MySQL (XAMPP locally, cloud MySQL in production) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| QR Code | qrcode (backend), qrcode.react (frontend) |
| Email | Nodemailer (Gmail SMTP) |
| Images | Cloudinary |
| Deployment | Vercel (frontend) + Render (backend) |

## Local Development Setup

### Prerequisites
- Node.js v20+
- XAMPP (MySQL running)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/indiwari-cake.git
cd indiwari-cake
```

### 2. Set up the database
1. Open XAMPP, start MySQL
2. Open phpMyAdmin → create database `indiwari_db`
3. Run: `mysql -u root indiwari_db < backend/database/schema.sql`
4. Run: `mysql -u root indiwari_db < backend/database/seed.sql`

### 3. Set up the backend
```bash
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
# API running at http://localhost:5000
```

### 4. Set up the frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# App running at http://localhost:5173
```

## Module Progress

| Module | Description | Status |
|---|---|---|
| M1 | Project Foundation & Environment Setup | ✅ Complete |
| M2 | Database Setup | ⬜ Pending |
| M3 | Authentication & RBAC | ⬜ Pending |
| M4 | Cake Menu Management | ⬜ Pending |
| M5 | Customer Ordering | ⬜ Pending |
| M6 | QR Code Order Display | ⬜ Pending |
| M7 | Delivery Tracking | ⬜ Pending |
| M8 | Customer Management | ⬜ Pending |
| M9 | Email Notifications | ⬜ Pending |
| M10 | Admin Dashboard & Reports | ⬜ Pending |
| M11 | Marketing Landing Page | ⬜ Pending |
| M12 | Testing | ⬜ Pending |
| M13 | Deployment | ⬜ Pending |

## License
MIT