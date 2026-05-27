# FormCraft 📝

> Build forms that feel human

A modern, Typeform-style form builder SaaS application built with Next.js, tRPC, and PostgreSQL. Create beautiful, engaging forms with drag-and-drop functionality, stunning themes, powerful analytics, and seamless sharing.

![FormCraft](https://img.shields.io/badge/FormCraft-v1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![tRPC](https://img.shields.io/badge/tRPC-11-2596be)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🚀 Features

### For Form Creators
- **Drag & Drop Builder** - Intuitive form builder with live preview
- **10+ Field Types** - Text, email, number, select, rating, date, and more
- **Beautiful Themes** - 8 preset themes (Hogwarts, Cyberpunk, Silicon Valley, etc.)
- **Real-time Analytics** - Track responses, completion rates, and field-level insights
- **CSV Export** - Download all responses in CSV format
- **Custom Branding** - Custom slugs, visibility settings, and form customization
- **Response Management** - View, filter, and delete individual responses
- **Password Protection** - Secure your forms with password protection
- **Response Limits** - Set maximum response limits and expiry dates

### For Respondents
- **Clean, Modern UI** - Distraction-free form filling experience
- **Progress Tracking** - Visual progress bar for longer forms
- **Mobile Responsive** - Perfect on all devices
- **Email Notifications** - Optional email confirmations
- **Public Forms** - Discover and fill out public forms in the Explore page

---

## 🛠️ Tech Stack

### Monorepo Architecture (Turborepo)
- **apps/api** - Express.js server with tRPC
- **apps/web** - Next.js 16 App Router frontend
- **packages/trpc** - Shared tRPC router and procedures
- **packages/database** - Drizzle ORM with PostgreSQL
- **packages/services** - Business logic layer
- **packages/logger** - Winston logger

### Core Technologies
- **Frontend**: Next.js 16, React 19, TailwindCSS v4, shadcn/ui
- **Backend**: Express v5, tRPC v11, Node.js
- **Database**: PostgreSQL, Drizzle ORM
- **Validation**: Zod v4
- **Authentication**: JWT + bcrypt
- **API Docs**: Scalar (OpenAPI)
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit
- **Email**: Nodemailer (optional SMTP)
- **Package Manager**: pnpm
- **Monorepo**: Turborepo

---

## 📦 Project Structure
formcraft/
├── apps/
│ ├── api/ # Express + tRPC backend
│ │ ├── src/
│ │ │ ├── server.ts # Express app with tRPC
│ │ │ ├── index.ts # Server entry point
│ │ │ └── env.ts # Environment validation
│ │ └── package.json
│ └── web/ # Next.js frontend
│ ├── app/ # App Router pages
│ │ ├── (auth)/ # Auth pages (login, register)
│ │ ├── dashboard/ # Protected dashboard pages
│ │ ├── f/[slug]/ # Public form pages
│ │ ├── explore/ # Public forms gallery
│ │ ├── pricing/ # Pricing page
│ │ └── page.tsx # Landing page
│ ├── components/
│ │ ├── ui/ # shadcn/ui components
│ │ ├── dashboard/ # Dashboard-specific components
│ │ ├── forms/ # Form-related components
│ │ └── form-builder/ # Form builder components
│ ├── lib/ # Utilities
│ ├── trpc/ # tRPC client setup
│ └── package.json
├── packages/
│ ├── database/ # Drizzle ORM
│ │ ├── models/ # Database models
│ │ ├── schema.ts # Schema exports
│ │ ├── seed.ts # Seed script
│ │ └── drizzle.config.ts
│ ├── services/ # Business logic
│ │ ├── auth/ # AuthService
│ │ ├── form/ # FormService
│ │ ├── response/ # ResponseService
│ │ ├── email/ # EmailService
│ │ └── rateLimit/ # RateLimitService
│ ├── trpc/ # tRPC router
│ │ └── server/
│ │ ├── routes/ # API routes
│ │ │ ├── auth/
│ │ │ ├── forms/
│ │ │ ├── fields/
│ │ │ ├── responses/
│ │ │ ├── analytics/
│ │ │ └── themes/
│ │ ├── context.ts # tRPC context
│ │ ├── trpc.ts # tRPC setup
│ │ └── index.ts # Router export
│ ├── logger/ # Winston logger
│ ├── eslint-config/ # Shared ESLint config
│ └── typescript-config/ # Shared TypeScript config
├── .env # Environment variables
├── .env.example # Environment template
├── .gitignore
├── package.json # Root package.json
├── pnpm-workspace.yaml # pnpm workspace config
├── turbo.json # Turborepo config
└── README.md

text


---

## 🚦 Getting Started

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** 9+ (`npm install -g pnpm`)
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/formcraft.git
cd formcraft
Install dependencies
Bash

pnpm install
Set up environment variables
Bash

# Create .env file
cp .env.example .env
Edit .env and configure:

env

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/formcraft_dev

# Server
PORT=8000
NODE_ENV=development
BASE_URL=http://localhost:8000

# JWT Authentication (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:8000/trpc

# Google OAuth (existing - optional)
GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/google/callback

# SMTP Email (optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@formcraft.io

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
Generate a secure JWT_SECRET:

Bash

openssl rand -base64 32
Start PostgreSQL
Using Docker:

Bash

docker run --name formcraft-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=formcraft_dev -p 5432:5432 -d postgres:14
Or use your local PostgreSQL installation.

Run database migrations
Bash

cd packages/database
pnpm db:generate
pnpm db:migrate
Seed the database (optional)
Bash

pnpm db:seed
This creates:

Demo user: demo@formcraft.io / Demo@1234
8 preset themes
5 sample forms with 210+ responses
Start development servers
From the root directory:

Bash

pnpm dev
This starts:

API Server: http://localhost:8000
Web App: http://localhost:3000
API Docs: http://localhost:8000/docs
🎯 Demo Credentials
After seeding, you can log in with:

Email: demo@formcraft.io
Password: Demo@1234
Or create a new account at /register

📖 Usage Guide
Creating Your First Form
Log in to your account
Navigate to Dashboard → Forms
Click "Create Form"
Enter form title and description
Choose visibility (public/unlisted)
Click "Create Form"
Building Your Form
Add Fields

Click "Add Field" and select field type
Configure field properties in the right panel
Set label, placeholder, description
Mark as required if needed
Add options for select/dropdown fields
Set validations (min/max length, min/max value)
Reorder Fields

Drag and drop fields to reorder
Use the grip handle on the left
Preview

Click "Preview" tab to see how your form looks
Switch back to "Build" to continue editing
Configure Settings

Click "Settings" button
Set custom URL slug
Choose visibility (public/unlisted)
Set response limit
Set expiry date
Select theme
Publish

Click "Publish" button
Share your form link: /f/your-slug
Managing Responses
Navigate to Forms → [Your Form] → View Responses
View all submissions in table format
Click "View" to see full response details
Filter by date range
Export to CSV
Delete individual responses if needed
Analytics
Overall Analytics (Dashboard → Analytics)

Total forms and responses
Published vs draft forms
Top performing forms
Form Analytics (Forms → [Your Form] → Analytics)

Total responses over time
Today's responses
Weekly responses
Field-by-field breakdown
Charts for select fields, ratings, etc.
🔌 API Documentation
Interactive API documentation is available at:

http://localhost:8000/docs (Scalar UI)

API Endpoints
Authentication
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
GET /api/auth/me - Get current user (protected)
Forms
POST /api/forms - Create form (protected)
GET /api/forms - List user's forms (protected)
GET /api/forms/{formId} - Get form by ID (protected)
GET /api/forms/slug/{slug} - Get public form by slug
GET /api/forms/public - List public forms
PATCH /api/forms/{formId} - Update form (protected)
DELETE /api/forms/{formId} - Delete form (protected)
POST /api/forms/{formId}/publish - Publish form (protected)
POST /api/forms/{formId}/unpublish - Unpublish form (protected)
POST /api/forms/{formId}/clone - Clone form (protected)
Fields
POST /api/fields - Create field (protected)
PATCH /api/fields/{fieldId} - Update field (protected)
DELETE /api/fields/{fieldId} - Delete field (protected)
POST /api/fields/reorder - Reorder fields (protected)
Responses
POST /api/responses - Submit response (public, rate-limited)
GET /api/responses/{formId} - List responses (protected)
GET /api/responses/single/{responseId} - Get response (protected)
DELETE /api/responses/{responseId} - Delete response (protected)
GET /api/responses/{formId}/export - Export CSV (protected)
Analytics
GET /api/analytics/forms/{formId} - Form stats (protected)
GET /api/analytics/forms/{formId}/fields - Field stats (protected)
GET /api/analytics/overall - Overall stats (protected)
Themes
GET /api/themes - List themes
GET /api/themes/{slug} - Get theme by slug
🎨 Available Themes
Hogwarts (Movie) - Deep purple & gold, serif font
Cyberpunk 2077 (Game) - Neon yellow & dark, mono font
Silicon Valley (Startup) - Clean blue & white, sans-serif
Tokyo Nights (Anime) - Pink & purple, modern font
Arch Linux (OS) - Blue & black, mono font
Matrix (Movie) - Green & black, mono font
Indie Dev (Community) - Warm orange & cream, rounded
Neon Arcade (Game) - Multi-neon & dark, retro font
🧪 Development
Available Scripts
Bash

# Install dependencies
pnpm install

# Start development servers (API + Web)
pnpm dev

# Build for production
pnpm build

# Start production servers
pnpm start

# Lint all packages
pnpm lint

# Type check
pnpm check-types

# Database commands
cd packages/database
pnpm db:generate    # Generate migration
pnpm db:migrate     # Run migration
pnpm db:seed        # Seed database
pnpm dev            # Open Drizzle Studio
Database Management
Drizzle Studio (Database GUI):

Bash

cd packages/database
pnpm dev
Opens at http://localhost:4983

Create Migration:

Bash

cd packages/database
pnpm db:generate
Run Migration:

Bash

pnpm db:migrate
Reset Database:

Bash

# Drop all tables and re-migrate
pnpm db:migrate
pnpm db:seed
🚢 Deployment
Deploy to Vercel + Railway
Database (Railway)

Create PostgreSQL database on Railway
Copy DATABASE_URL
Backend (Railway/Render)

Deploy apps/api to Railway or Render
Set environment variables
Copy API URL
Frontend (Vercel)

Deploy apps/web to Vercel
Set NEXT_PUBLIC_API_URL to your API URL
Set other environment variables
Run Migrations

Bash

DATABASE_URL=<your-production-db-url> pnpm db:migrate
DATABASE_URL=<your-production-db-url> pnpm db:seed
Environment Variables (Production)
Make sure to set all required environment variables in your deployment platform:

DATABASE_URL
JWT_SECRET (generate new secure secret)
BASE_URL (your API domain)
NEXT_PUBLIC_API_URL (your API URL + /trpc)
NODE_ENV=production
SMTP settings (if using email notifications)
📊 Database Schema
Tables
users - User accounts
forms - Form definitions
form_fields - Form field configurations
form_responses - Submitted responses
themes - Theme presets
Entity Relationships
text

users
  ├── forms (1:many)
      ├── form_fields (1:many)
      └── form_responses (1:many)

themes (standalone)
🔒 Security Features
JWT-based authentication
Password hashing with bcrypt
Rate limiting on form submissions (10 requests/minute per IP)
Input validation with Zod
SQL injection prevention (Drizzle ORM)
CORS configuration
Environment variable validation
Protected API routes
Password-protected forms (optional)
🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
Coding Standards
TypeScript strict mode
ESLint configuration
Prettier formatting
Conventional commits
Component-based architecture
🐛 Troubleshooting
Database Connection Issues
Bash

# Check PostgreSQL is running
psql -U postgres

# Test connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/formcraft_dev pnpm db:migrate
Port Already in Use
Bash

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
Module Not Found
Bash

# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
tRPC Type Errors
Bash

# Regenerate tRPC types
pnpm check-types
📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

👨‍💻 Author
Built with ❤️ for the hackathon

🙏 Acknowledgments
Next.js
tRPC
Drizzle ORM
shadcn/ui
Turborepo
Scalar
Recharts
📧 Support
For issues and questions:

Open an issue on GitHub
Email: support@formcraft.io (placeholder)
Happy Form Building! 🚀

text


## .gitignore (ROOT - CREATE/UPDATE)

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Next.js
.next/
out/
build/
dist/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Local env files
.env
.env*.local
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# Turborepo
.turbo

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.project
.classpath
.settings/
.loadpath

# OS
Thumbs.db
Desktop.ini

# Drizzle
drizzle/
*.db
*.db-journal

# Logs
logs/
*.log

# Temporary files
tmp/
temp/
*.tmp

# Package managers
.pnpm-store/
.yarn/
.npm/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Database
*.sqlite
*.sqlite3

# MacOS
.AppleDouble
.LSOverride
Icon
._*

# Windows
ehthumbs.db
ehthumbs_vista.db

# Files that might appear in the root
/dist
/coverage
/.cache