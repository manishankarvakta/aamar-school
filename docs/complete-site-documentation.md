# Aamar School Management System - Complete Site Documentation

This document provides a comprehensive analysis and overview of the **Aamar School Management System** codebase, features, architecture, database schemas, and page routes.

---

## 🏛️ System Architecture & Tech Stack

The application is built using a modern, scalable JavaScript/TypeScript stack:

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router) with React server-side rendering (SSR) and Server Actions.
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/) for complete type safety.
- **Database ORM**: [Prisma Client](https://www.prisma.io/) as the ORM to interact with PostgreSQL.
- **Database**: [PostgreSQL](https://www.postgresql.org/) for persistent and relational storage.
- **Styling**: [TailwindCSS](https://tailwindcss.com/) for fluid styling, with [shadcn/ui](https://ui.shadcn.com/) components built on top of Radix UI primitives.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth micro-animations.
- **Authentication**: Cookie-based JWT (JSON Web Token) authentication with custom middleware for secure route protection.

---

## 📂 Project Directory Structure

```
aamar-school/
├── app/                    # Next.js App Router root
│   ├── (marketing)/        # Public marketing pages (landing, features, pricing, etc.)
│   ├── (modules)/          # Interactive dummy modules for different operations
│   ├── actions/            # Next.js Server Actions handling DB operations (mutation & queries)
│   ├── api/                # API routes (REST endpoints like login)
│   ├── dashboard/          # Protected administration panels (Admin portal)
│   ├── login/              # Login screen
│   ├── register/           # Registration screen for new schools and admins
│   ├── setup/              # Interactive school setup/onboarding flow
│   ├── globals.css         # Main stylesheet with Tailwind configs
│   ├── layout.tsx          # Root HTML layout and providers
│   └── page.tsx            # Main root landing page
├── components/            # Shared React UI components
│   ├── ui/                # shadcn/ui base elements (Button, Card, Input, Dialog, etc.)
│   ├── sections/          # Landing page sections (Hero, CTA, Features, etc.)
│   └── branch-selector.tsx# Multi-branch selector utility
├── contexts/               # React contexts (e.g., BranchContext)
├── docs/                   # System manuals, specifications, and dev documentation
├── lib/                    # Helper utilities (auth, db, jwt, utils)
├── prisma/                 # Prisma schemas, migrations, and seed scripts
└── public/                 # Static assets (images, logos, icons)
```

---

## 🗃️ Database Schema (`prisma/schema.prisma`)

The database uses PostgreSQL. The system uses a multi-tenant model mapped via `schoolId` and supports multi-branch structures via `branchId` and `aamarId`.

### 1. Enums
- **UserRole**: `ADMIN`, `TEACHER`, `STUDENT`, `PARENT`, `STAFF`
- **Gender**: `MALE`, `FEMALE`, `OTHER`
- **AttendanceStatus**: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`
- **PaymentStatus**: `PENDING`, `PAID`, `OVERDUE`, `CANCELLED`
- **LessonType**: `THEORY`, `PRACTICE`, `ASSIGNMENT`, `LAB`
- **ExamType**: `MIDTERM`, `FINAL`, `UNIT_TEST`, `MONTHLY`, `WEEKLY`, `ASSIGNMENT`, `PROJECT`
- **FeeType**: `TUITION`, `ADMISSION`, `TRANSPORT`, `LIBRARY`, `LABORATORY`, `SPORTS`, `EXAM`, `MISCELLANEOUS`
- **AccountType**: `CASH`, `BANK`, `REVENUE`, `EXPENSE`, `ASSET`, `LIABILITY`
- **TransactionType**: `CREDIT`, `DEBIT`, `TRANSFER`
- **AudienceType**: `STUDENT`, `TEACHER`, `PARENT`, `STAFF`, `ALL`
- **AnnouncementType**: `GENERAL`, `URGENT`, `EVENT`, `NEWS`
- **ClassType**: `REGULAR`, `SPECIAL`, `BREAK`, `LAB`, `PRACTICAL`, `ASSIGNMENT`
- **ActionType**: `LOGIN`, `LOGOUT`, `CREATE`, `READ`, `UPDATE`, `DELETE`, `EXPORT`, `IMPORT`

### 2. Primary Models
- **User**: Represents all logged-in profiles. Contains credentials, role identifier, `schoolId` and relations to profiles.
- **Profile**: Extended demographic info (date of birth, NID, blood group, address).
- **School**: Core tenant representing a school (e.g., Greenwood International School) containing code, contact info, and website.
- **Branch**: Represents physical branches (e.g., North Campus, Dhanmondi Campus) under a school.
- **Class**: Classes mapped under a branch (e.g., Class 1 to Class 10) for specific academic years.
- **Section**: Divisions of classes (e.g., Section A, Section B, Section C).
- **Subject**: Academic subjects (e.g., Math, Science) linked to classes.
- **Chapter** & **Lesson**: Structured curriculums/syllabus mapping for subjects.
- **Teacher**: Profile credentials specific to teachers (joining date, experience, subjects taught).
- **Student**: Profile credentials specific to students (roll number, class, section, parent relation).
- **Parent**: Guardian profiles containing relations to multiple students.
- **Staff**: Non-teaching staff (designations, departments).
- **Attendance**: Records daily student and teacher attendance status.
- **Exam**, **ExamSubject**, & **ExamResult**: Detailed exam schedule and marks tracking.
- **Fee** & **Transaction**: Financial accounting for tracking school fee structures, invoice status, credits, debits, and transfers.
- **Account**: Keeps bank balances or cash balances for the school.
- **Timetable** & **ClassRoutine**: Visual schedule maps matching classes, routine slots, teachers, and hours.
- **Book** & **BookBorrowing**: Basic library module for managing stock and checkouts.
- **Vehicle** & **Route**: Transport module for managing school buses and student routes.
- **Announcement**: Broadcast system alerts visible to selected roles.
- **ActivityLog**: System audits capturing database mutations, logs, IPs, and user agents.
- **Settings**: Dynamic JSON fields storing global configurations like school timetables.

---

## 🌐 Complete Routing & Page Structure

Below is a detailed map of all pages in the codebase, grouped by layout boundaries:

### 1. Root & Marketing Pages (`app/(marketing)`)
*All pages share the global `Header` and `Footer` with Framer Motion transitions.*

- **Root Landing Page** (`/` -> `app/page.tsx` & `app/(marketing)/page.tsx`):
  - **Features**: Hero presentation, animated highlights, user testimonials, CTA pricing, and contact links.
- **Features Page** (`/features` -> `app/(marketing)/features/page.tsx`):
  - **Features**: Interactive cards detailing Student Management, Communications, and Administrative modules.
- **Pricing Page** (`/pricing` -> `app/(marketing)/pricing/page.tsx`):
  - **Features**: Details subscription tiers (Basic, Pro, Enterprise) for schools.
- **Contact Page** (`/contact` -> `app/(marketing)/contact/page.tsx`):
  - **Features**: Contact form for requesting demos, along with support channel details.
- **Documentation Page** (`/docs` -> `app/(marketing)/docs/page.tsx`):
  - **Features**: Developer API docs, user tutorials, and interactive navigation trees.

### 2. Authentication & Setup Pages
- **Login Screen** (`/login` -> `app/login/page.tsx`):
  - **Features**: Email & password authentication. Saves JWT `auth_token` in cookies for session persistence.
- **Registration Screen** (`/register` -> `app/register/page.tsx`):
  - **Features**: Creates a new `School` instance and its initial system administrator account simultaneously.
- **Onboarding Setup Screen** (`/setup` -> `app/setup/page.tsx`):
  - **Features**: Stepper-based wizard (`welcome` ➔ `basic` ➔ `establishment` ➔ `location` ➔ `contact` ➔ `branch` ➔ `complete`) to configure a new school profile after registration.

### 3. Protected Dashboard Pages (`app/dashboard/*`)
*Requires `auth_token` verification. Restricted to users with the `ADMIN` role. Uses a custom double-pane dashboard layout with sidebar navigation, top header, and active branch selector context.*

- **Dashboard Overview** (`/dashboard` -> `app/dashboard/page.tsx`):
  - **Features**: Toggleable tabs for **Students** and **Teachers**. Renders cards for counts, overall attendance graphs, performance metrics, calendar appointments, and role-specific announcements.
- **Admissions Management** (`/dashboard/admissions` -> `app/dashboard/admissions/page.tsx`):
  - **Features**: Handles new registrations, application review, and status changes.
- **Student Database** (`/dashboard/students` -> `app/dashboard/students/page.tsx`):
  - **Features**: Comprehensive list of students, search queries, pagination, branch/class/section filters, detailed view modals, inline edit sheets, and delete triggers.
- **Parents Portal Database** (`/dashboard/parents` -> `app/dashboard/parents/page.tsx`):
  - **Features**: Manages parents, links parent records to student accounts, and maps communication addresses.
- **Teacher Database** (`/dashboard/teachers` -> `app/dashboard/teachers/page.tsx`):
  - **Features**: Database of teaching staff, qualifications, join date tracking, assigned subjects, and experience indicators.
- **Classes Management** (`/dashboard/classes` -> `app/dashboard/classes/page.tsx`):
  - **Features**: Configures active academic classes, links head teachers, and maps default sections.
- **Subjects Setup** (`/dashboard/subjects` -> `app/dashboard/subjects/page.tsx`):
  - **Features**: Add, modify, and list subjects (e.g., Mathematics-Class1) with code mappings.
- **Class Routines** (`/dashboard/class-routine` -> `app/dashboard/class-routine/page.tsx` & `addRoutine/page.tsx`):
  - **Features**: Visual routine schedules and routines builder. Allows drag-and-drop or slot selection for teacher, subject, and time ranges.
- **Attendance Monitor** (`/dashboard/attendance` -> `app/dashboard/attendance/page.tsx`):
  - **Features**: Interactive roll-call sheets where admins or teachers mark students `PRESENT`, `ABSENT`, or `LATE` for any given date.
- **Exams Module** (`/dashboard/exams` -> `app/dashboard/exams/page.tsx`):
  - **Features**: Add exam terms (Midterm, Final), schedule exam subjects with dates/times, and enter marks to calculate final grades and GPA.
- **Branches Module** (`/dashboard/branches` -> `app/dashboard/branches/page.tsx`):
  - **Features**: Add or modify branches (e.g., North Campus) under the parent organization.
- **Announcements Portal** (`/dashboard/announcements` -> `app/dashboard/announcements/page.tsx`):
  - **Features**: Creates general, urgent, or event-based notifications, with options to target specific audiences (All, Students, Teachers, Parents, Staff).
- **Accounts & Finances** (`/dashboard/accounts` -> `app/dashboard/accounts/page.tsx`):
  - **Features**: Tracks cash/bank balances, invoices, debit/credit transactions, fee payments, and overall revenues.
- **Library Module** (`/dashboard/library` -> `app/dashboard/library/page.tsx`):
  - **Features**: Library inventory log containing ISBNs, quantities, and book issue/return tracking.
- **Transport Module** (`/dashboard/transport` -> `app/dashboard/transport/page.tsx`):
  - **Features**: Vehicle inventory tracking, bus capacity calculations, and driver contact mapping.
- **Staff Directory** (`/dashboard/staff` -> `app/dashboard/staff/page.tsx`):
  - **Features**: Directory of administrative, kitchen, maintenance, and support staff.
- **Settings Screen** (`/dashboard/settings` -> `app/dashboard/settings/page.tsx`):
  - **Features**: Configurations for academic years, weekend schedules, class hour durations, and system-wide settings.

### 4. Interactive Sandbox Modules (`app/(modules)/*`)
*Represent basic placeholder templates, potentially for student/teacher access or secondary navigation integration:*
- `/admissions` -> admissions page
- `/attendance` -> attendance tracker
- `/grades` -> student grade book
- `/communication` -> messaging panel
- `/payments` -> invoice/fee calculator
- `/calendar` -> generic event schedule
- `/api` -> developer docs interface

---

## ⚡ Server Actions (`app/actions/*`)

The app uses Server Actions as a direct RPC (Remote Procedure Call) layer to talk to PostgreSQL through Prisma. This eliminates the need for separate GET/POST API endpoints.

| Action File | Key Functions | Description |
| :--- | :--- | :--- |
| **`auth.ts`** | `registerSchoolAndAdmin`, `loginUser` | Handles signup hash creation, JWT signatures, and login validations. |
| **`admission.ts`** | `getAdmissions`, `createAdmission`, `updateAdmissionStatus` | Manages registration requests and admission steps. |
| **`branches.ts`** | `getBranches`, `createBranch`, `updateBranch` | CRUD actions for school branches. |
| **`classes.ts`** | `getClasses`, `createClass`, `updateClass`, `deleteClass` | Manages school classes and links them to branches. |
| **`sections.ts`** | `getSections`, `createSection`, `updateSection` | Division setup under parent classes. |
| **`subjects.ts`** | `getSubjects`, `createSubject`, `updateSubject`, `deleteSubject` | Manages curricula and maps subject codes. |
| **`teachers.ts`** | `getTeachers`, `createTeacher`, `updateTeacher`, `deleteTeacher` | Manages teaching staff and credentials. |
| **`students.ts`** | `getStudents`, `createStudent`, `updateStudent`, `deleteStudent` | Manages student credentials, classes, sections, and parents. |
| **`parents.ts`** | `getParents`, `createParent`, `updateParent` | Guardian profiling and student links. |
| **`staff.ts`** | `getStaff`, `createStaff`, `updateStaff`, `deleteStaff` | Directory support actions for staff. |
| **`classRoutine.ts`** | `getClassRoutines`, `createClassRoutine`, `saveRoutineSlots` | Manages timetables and routine slots. |
| **`timetables.ts`** | `getTimetables`, `createTimetable` | Class routing schedules. |
| **`settings.ts`** | `getSettings`, `saveSettings` | School-wide variables. |

---

## 🔒 Authentication & Authorization

1. **Token Storage**: On successful login (`POST /api/auth/login`), a JWT is returned and stored in the browser's cookies under the key `auth_token`.
2. **Middleware Guard (`middleware.ts`)**:
   - Intercepts requests.
   - Extracts the JWT from headers or cookies.
   - Sets headers (`X-User-Id` and `X-User-Role`) for sub-routes if authorization is successful.
3. **Layout Guard (`app/dashboard/layout.tsx`)**:
   - Server-side cookie retrieval (`cookies().get('auth_token')`).
   - Verifies token validity using `verifyToken()`.
   - Checks role assignment: if the role is not **`ADMIN`**, redirects the user directly to `/login`.

---

## 📄 Reorganized User Manuals (`docs/user-manual/*`)

For deep instruction manuals, refer to the files in `docs/user-manual/`:
- [01-getting-started.md](file:///d:/TechSoul/aamar-school/docs/user-manual/01-getting-started.md): Installation requirements, basic setup, logging in.
- [02-admin-guide.md](file:///d:/TechSoul/aamar-school/docs/user-manual/02-admin-guide.md): Detailed instruction manual on user creation, financial audits, settings configuration.
- [03-teacher-guide.md](file:///d:/TechSoul/aamar-school/docs/user-manual/03-teacher-guide.md): Manual on taking attendance, writing homework tasks, grading.
- [04-student-guide.md](file:///d:/TechSoul/aamar-school/docs/user-manual/04-student-guide.md): Manual on accessing class routines, looking up grades, borrowing books.
- [05-parent-guide.md](file:///d:/TechSoul/aamar-school/docs/user-manual/05-parent-guide.md): Manual on paying tuition fees, viewing children's attendance, and corresponding with teachers.
- [06-troubleshooting.md](file:///d:/TechSoul/aamar-school/docs/user-manual/06-troubleshooting.md) & [07-faq.md](file:///d:/TechSoul/aamar-school/docs/user-manual/07-faq.md): Quick guides for common bugs, network latency, password resets.
