# Developer Documentation

## Architecture Overview

The Aamar School Management System is built using a modern tech stack with a focus on scalability, maintainability, and developer experience.

### Core Technologies

- **Next.js 14**: App Router for server-side rendering and API routes
- **TypeScript**: For type safety and better developer experience
- **Prisma**: Type-safe ORM for database operations
- **PostgreSQL**: Primary database
- **JWT**: For authentication and authorization
- **shadcn/ui**: Component library for consistent UI

## Project Structure

```
aamar-school/
├── app/                    # Next.js app directory
│   ├── modules/           # Feature modules
│   │   ├── auth/         # Authentication
│   │   ├── students/     # Student management
│   │   ├── teachers/     # Teacher management
│   │   └── ...
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── ui/              # UI components
│   └── shared/          # Shared components
├── lib/                  # Utility functions
│   ├── auth/            # Authentication utilities
│   ├── db/              # Database utilities
│   └── utils/           # General utilities
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── tests/               # Test files
```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Write comments for complex logic
- Keep components small and focused

### Git Workflow

1. Create feature branches from `main`
2. Write meaningful commit messages
3. Create pull requests for code review
4. Ensure all tests pass before merging

### Database

- Use Prisma migrations for schema changes
- Write migrations in a way that can be rolled back
- Include seed data for development
- Use transactions for related operations

### Testing

- Write unit tests for business logic
- Use Playwright for E2E tests
- Maintain test coverage above 80%
- Test edge cases and error scenarios

## API Design

### REST Endpoints

- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Return appropriate status codes
- Include error handling
- Use query parameters for filtering
- Implement pagination for list endpoints

### Server Actions

- Use for form submissions
- Handle validation
- Implement proper error handling
- Return appropriate responses

## Authentication

- JWT-based authentication
- Role-based access control
- Secure password hashing
- Token refresh mechanism
- Session management

## Deployment

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Steps

1. Build the application:
   ```bash
   npm run build
   ```

2. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Common Issues and Solutions

### Database Connection

If you encounter database connection issues:
1. Check environment variables
2. Ensure PostgreSQL is running
3. Verify network connectivity
4. Check Prisma client generation

### Authentication

For authentication issues:
1. Verify JWT secret
2. Check token expiration
3. Validate user roles
4. Review session management

## Performance Optimization

- Use proper indexing in database
- Implement caching where appropriate
- Optimize images and assets
- Use proper loading states
- Implement pagination for large datasets

## Security Best Practices

- Sanitize user inputs
- Use proper CORS configuration
- Implement rate limiting
- Regular security audits
- Keep dependencies updated

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Create a pull request

## Support

For technical support:
- Create an issue in the repository
- Contact the development team
- Check the documentation
- Review common issues 