# 🧵 Maurya Collections

> A professional mobile ledger and clothing reservation application optimized for managing weekly apparel shipments, customer styles, and collection tracking across village routes.

Maurya Collections is a dual-perspective digital catalog and reservation pipeline. It bridges the gap between rural/local clothes distribution networks and collection administration. Visitors can view the latest listing styles, customize orders, and register interest, while administrators can oversee the inventory database, update order status, and track routes in real-time.

---

## 🌟 Key Features

### 👤 Customer Terminal
- **Interactive Style Catalog**: Explore high-contrast clothing cards, complete with multi-image carousels, category filtering (Apparel, etc.), and price ranges.
- **Tailored Interest Reservations**: Customize custom clothing requests with specified sizing, color preferences, target age groups (e.g., Kids, Adults), and recipient name.
- **Village Route Designation**: Route each order request to a specific distribution village (e.g., Rampur) for seamless weekly shipment grouping.
- **Community Engagement**: Save/favorite clothing styles instantly to influence supply ledger priorities.

### 💼 Seller Terminal (Admin Management Portal)
- **Secure Dual Authentication**:
  - **Google Sign-In integration**: Authorizes the designated administrator account to connect with cloud database permissions.
  - **Credential Fallback Mode**: Permits access using secure administrator credentials for local operations.
- **Product Catalog Customization**:
  - Add newly launched apparel models with detailed descriptors, sizing ranges, prices, and high-quality image links.
  - Instantly toggle styles as **Listed** or **Unlisted** to hide or reveal them from client sight.
  - Delete retired style designs permanently from the database.
- **Requests & Reservations Operations**:
  - View real-time active customer requests synchronized with live databases.
  - Search and filter requests by village, status pipelines, or buyer details.
  - Transition order reservation status from **Pending** to **Completed** or **Canceled** to manage routing ledgers.
  - Permanently clear records from the active collection streams once fulfilled.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: SPA engineered with **React 18** and **Vite** for optimized assets compilation.
- **Style Language**: Declarative layout styled with utility-first **Tailwind CSS**.
- **Interactive UI Components**: Powered by **Lucide React** vector icons and custom responsive components.
- **Backend Database**: **Firebase Firestore (Cloud NoSQL)** for robust real-time synchronized collections (`products` and `requests`).
- **Cloud Security**: Structured **Firebase Rules** managing appropriate write permissions. Public read access is granted for active styles catalogs, with administrative updates restricted entirely to validated owners.

---

## 📂 Project Structure

```bash
├── public/                 # Static graphical assets
├── src/
│   ├── components/         # Interactive UI Components
│   │   ├── CreateProductModal.tsx     # Form control to launch new styles
│   │   ├── CustomerView.tsx           # Customer browsing and custom reservations form
│   │   ├── Header.tsx                 # Responsive global navbar with administrative gateway
│   │   ├── ProductImageCarousel.tsx   # Touch-friendly carousel indicator
│   │   └── SellerView.tsx             # Interactive admin dashboards, controls & reservation logs
│   ├── App.tsx             # Application state coordinator and view engine routing
│   ├── firebase.ts         # Cloud Firestore initialization, connection testers, and error loggers
│   ├── main.tsx            # DOM initialization entry point
│   ├── index.css           # Global custom classes and Tailwind imports
│   └── types.ts            # High-integrity TypeScript interfaces (Product, CustomerRequest)
├── firebase-applet-config.json # Generated cloud database credentials
├── firebase-blueprint.json # Schema specification blueprint
├── firestore.rules         # Security access definitions
├── metadata.json           # Application manifest descriptor
└── package.json            # Dynamic library dependencies
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed on your development station.

### 2. Live Development Run
To run the web applet locally on your workstation, execute:
```bash
# Install required node modules
npm install

# Live preview server
npm run dev
```

### 3. Production Build
Prepare clean, optimized static compilation assets for production deployments:
```bash
npm run build
```

---

## 🛡️ Cloud Database Rules Specs
The persistent database operates securely with the following access controls:
- **`products` collection**:
  - *Public Reads*: Allowed to accommodate guest customer catalog viewing.
  - *Public Updates*: Restricted to updating only the `likes` attribute value to prevent pricing tampering.
  - *Creates / Deletes*: Strictly restricted to the authorized ledger administrator account.
- **`requests` collection**:
  - *Public Creates*: Allowed to let users place and send apparel custom requests.
  - *Updates / Deletes*: Restricted to the authenticated administrator to secure transaction integrity.
