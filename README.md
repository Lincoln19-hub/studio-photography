# Studio Photography — Full Stack App

A professional photography studio management system built with Next.js, Prisma, and SQLite.

## Features

- 🌐 **Public Website** — Beautiful landing page with booking form
-  **Booking Management** — Clients can book sessions online
- 💰 **Invoicing** — Create, send, and track invoices
-  **Receipts** — Generate printable receipts for payments
- 📊 **Admin Dashboard** — Overview of bookings, revenue, and clients
- 👥 **Client Management** — Track client info and history

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** SQLite via Prisma ORM
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## Getting Started

### 1. Install Dependencies

```bash
cd studio-app
npm install
```

### 2. Set Up Database

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
studio-app/
├── app/
│   ├── page.tsx              # Public landing page
│   ├── book/                 # Public booking form
│   ├── admin/                # Admin dashboard
│   │   ├── page.tsx          # Dashboard overview
│   │   ├── bookings/         # Booking management
│   │   ├── invoices/         # Invoice management
│   │   │   ├── new/          # Create invoice
│   │   │   └── [id]/         # Invoice detail + receipt
│   │   └── clients/          # Client management
│   └── api/                  # API routes
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts              # Sample data
├── lib/
│   ├── db.ts                # Prisma client
│   ── utils.ts             # Utility functions
└── public/
    └── images/              # Static images
```

## Key Pages

- **Home:** `/` — Public landing page
- **Book:** `/book` — Public booking form
- **Admin:** `/admin` — Dashboard overview
- **Bookings:** `/admin/bookings` — View all bookings
- **Invoices:** `/admin/invoices` — Invoice list
- **New Invoice:** `/admin/invoices/new` — Create invoice
- **Invoice Detail:** `/admin/invoices/[id]` — View invoice
- **Receipt:** `/admin/invoices/[id]/receipt` — Printable receipt
- **Clients:** `/admin/clients` — Client list

## Database Schema

- **Client** — Customer information
- **Booking** — Session bookings with status tracking
- **Invoice** — Billing with line items
- **InvoiceItem** — Individual items on invoices
- **Payment** — Payment records linked to invoices

## Sample Data

The seed script creates:
- 3 sample clients
- 3 bookings (confirmed, pending, completed)
- 3 invoices (paid, unpaid, paid)
- Sample payments

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Note: For production, consider migrating from SQLite to PostgreSQL.

### Other Platforms

The app can be deployed to any Node.js hosting platform that supports Next.js.

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
```

For production with PostgreSQL:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/studio?schema=public"
```

## License

MIT
