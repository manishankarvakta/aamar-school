# Testing Documentation

## Overview

This project implements a comprehensive testing strategy using Jest for unit/integration tests and Playwright for E2E tests.

## Testing Stack

- **Unit Tests**: Jest + Testing Library
- **E2E Tests**: Playwright
- **Mocking**: Jest mocks + MSW (optional)
- **Coverage**: Jest coverage reports
- **CI/CD**: GitHub Actions

## Test Structure

```
├── __tests__/
│   ├── actions/           # Business logic tests
│   ├── components/        # UI component tests
│   ├── pages/            # Page component tests
│   └── utils/            # Test utilities
├── e2e/                  # End-to-end tests
│   ├── auth.spec.ts      # Authentication flows
│   ├── teachers.spec.ts  # Teachers management
│   └── students.spec.ts  # Students management
├── jest.config.ts        # Jest configuration
├── jest.setup.ts         # Jest setup and mocks
└── playwright.config.ts  # Playwright configuration
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test teachers.test.ts
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run specific E2E test
npx playwright test auth.spec.ts
```

### All Tests

```bash
# Run both unit and E2E tests
npm run test:all
```

## Test Categories

### 1. Unit Tests

#### Actions Tests (`__tests__/actions/`)

Test business logic and data operations:

- **Teachers Actions** (`teachers.test.ts`)
  - CRUD operations
  - Data validation
  - Error handling
  - Database mocking

- **Students Actions** (`students.test.ts`)
  - Student management
  - Statistics calculation
  - Form processing

Example:
```typescript
describe('getTeachers', () => {
  it('should return teachers successfully', async () => {
    mockPrisma.teacher.findMany.mockResolvedValue(mockTeachers);
    
    const result = await getTeachers('school123');
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });
});
```

#### Component Tests (`__tests__/components/`)

Test UI components in isolation:

- **Teachers Page** (`teachers-page.test.tsx`)
  - Rendering with data
  - Search functionality
  - Filtering
  - Pagination
  - Form interactions

Example:
```typescript
describe('TeachersPage Component', () => {
  it('renders teachers page with data', async () => {
    render(<TeachersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

### 2. E2E Tests

#### Authentication Tests (`e2e/auth.spec.ts`)

- Login/logout flows
- Role-based access control
- Session management
- Form validation

#### Teachers Management (`e2e/teachers.spec.ts`)

- Teachers list display
- CRUD operations
- Search and filtering
- Pagination
- Responsive design

Example:
```typescript
test('should display teachers list', async ({ page }) => {
  await page.goto('/dashboard/teachers');
  
  const table = page.locator('[data-testid="teachers-table"]');
  await expect(table).toBeVisible();
});
```

## Test Data Management

### Mock Data

Use test utilities for consistent mock data:

```typescript
import { mockTeacher, mockStudent } from '__tests__/utils/test-utils';

const teacher = mockTeacher({ name: 'Custom Name' });
const student = mockStudent({ rollNumber: 'S999' });
```

### Test IDs

Use standardized test IDs for reliable E2E tests:

```typescript
import { TEST_IDS } from '__tests__/utils/test-utils';

// In components
<table data-testid={TEST_IDS.TEACHERS_TABLE}>

// In tests
const table = page.locator(`[data-testid="${TEST_IDS.TEACHERS_TABLE}"]`);
```

### Database Setup

For E2E tests requiring database:

1. Use test database: `aamar_school_test`
2. Run migrations: `npm run prisma:migrate`
3. Seed test data if needed

## Mocking Strategy

### API Mocking

```typescript
// Mock server actions
jest.mock('@/app/actions/teachers', () => ({
  getTeachers: jest.fn(),
  createTeacher: jest.fn(),
}));
```

### External Dependencies

```typescript
// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock authentication
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: mockSession }),
}));
```

## Coverage Requirements

- **Minimum Coverage**: 80%
- **Actions**: 90%+ (business logic)
- **Components**: 70%+ (UI components)
- **E2E**: Critical user flows

## Best Practices

### Unit Tests

1. **Test Behavior, Not Implementation**
   ```typescript
   // Good
   expect(screen.getByText('John Doe')).toBeInTheDocument();
   
   // Avoid
   expect(component.state.teachers).toHaveLength(1);
   ```

2. **Use Descriptive Test Names**
   ```typescript
   it('should filter teachers by experience range when filter is applied')
   ```

3. **Arrange, Act, Assert**
   ```typescript
   it('should create teacher successfully', async () => {
     // Arrange
     const formData = createFormData({ name: 'John' });
     
     // Act
     const result = await createTeacher(formData);
     
     // Assert
     expect(result.success).toBe(true);
   });
   ```

### E2E Tests

1. **Use Page Object Model**
   ```typescript
   class TeachersPage {
     constructor(private page: Page) {}
     
     async searchTeacher(name: string) {
       await this.page.fill('[data-testid="teacher-search"]', name);
     }
   }
   ```

2. **Wait for Stable State**
   ```typescript
   await page.waitForLoadState('networkidle');
   await expect(page.locator('text=Loading')).not.toBeVisible();
   ```

3. **Use Reliable Selectors**
   ```typescript
   // Good
   page.locator('[data-testid="submit-button"]')
   
   // Avoid
   page.locator('.btn-primary')
   ```

## CI/CD Integration

Tests run automatically on:
- **Pull Requests**: All tests
- **Main Branch**: All tests + deployment
- **Feature Branches**: Unit tests only

### GitHub Actions Workflow

1. **Unit Tests**: Run on Node 18.x and 20.x
2. **E2E Tests**: Run on Ubuntu with PostgreSQL
3. **Type Checking**: TypeScript validation
4. **Coverage**: Upload to Codecov

## Debugging Tests

### Jest Debug

```bash
# Debug specific test
node --inspect-brk node_modules/.bin/jest teachers.test.ts --runInBand

# Debug with VS Code
# Add breakpoint and run "Jest Debug" configuration
```

### Playwright Debug

```bash
# Debug mode
npx playwright test --debug

# UI mode
npx playwright test --ui

# Trace viewer
npx playwright show-trace trace.zip
```

## Performance Testing

### Component Render Time

```typescript
import { measureRenderTime } from '__tests__/utils/test-utils';

const renderTime = measureRenderTime(() => {
  render(<TeachersPage />);
});

expect(renderTime).toBeLessThan(100); // ms
```

### Accessibility Testing

```typescript
import { checkAccessibility } from '__tests__/utils/test-utils';

const { container } = render(<TeachersPage />);
await checkAccessibility(container);
```

## Environment Variables

Set these for E2E tests:

```env
TEST_USER_EMAIL=admin@aamarschool.com
TEST_USER_PASSWORD=password123
TEST_ADMIN_EMAIL=admin@aamarschool.com
TEST_ADMIN_PASSWORD=password123
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aamar_school_test
```

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in `jest.config.ts`
   - Use `waitFor` for async operations

2. **E2E tests flaky**
   - Add proper waits
   - Use data-testid attributes
   - Check for loading states

3. **Mock not working**
   - Ensure mock is before import
   - Clear mocks between tests
   - Check mock implementation

### Debug Commands

```bash
# Check test files
npm test -- --listTests

# Run with verbose output
npm test -- --verbose

# Run specific describe block
npm test -- --testNamePattern="Teachers Actions"
``` 