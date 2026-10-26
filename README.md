# The O.C.D.'s Cafe — Tablet POS & Order Management System

A production-grade, tablet-optimized Point of Sale (POS), Kitchen Order Tracking, and Cafe Management application built for **The O.C.D.'s Cafe**. Designed with a warm cream-white and light-brown palette, zero-VAT billing, customer ticket numbers from 1 to 30, and 100% persistent offline-first local storage.

---

## 🌟 Key Features

### 1. 📱 Tablet-First POS Terminal
- **Customer Numbers 1–30**: Quick-tap customer/table selection grid (auto-increments upon completion).
- **Fast Touch Ordering**: Organized food & drink categories (Rice Meals, Burgers, Sandwiches, Pizza, Snacks, Espresso, Iced Drinks, Frappes, Milk Teas).
- **Size Variations**: Smooth modal for size variants (e.g. 16oz, 22oz, Solo, Medium, Large) with real-time price updates.
- **Discounts**: Built-in 20% Senior Citizen / PWD discount or custom % discount calculator.
- **Zero-VAT Compliance**: Subtotal matches total exactly without tax additions or deductions.
- **Tender Methods**: Cash (with instant change calculation), GCash QR / reference number, and Card payment.
- **Thermal Receipt Modal**: Itemized customer receipts with customer number, digital signature hash, and instant print support.

### 2. 🔔 Kitchen & Counter Order Status Panel
- **3-Stage Workflow**:
  - 🍳 **Preparing**: Kitchen/barista preparation queue.
  - 🔔 **Serving**: Order ready at counter; calls Customer #1–30.
  - ✅ **Served**: Claimed by customer; concludes order ticket.
- **One-Tap Status Progression**: Fast buttons to advance tickets through each stage.
- **Customer #1–30 Quick Jump Filter**: Instantly isolate tickets for any specific customer table.

### 3. 💾 100% Data Persistence & Backup
- **Session Continuity**: All transactions, staff credentials, custom prices, and active tickets are saved synchronously to browser local storage. Data is preserved even after locking, logging out, refreshing, or closing the tablet browser.
- **Window Exit Flusher**: Automatically saves latest memory state upon `beforeunload` or `pagehide`.
- **JSON Backup & Restore**: One-click full database export (`.json`) and instant backup file restore for device transfers or cold backups.

### 4. 🍽️ Menu & Price Management
- Admin control to add, edit, or remove menu items and categories.
- Update base prices, item descriptions, and multi-size variant pricing on the fly.
- Real-time catalog updates reflected across the POS terminal.

### 5. 👥 Staff & Security Module
- **Starting Admin**: **Kuya Nats** (Default PIN: `1234`).
- **PIN Pad Lock Screen**: Fast 4-digit tablet PIN unlock or password login.
- **Role-Based Access Control**: Admin, Cashier, Barista, Kitchen roles.
- **PIN & Password Management**: Admin can change their own PIN/password and update credentials for all team members.
- **Real-Time Staff Productivity**: Live tracking of individual sales revenue, orders handled, and average ticket size.
- **Shift Clock-In / Clock-Out**: Quick shift tracking per employee.

### 6. 📊 Real-Time Cloud Dashboard & Reports
- Live revenue, average order value, active kitchen tickets, and staff rankings.
- Weekly and daily sales breakdowns with top-performing menu item analysis.
- Live Customer Orders Stream with status chips.

### 7. 📸 Authentic Store Signage Reference
- Built-in photo viewer displaying original store menu boards and branding.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Storage**: React Context + Safe Synchronous `localStorage` + JSON Import/Export
- **Cryptography**: Web Crypto API (SHA-256 digital signature hashes for receipt verification)

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` or `pnpm` or `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/the-ocd-cafe-pos.git
   cd the-ocd-cafe-pos
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

4. **Build for production:**
   ```bash
   npm run build
   ```
   The production-ready output will be in the `dist/` directory.

---

## 🔐 Default Credentials

| User | Role | Default PIN | Default Password |
|---|---|---|---|
| **Kuya Nats** | Admin | `1234` | `admin123` |

*PINs and passwords can be modified at any time in the **Staff & Security** panel.*

---

## 📂 Project Directory Structure

```text
├── public/
│   └── assets/aistudio/       # Brand logo & store signage reference photos
├── src/
│   ├── components/
│   │   ├── auth/              # 4-Digit Tablet PIN Pad & Lock Screen
│   │   ├── common/            # Header, Menu Board Reference Modal
│   │   ├── dashboard/         # Real-time Cloud Dashboard
│   │   ├── orders/            # Order Status Panel (Preparing/Serving/Served)
│   │   ├── pos/               # POS Terminal, Size Selector, Checkout & Receipt Modals
│   │   ├── products/          # Menu & Price Manager
│   │   ├── reports/           # Financial & Sales Reporting
│   │   ├── schedule/          # Staff Shift Scheduler
│   │   └── staff/             # Staff Management, PIN change & Storage Backups
│   ├── context/
│   │   └── AppContext.tsx     # Centralized State with Synchronous Persistent Storage
│   ├── data/
│   │   └── initialData.ts     # Authentic Menu items, categories & default staff
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces (Product, Order, Staff, etc.)
│   ├── utils/
│   │   ├── crypto.ts          # Encrypted receipt hashes & digital signatures
│   │   └── formatters.ts      # Currency (PHP ₱) and timestamp helpers
│   ├── App.tsx                # App root & navigation router
│   ├── index.css              # Tailwind CSS styles & custom scrollbars
│   └── main.tsx               # Entry point
├── index.html                 # HTML template with custom metadata
├── metadata.json              # AI Studio applet metadata
├── package.json               # Dependencies & build scripts
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite configuration
```

---

## 📤 How to Upload to GitHub

Follow these steps to upload this project to your GitHub account:

### Method 1: Using the Command Line (Recommended)

1. **Create a new repository on GitHub:**
   - Go to [github.com/new](https://github.com/new).
   - Enter repository name: `the-ocd-cafe-pos` (or any name you prefer).
   - Leave it empty (do **not** check "Add a README file").
   - Click **Create repository**.

2. **In your project terminal, initialize and push:**
   ```bash
   # Initialize git if not already done
   git init -b main

   # Add all files to staging
   git add .

   # Commit the files
   git commit -m "Initial commit: The O.C.D.'s Cafe POS & Order Management System"

   # Link your GitHub repository (replace with your GitHub URL)
   git remote add origin https://github.com/<your-username>/the-ocd-cafe-pos.git

   # Push to GitHub
   git push -u origin main
   ```

### Method 2: Using GitHub CLI (`gh`)

If you have GitHub CLI installed:
```bash
gh repo create the-ocd-cafe-pos --public --source=. --remote=origin --push
```

---

## 📄 License

This project is licensed under the Apache-2.0 License.
