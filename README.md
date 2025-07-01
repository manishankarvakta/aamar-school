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

## 📚 Documentation

### User Manuals

#### 🎯 Quick Start
- **[Getting Started Guide](./docs/user-manual/01-getting-started.md)** - System overview, first-time setup, login, requirements
- **[Master Index](./docs/user-manual/README.md)** - Complete navigation and overview

#### 👥 Role-Specific Guides
- **[Administrator Guide](./docs/user-manual/02-admin-guide.md)** - Complete admin functions and management
- **[Teacher Guide](./docs/user-manual/03-teacher-guide.md)** - Teaching tools and class management
- **[Student Guide](./docs/user-manual/04-student-guide.md)** - Student features and academic tools
- **[Parent Guide](./docs/user-manual/05-parent-guide.md)** - Parent monitoring and communication

#### 🛠️ Support & Help
- **[Troubleshooting Guide](./docs/user-manual/06-troubleshooting.md)** - Common issues and solutions
- **[FAQ](./docs/user-manual/07-faq.md)** - Frequently asked questions and quick answers

#### 📖 Complete User Manual
- **[Main User Manual](./docs/user-manual.md)** - Overview and navigation to all sections

### Developer Documentation
- **[Developer Documentation](./docs/dev-docs.md)** - Technical documentation for developers

## 🚀 Quick Navigation by User Type

### For Administrators
1. **[Getting Started](./docs/user-manual/01-getting-started.md)** - System overview
2. **[Administrator Guide](./docs/user-manual/02-admin-guide.md)** - Complete admin functions
3. **[Troubleshooting](./docs/user-manual/06-troubleshooting.md)** - Support and issues
4. **[FAQ](./docs/user-manual/07-faq.md)** - Quick answers

### For Teachers
1. **[Getting Started](./docs/user-manual/01-getting-started.md)** - System basics
2. **[Teacher Guide](./docs/user-manual/03-teacher-guide.md)** - Teaching tools
3. **[Troubleshooting](./docs/user-manual/06-troubleshooting.md)** - Support
4. **[FAQ](./docs/user-manual/07-faq.md)** - Common questions

### For Students
1. **[Getting Started](./docs/user-manual/01-getting-started.md)** - System overview
2. **[Student Guide](./docs/user-manual/04-student-guide.md)** - Student features
3. **[Troubleshooting](./docs/user-manual/06-troubleshooting.md)** - Help
4. **[FAQ](./docs/user-manual/07-faq.md)** - Quick answers

### For Parents
1. **[Getting Started](./docs/user-manual/01-getting-started.md)** - System overview
2. **[Parent Guide](./docs/user-manual/05-parent-guide.md)** - Parent features
3. **[Troubleshooting](./docs/user-manual/06-troubleshooting.md)** - Support
4. **[FAQ](./docs/user-manual/07-faq.md)** - Common questions

## 📋 Getting Started Checklist

### For New Users
- [ ] Read the **[Getting Started Guide](./docs/user-manual/01-getting-started.md)**
- [ ] Complete your profile setup
- [ ] Explore your dashboard
- [ ] Try basic functions
- [ ] Set up notifications
- [ ] Read your role-specific guide

### For Administrators
- [ ] Complete system setup
- [ ] Configure school settings
- [ ] Add users and assign roles
- [ ] Set up academic calendar
- [ ] Configure fee structure
- [ ] Test all modules

### For Teachers
- [ ] Review assigned classes
- [ ] Set up attendance tracking
- [ ] Create sample assignments
- [ ] Test communication tools
- [ ] Review reporting features
- [ ] Practice grading system

### For Students
- [ ] Complete profile information
- [ ] Review class schedule
- [ ] Check assignment submission
- [ ] Test communication features
- [ ] Explore library resources
- [ ] Set up notifications

### For Parents
- [ ] Link child accounts
- [ ] Review academic progress
- [ ] Test fee payment system
- [ ] Set up communication preferences
- [ ] Explore monitoring features
- [ ] Configure notifications

## 🔧 System Features Overview

### Core Modules

**Academic Management**
- Class and section management
- Subject management
- Timetable creation
- Grade management
- Assignment system

**Student Management**
- Student registration
- Profile management
- Academic tracking
- Attendance monitoring
- Progress reporting

**Teacher Management**
- Teacher registration
- Class assignments
- Performance tracking
- Communication tools
- Resource management

**Fee Management**
- Fee structure setup
- Online payments
- Payment tracking
- Fee reports
- Outstanding management

**Communication Tools**
- Internal messaging
- Announcements
- Meeting scheduling
- Parent communication
- Notification system

**Library Management**
- Book catalog
- Borrowing system
- Digital resources
- Study materials
- Resource tracking

**Transport Management**
- Route management
- Vehicle tracking
- Driver management
- Schedule management
- Safety monitoring

## 📱 System Requirements

### Browser Requirements
- **Chrome**: Version 90 or higher
- **Firefox**: Version 88 or higher
- **Safari**: Version 14 or higher
- **Edge**: Version 90 or higher

### Device Requirements
- **Desktop/Laptop**: Windows 10+, macOS 10.14+, Linux
- **Tablet**: iOS 14+, Android 8+
- **Smartphone**: iOS 14+, Android 8+

### Internet Requirements
- **Minimum**: 1 Mbps download, 512 Kbps upload
- **Recommended**: 5 Mbps download, 2 Mbps upload

## 🔐 Security Features

### Authentication & Authorization
- Secure login system
- Role-based access control
- Two-factor authentication
- Session management
- Password policies

### Data Protection
- Encrypted data transmission
- Secure data storage
- Regular backups
- Access logging
- Privacy controls

## 📞 Support & Help

### Getting Help

**Self-Service Options**
- **[Complete User Manual](./docs/user-manual/)** - Comprehensive documentation
- **[Troubleshooting Guide](./docs/user-manual/06-troubleshooting.md)** - Common issues and solutions
- **[FAQ Section](./docs/user-manual/07-faq.md)** - Quick answers to common questions

**Direct Support**
- **Email**: support@aamarschool.com
- **Phone**: +1-XXX-XXX-XXXX
- **Live Chat**: Available 24/7
- **Ticket System**: For complex issues

### Support Hours
- **Technical Support**: Monday-Friday, 9 AM-6 PM
- **Emergency Support**: 24/7
- **Live Chat**: Available 24/7
- **Email Support**: 24-hour response time

## 🔄 Updates & Maintenance

### System Updates
- Regular feature updates
- Security patches
- Performance improvements
- Bug fixes

### Maintenance Windows
- Scheduled maintenance: Sundays, 2 AM-6 AM
- Emergency maintenance: As needed
- User notifications: 24 hours in advance

## 📊 Training Resources

### Available Training
- **Online Tutorials**: Step-by-step guides in the user manual
- **Video Training**: Visual demonstrations
- **Webinars**: Live training sessions
- **Documentation**: Comprehensive guides
- **Support Sessions**: One-on-one help

## 🤝 Feedback & Improvement

### Providing Feedback
- **Feature Requests**: Submit through support
- **Bug Reports**: Include detailed information
- **Improvement Suggestions**: Share ideas
- **User Surveys**: Regular feedback collection

## 📞 Contact Information

**Technical Support**
- Email: support@aamarschool.com
- Phone: +1-XXX-XXX-XXXX
- Live Chat: Available 24/7

**School Administration**
- Contact your school's main office
- Speak with IT department
- Request administrator access

**Emergency Support**
- Emergency Line: Available 24/7
- Critical Issues: Immediate response
- System Outages: Priority handling

## 📚 Recommended Reading Order

1. **[Getting Started Guide](./docs/user-manual/01-getting-started.md)** - Essential for all users
2. **Your Role-Specific Guide** - Based on your user type
3. **[Troubleshooting Guide](./docs/user-manual/06-troubleshooting.md)** - For any issues
4. **[FAQ](./docs/user-manual/07-faq.md)** - For quick answers
5. **[Master Index](./docs/user-manual/README.md)** - For complete navigation

## License

MIT

## Support

For support, email support@aamarschool.com or create an issue in the repository.

---

*This README provides an overview of the Aamar School Management System. For detailed user guides, please refer to the comprehensive documentation in the [docs/user-manual/](./docs/user-manual/) directory.*

**Last Updated**: December 2024
**Version**: 2.0
**System Version**: Aamar School Management System v2.0 