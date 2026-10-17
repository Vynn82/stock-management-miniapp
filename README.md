# 📱 Stock Management - Telegram Mini App (Partner Store)

A mobile-first **Telegram Mini App** for customer and partner ordering, seamlessly integrated with the existing **Stock Management API**.

---

## 🏗️ System Architecture

```text
Telegram (iOS / Android / Desktop)
   ↓
Telegram Mini App (Next.js 14 + Tailwind CSS)
   ↓ HTTPS (HMAC-SHA256 signed initData)
Stock Management API (NestJS + TypeORM)
   ↓
PostgreSQL Database
```

The Mini App acts as a dedicated customer portal. It communicates directly with the existing NestJS backend without maintaining an intermediate server.

---

## 🔄 Business Flows

### 1. Customer Registration & Approval Flow

```text
Customer opens Mini App inside Telegram
   ↓
Verify Telegram initData (HMAC-SHA256 with Bot Token)
   ↓
Check Telegram Account
   │
   ├── [First Time Customer]
   │     ↓
   │   REGISTRATION_REQUIRED
   │     ↓
   │   Mini App shows Registration Screen
   │   (Company Name, Contact Person, Phone, Delivery Address)
   │   Telegram ID & Username captured automatically
   │     ↓
   │   Customer Submits Registration (POST /customer-orders/auth/register)
   │     ↓
   │   Status -> PENDING
   │
   ├── [Customer Status = PENDING]
   │     ↓
   │   Mini App shows "Waiting for Staff Review" screen
   │   Staff reviews on Web/API:
   │     • Approve -> Status becomes ACTIVE (Telegram notification sent)
   │     • Reject  -> Status becomes REJECTED with reason (Telegram notification sent)
   │
   ├── [Customer Status = REJECTED]
   │     ↓
   │   Mini App shows rejection reason & pre-filled form
   │   Customer edits information and clicks "Update & Submit Again"
   │   Status resets to PENDING (no duplicate record created!)
   │
   ├── [Customer Status = SUSPENDED / BLOCKED]
   │     ↓
   │   Mini App shows access restriction notice (ordering disabled)
   │
   └── [Customer Status = ACTIVE]
         ↓
       Issued Customer JWT (7 days validity)
       Unlocks full catalog browsing, cart, and ordering!
```

---

### 2. Customer Order & Cash-on-Delivery Flow

```text
Customer (ACTIVE)
    ↓
Browse Products & Categories (/products, /products/[id])
    ↓
Add items to Cart (/cart)
    ↓
Proceed to Checkout (/checkout)
    ↓
Create Order (POST /customer-orders)
    - Human-readable Order No generated (e.g. ORD-20261004-3914)
    - Official pricing fetched from DB (client price ignored)
    - Delivery Address & Remark captured
    - Payment Method: CASH (Unpaid)
    - Telegram & Mail notifications dispatched
    ↓
PENDING_REVIEW
    ↓
Staff Review:
 ┌───────────────┬─────────────────────────┬───────────────┐
 ↓               ↓                         ↓
Reject      Ask Customer                Accept
(REJECTED)  (WAITING_CUSTOMER)         (CONFIRMED)
                 ↓
          Customer Responds:
          • Accept partial quantity -> CONFIRMED
          • Reject -> CANCELLED
          • Free text message -> PENDING_REVIEW
                 ↓
          Stock Allocation (Strict Invariant: approved + waiting <= requested)
          • Full stock -> PROCESSING (Warehouse stock deducted)
          • Partial stock -> WAITING_STOCK
                 ↓
          Out For Delivery (deliveryStatus: OUT_FOR_DELIVERY)
                 ↓
          Delivered (deliveryStatus: DELIVERED)
                 ↓
          Customer Pays Cash on Delivery (No online payment gateways)
                 ↓
          Staff Records Cash Payment (paymentStatus: PAID)
                 ↓
          Order Completed (COMPLETED)
```

---

## 📱 Mini App Pages & Components

| Route / Component | Description |
| :--- | :--- |
| `<AuthGate />` | Root state machine protecting all routes; displays appropriate screen for `REGISTRATION_REQUIRED`, `PENDING`, `REJECTED`, `SUSPENDED`, `BLOCKED`, or unlocks `ACTIVE`. |
| `/` | **Home**: Partner greeting, quick search, category pills, featured products, and quick-add actions. |
| `/products` | **Product Catalog**: Live search, category filtering, product grid with pricing and stock availability. |
| `/products/[id]` | **Product Details**: Multi-image carousel, variant selection pills, price breakdown, and Add to Cart. |
| `/cart` | **Shopping Cart**: Item quantity controls, subtotal calculation, and checkout trigger. |
| `/checkout` | **Checkout**: Verified delivery address, order summary, cash on delivery notice, and order submission. |
| `/orders` | **My Orders**: List of current and past partner orders with status badges and timestamps. |
| `/orders/[id]` | **Order Details**: Detailed status progression, line item quantity breakdown (requested/approved/waiting), staff message history, and response options. |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Telegram Integration**: `@telegram-apps/sdk` / Telegram WebApp JS Script

---

## ⚙️ Getting Started

### 1. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Backend NestJS API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser. (In browser development mode, the app falls back to a development Telegram identity for testing outside Telegram container).

### 4. Build for Production

```bash
npm run build
npm start
```
