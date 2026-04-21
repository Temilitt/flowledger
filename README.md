FlowLedger
A modern, full-stack financial dashboard SaaS built for small business owners and freelancers. Track income and expenses, generate professional PDF invoices, manage monthly budgets, and visualize your cash flow — all in one clean, responsive interface.

Live Demo
flowledger.vercel.app



Features

Authentication — Secure sign up and login with NextAuth.js and bcrypt password hashing
Dashboard — Real-time financial overview with income, expenses, balance, and chart visualizations
Transactions — Add, filter, search, and delete income and expense entries with category support
Invoice Generator — Create professional invoices with line items, tax rates, and one-click PDF export
Budget Tracker — Set monthly budgets per category and track spending progress in real time
Reports — Yearly financial summaries with monthly breakdowns and CSV export
Fully Responsive — Works seamlessly on mobile, tablet, and desktop
Protected Routes — Middleware-based route protection so only authenticated users access the dashboard


Tech Stack
LayerTechnologyFrameworkNext.js 14 (App Router)LanguageTypeScriptStylingTailwind CSS v4DatabasePostgreSQL (Neon)ORMPrisma v7AuthenticationNextAuth.js v5ChartsRechartsIconsLucide ReactPDF GenerationjsPDFDeploymentVercel

Getting Started
Prerequisites

Node.js 18+
A Neon account for the PostgreSQL database

Installation

Clone the repository

bashgit clone https://github.com/Temilitt/flowledger.git
cd flowledger

Install dependencies

bashnpm install

Set up environment variables

Create a .env file in the root of the project:
envDATABASE_URL="your-neon-postgresql-connection-string"
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"

Push the database schema

bashnpx prisma db push

Generate the Prisma client

bashnpx prisma generate

Start the development server

bashnpm run dev
Open http://localhost:3000 in your browser.

Project Structure
src/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── register/       # Register page
│   ├── (dashboard)/
│   │   ├── dashboard/      # Main dashboard
│   │   ├── transactions/   # Transaction management
│   │   ├── invoices/       # Invoice generator
│   │   ├── budgets/        # Budget tracker
│   │   └── reports/        # Financial reports
│   └── api/
│       ├── auth/           # NextAuth + register endpoints
│       ├── dashboard/      # Dashboard stats API
│       ├── transactions/   # Transactions CRUD API
│       ├── invoices/       # Invoices CRUD API
│       ├── budgets/        # Budgets CRUD API
│       └── reports/        # Reports API
├── components/
│   ├── layout/             # Sidebar, Header, MobileNav
│   └── charts/             # Chart components
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Prisma client
│   ├── utils.ts            # Helper functions
│   └── constants.ts        # App constants
└── types/
    └── index.ts            # TypeScript types

Database Schema
The app uses four main models:

User — Stores account details and preferred currency
Transaction — Income and expense entries linked to a user
Invoice — Client invoices with line items, tax, and status tracking
Budget — Monthly category budgets linked to a user


Deployment
This project is deployed on Vercel with a Neon PostgreSQL database.
To deploy your own instance:



DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL (set to your Vercel deployment URL)




Author
Built by Temiloluwa as a  project demonstrating full-stack Next.js development with real-world features including authentication, database design, data visualization, and PDF generation.

