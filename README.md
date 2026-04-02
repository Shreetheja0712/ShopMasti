# 🛍️ ShopMasti

> An event-based e-commerce web application built as an academic lab project to demonstrate full-stack web development concepts.

ShopMasti simulates a real-world online shopping platform where users can shop for life events (weddings, new home, relocation, etc.) that bundle relevant products with event-specific discounts. Built solely for educational purposes to strengthen skills in frontend design, backend development, and database management.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router v6, Context API |
| Backend | Node.js, Express.js |
| ORM | Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT (JSON Web Tokens) |
| Styling | CSS (custom, no UI library) |

---

## ✨ Features

### 👤 Authentication
- User registration with username, email, password, phone number and country code
- Login with JWT — token stored in `localStorage`
- Role-based access: `Admin (role_id=2)` and `User (role_id=1)`
- Protected routes — redirects to login popup if unauthenticated
- Auto-opens login modal on redirect via React Router `location.state`

### 🏠 Home Page
- Auto-advancing hero image slider
- Login / Register popup modals (no page navigation)

### 🔍 Navbar
- Dual bar layout: search, events flyout, cart, user avatar dropdown
- Live Events flyout — fetches active events from DB with discount tags
- Mega menu on Bar 2 — hover over upper category to see categories + subcategories
- Cart blocked with tooltip if not logged in
- User dropdown: Profile, Orders, Addresses, Reset Password, Admin Panel (admin only), Sign Out

### 📦 Products
- Products listing page with URL-driven filters (single source of truth)
- Filters: category, subcategory, upper category, search query, price range, in-stock only, sort
- All filter changes update URL — browser back/forward works correctly
- Navbar category/subcategory clicks auto-reload products without page refresh
- Product detail page with variant selection (color, size), image gallery, add to cart

### 🎉 Events
- Events listing page — grid of all active events
- Event viewer — subcategories for a selected event
- Full event shopping flow: Event → Subcategory → Products → Cart (with `eventId` threaded through URL)

### 🛒 Cart
- Items grouped by event — each group is a collapsible accordion
- Per-group order summary: MRP → Product Discount → Event Discount → Total
- Event discount auto-applied if cart total meets `min_purchase_amount`
- Hint shows how much more to add to unlock event discount
- Quantity update and item removal
- Redirects to login if session expires

### 📋 Order Confirmation (Multi-step)
- Step 1: Select delivery address (shows saved addresses, default pre-selected)
- Step 2: Payment method — Cash on Delivery or Online (simulated)
- Step 3: Review order summary before placing
- Step 4: Success screen with order ID
- Clears relevant cart items after order placed

### 📦 Orders Page
- User's complete order history
- Order items with variant details (color, size), address, event, payment info

### 👤 Profile Page
- Tabbed interface: Details, Addresses, Password — tab synced to URL (`?tab=`)
- Edit profile (username, mobile, country)
- Add / edit / delete delivery addresses with default address support
- Change password with current password verification

### ⚙️ Admin Panel
- Protected — accessible only to `role_id = 2` users
- Sidebar navigation with 6 sections:

| Section | Capabilities |
|---------|--------------|
| Dashboard | Stats: total orders, revenue, products, users, events |
| Events | Create / edit / delete events, manage event discounts |
| Products | Create / edit / delete items with variants |
| Categories | Manage upper categories, categories, subcategories |
| Orders | View all orders, update order status (PENDING → SHIPPED → DELIVERED / CANCELLED) |
| Users | View all users, toggle active/inactive status |

---

## 🗃️ Database Schema

```
UpperCategory → Category → SubCategory → Item → ItemVariant → VariantImage
EventType → EventSubCategory (many-to-many with SubCategory)
EventType → EventDiscount
User → Cart (variant_id + event_id + quantity)
User → Orders → OrderItem
Orders → PaymentTransaction
User → Address
User → Review
Role → User
```

---

## 📁 Project Structure

```
ShopMasti/
├── frontend/                  # React app
│   └── src/
│       ├── components/
│       │   ├── Navbar/
│       │   ├── Footer/
│       │   └── ProductCard/
│       ├── pages/
│       │   ├── Home/
│       │   ├── Auth/          # Login, Register
│       │   ├── Products/      # ProductsPage, ProductView
│       │   ├── Events/        # EventsPage, EventViewer
│       │   ├── Cart/
│       │   ├── Orders/        # OrdersPage, OrderConfirmation
│       │   ├── Profile/
│       │   └── Admin/         # AdminLayout + sections/
│       ├── context/
│       │   └── AuthContext.js
│       ├── utils/
│       │   └── api.js         # apiFetch, authFetch, isLoggedIn, getToken
│       └── styles/
│           └── theme.css      # CSS variables
│
└── backend/                   # Node.js + Express
    ├── src/
    │   ├── server.js
    │   ├── config/
    │   │   ├── corsOption.js
    │   │   └── db.js
    │   ├── controllers/
    │   │   ├── addressesController.js
    │   │   ├── adminController.js
    │   │   ├── authController.js
    │   │   ├── cartController.js
    │   │   ├── categoriesController.js
    │   │   ├── eventsController.js
    │   │   ├── ordersController.js
    │   │   ├── productsController.js
    │   │   └── usersController.js
    │   ├── middleware/
    │   │   ├── auth.js
    │   │   ├── errorHandler.js
    │   │   ├── logger.js
    │   │   ├── rateLimiter.js
    │   │   ├── requestLogger.js
    │   │   └── validate.js
    │   └── routes/
    │       ├── index.js
    │       ├── addressesRoutes.js
    │       ├── adminRoutes.js
    │       ├── authRoutes.js
    │       ├── cartRoutes.js
    │       ├── categoriesRoutes.js
    │       ├── eventsRoutes.js
    │       ├── ordersRoutes.js
    │       ├── productsRoutes.js
    │       └── usersRoutes.js
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    └── prisma.config.ts
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL database
- npm

### 1. Clone the repository

```bash
git clone https://github.com/your-username/shopmasti.git
cd shopmasti
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
DB_URL=postgresql://username:password@localhost:5432/shopmasti
JWT_SECRET=your_secret_key_here
PORT=5000
```

Run database migrations and seed:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:5000`.

---


## 📡 API Overview

| Group | Base Path |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Products | `GET /api/products`, `GET /api/products/:id` |
| Categories | `GET /api/upper-categories`, `GET /api/products/categories` |
| Events | `GET /api/events`, `GET /api/events/:id` |
| Cart | `GET/POST /api/cart`, `PUT/DELETE /api/cart/:id` |
| Orders | `GET/POST /api/orders` |
| Addresses | `GET/POST/PUT/DELETE /api/addresses` |
| Profile | `GET/PUT /api/users/me`, `PUT /api/users/me/password` |
| Admin | `GET /api/admin/stats`, full CRUD on events, products, categories, orders, users |

---

## 👨‍💻 Contributors

This project was developed as part of a web development course lab.

- **RAVITEJA**
      https://github.com/RAVITEJA12158
- **SHREETHEJA**
      https://github.com/Shreetheja0712

---

## 📄 License

This project is for **educational purposes only**. Not intended for commercial use.
