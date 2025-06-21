# Aamar School Management System

A comprehensive school management system built with Next.js, TypeScript, and Prisma.

## Features

- 🏫 Multi-tenant school management
- 👥 User management (Admin, Teacher, Student, Parent, Staff)
- 📚 Class and subject management
- 📊 Attendance tracking
- 📝 Exam and result management
- 💰 Fee management
- 📅 Timetable management
- 📚 Library management
- 🚌 Transport management
- 🔐 Role-based access control

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **UI:** ReactBits + shadcn/ui
- **Authentication:** JWT with RBAC
- **Testing:** Jest + Playwright
- **Development:** Docker

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (if not using Docker)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/aamar-school.git
   cd aamar-school
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

4. Start the database:
   ```bash
   docker-compose up -d
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Development

- **Code Style:** ESLint + Prettier
- **Git Hooks:** Husky for pre-commit checks
- **Testing:**
  - Unit tests: `npm test`
  - E2E tests: `npm run test:e2e`

## Project Structure

```
aamar-school/
├── app/                    # Next.js app directory
│   ├── modules/           # Feature modules
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout
├── components/            # Reusable components
│   └── ui/              # UI components
├── lib/                  # Utility functions
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── tests/               # Test files
```

## Documentation

- [Developer Documentation](./docs/dev-docs.md)
- [User Manual](./docs/user-manual.md)

## License

MIT

## Support

For support, email support@aamarschool.com or create an issue in the repository. 