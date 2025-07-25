# MiniBooker

**MiniBooker** is a SaaS platform for small businesses to manage bookings, staff, and working hours. Perfect for beauty salons, coffee shops, service centers, and any business that needs a simple, modern tool for online appointment scheduling.

## 🔧 Tech Stack

- **Next.js (App Router)** — React framework with SSR support
- **TypeScript** — Static typing for better developer experience
- **Tailwind CSS + ShadCN UI** — Modern styling and UI components
- **PostgreSQL (via Neon)** — Scalable relational database
- **Drizzle ORM** — Type-safe ORM for working with the database
- **BetterAuth** — Custom authentication (Google and Email/Password)
- **Zustand** — Lightweight global state management
- **React Hook Form + Zod** — Form management with validation

## ⚙️ Features

- 👥 User authentication (Google / Email)
- 🧾 Admin-only business creation
- 🧑‍🤝‍🧑 Add and manage staff for each business
- ⏰ Define working hours per staff member
- 📅 Create bookings with conflict checking and availability
- 📈 Admin dashboard to manage teams and businesses
- 🔍 Search and pagination for users and bookings

## 🚀 Getting Started Locally

> Make sure you have **Node.js** and **PostgreSQL** (or [Neon](https://neon.tech)) set up.

1. **Clone the repository**

```bash
git clone https://github.com/lokki931/mini-booker.git
cd minibooker
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

```bash
DATABASE_URL=postgresql://your_database_url
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. Run migrations

```bash
npm drizzle-kit push
```

4. Run project

```bash
npm run dev
```
