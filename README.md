# TU Market Hub 🎯

TU Market Hub is a premium, secure, multi-vendor circular economy marketplace designed specifically for college students. It provides a frictionless platform to list, search, buy, sell, or swap school items—such as textbooks, laptops, hostel utensils, study accessories, and clothing—completely commission-free.

---

## 🌟 Core Philosophy & Design

TU Market Hub is crafted with a meticulous, high-contrast, modern interface that supports both seamless light and comprehensive dark themes. The application balances clean, bold display typography with plenty of whitespace and refined micro-interactions.

- **Campus-Forward Experience**: Standardized product layouts, real-time dynamic filters, and responsive layout grids customized to match student needs.
- **Physical Safety First**: Features designated walkthrough guides emphasizing trusted face-to-face inspection at popular campus meetup points (e.g., Student Union Plaza) before initiating payments.
- **Zero-Friction Connections**: Eliminates payment processing risks by instantly linking buyers directly with student vendors via pre-formatted, automated WhatsApp messaging templates.

---

## 🚀 Key Features

### 🛒 Multi-Vendor Portal & Storefront
- **Detailed Direct Catalog**: Filter by category, price caps, status (Active/Out of stock), and search queries.
- **Dynamic Cart Draft Board**: Keep a running queue of item drafts. Group drafts automatically by individual campus vendor stalls so you can plan orders efficiently.
- **WhatsApp Order Sheets**: Custom-tailored order checkout which validates form inputs (such as student hostel locations and contact numbers), generating precise chat templates with direct seller routing.

### 🛡️ Built-in Educational Walkthrough
- Step-by-step interactive onboarding explaining listing views, cart drafting, and safety rules for in-person campus inspection.

### 🔑 Verified Administrator Dashboard
- **Comprehensive Catalog Management**: Edit and create custom categories and update individual product listings.
- **Unified Settings Switchboard**: Direct access for campus community organization admins to manage global platform announcements, toggles, and re-seed standard starting item catalogues securely.
- **Database Control Panel**: Easily inspect active items and clear alternative uploads when needed.

---

## 🛠️ Technological Stack

- **Framework**: React 18+ with TypeScript
- **Bundler & Dev Server**: Vite
- **Styling Engine**: Tailwind CSS (fully responsive, custom slate-brand system, comprehensive dark mode utility layers)
- **Database & Services**: Firebase (Cloud Firestore & Firebase Authentication)
- **Animation Framework**: Motion (`motion/react`)
- **Icons Resource**: Lucide React
- **Chat Routing**: Encoded WhatsApp API Gateway

---

## 📂 Project Architecture

```markdown
├── public/                 # Static assets (favicons, browser configurations)
├── assets/                 # Shared product illustrations, logo prototypes
├── src/
│   ├── components/         # Modular Vue/React Views and Sub-components
│   │   ├── Header.tsx      # Platform branding, search bar, cart triggers, navigation
│   │   ├── Footer.tsx      # Multi-column links, credentials, and legal disclaimers
│   │   ├── HomeView.tsx    # Responsive hero carousel, featured listings, testimonials
│   │   ├── ShopView.tsx    # Interactive catalog grids, live searching, sidebar controls
│   │   ├── AdminView.tsx   # Verified admin panel, settings consoles, catalog controls
│   │   ├── AboutView.tsx   # Campus mission briefings and platform parameters
│   │   ├── ContactView.tsx # Custom support ticketing forms and safe physical map simulator
│   │   ├── WalkthroughGuide.tsx  # Dynamic interactive slides for student safety
│   │   └── WhatsAppOrderForm.tsx # Responsive buyer details collector and pre-filled chat compiler
│   ├── data/
│   │   └── seed.ts         # Handcrafted campus products, initial categories, admin seeds
│   ├── firebase.ts         # Firebase App configuration and Firestore initialization
│   ├── types.ts            # Centralized TypeScript type models (Product, Vendor, Category)
│   ├── index.css           # Global custom styles and Tailwind theme overrides
│   └── main.tsx            # Application bootstrapping root
├── firestore.rules         # Security Rules protecting individual student namespaces
├── firebase.json           # Firebase configuration detailing multi-database deployments
├── package.json            # NPM dependencies and script compilation definitions
└── metadata.json           # Application identities and permission manifests
```

---

## 📦 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed on your system.

### Installation

1. Clone or download this project workspace into your desired directory resource.
2. In your terminal, navigate to the project directory and install the necessary dependencies:
   ```bash
   npm install
   ```

### Running Development Server
Launch the local Vite server:
```bash
npm run dev
```
The server will boot and display the local running port, typically routing to `http://localhost:3000`.

### Building and Deployment
Compile production-ready minified static assets to the `/dist` directory:
```bash
npm run build
```

---

## 🔒 Security & Safe Operations Directive

1. **Meet in Open Spaces**: All student exchanges should occur within designated campus hubs during daylight hours (e.g., student plazas, popular library entrances).
2. **Inspect Items Thoroughly**: Always inspect electronics, devices, or clothing first before finalizing any financial peer agreements. No transactions take place inside the applet.
3. **No Private Keys**: Make sure API configurations remain isolated within system variables, never hardcoding critical credentials directly in front-end blocks.
