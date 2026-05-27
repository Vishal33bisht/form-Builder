# FormCraft 📝

<div align="center">

### Build forms that feel human

A modern, production-ready **Typeform-inspired form builder SaaS** built with **Next.js 16**, **tRPC**, **PostgreSQL**, and **Turborepo**.

Create beautiful, interactive forms with drag-and-drop editing, stunning themes, real-time analytics, response management, and seamless sharing.

<br />

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![tRPC](https://img.shields.io/badge/tRPC-v11-2596be?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

# ✨ Features

## 🎨 Form Builder
- Drag-and-drop form editor
- Live form preview
- Reorder fields dynamically
- Multi-step form experience
- Typeform-style UI/UX
- Responsive across all devices

---

## 🧩 Supported Field Types

- Short Text
- Long Text
- Email
- Number
- Phone
- Select Dropdown
- Radio Buttons
- Checkbox
- Rating
- Date Picker
- URL
- Password
- File Upload *(optional future support)*

---

## 🌈 Beautiful Themes

Includes multiple production-ready themes:

- Hogwarts
- Cyberpunk 2077
- Silicon Valley
- Tokyo Nights
- Matrix
- Indie Dev
- Neon Arcade
- Arch Linux

---

## 📊 Analytics Dashboard

Track form performance with:

- Total responses
- Completion rates
- Daily & weekly stats
- Field-level analytics
- Charts & visualizations
- Export responses to CSV

---

## 🔐 Security Features

- JWT Authentication
- Password hashing with bcrypt
- Protected routes
- Rate limiting
- Input validation with Zod
- SQL injection protection
- Environment validation
- Optional password-protected forms

---

## 🚀 Production Features

- Public & private forms
- Custom slugs
- Response limits
- Form expiry dates
- Email notifications
- Draft & publish workflow
- CSV export
- Mobile optimized

---

# 🏗️ Tech Stack

## Frontend
- Next.js 16
- React 19
- TypeScript
- TailwindCSS v4
- shadcn/ui
- Recharts
- dnd-kit

## Backend
- Express.js v5
- tRPC v11
- Node.js
- JWT Authentication

## Database
- PostgreSQL
- Drizzle ORM

## Monorepo
- Turborepo
- pnpm workspaces

---

# 📁 Project Structure

```bash
formcraft/
│
├── apps/
│   ├── api/                # Express + tRPC backend
│   └── web/                # Next.js frontend
│
├── packages/
│   ├── database/           # Drizzle ORM & schema
│   ├── services/           # Business logic
│   ├── trpc/               # Shared tRPC router
│   ├── logger/             # Winston logger
│   ├── eslint-config/
│   └── typescript-config/
│
├── .env
├── turbo.json
├── pnpm-workspace.yaml
└── README.md