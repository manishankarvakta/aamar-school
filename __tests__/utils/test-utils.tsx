import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock data generators
export const mockTeacher = (overrides: any = {}) => ({
  id: '1',
  teacherId: 'T001',
  employeeId: 'EMP001',
  name: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '1234567890',
  qualification: 'M.Ed',
  experience: 5,
  specialization: 'Mathematics',
  subjects: ['Mathematics', 'Physics'],
  branch: {
    id: 'branch1',
    name: 'Main Campus'
  },
  school: {
    name: 'Test School'
  },
  totalClasses: 3,
  totalSubjects: 2,
  status: 'Active',
  joiningDate: new Date('2023-01-01'),
  ...overrides
});

export const mockStudent = (overrides: any = {}) => ({
  id: '1',
  rollNumber: 'S001',
  admissionDate: new Date('2023-01-01'),
  user: {
    id: 'user1',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice@example.com',
    isActive: true,
    profile: {
      phone: '1234567890',
      address: '123 Student St',
      dateOfBirth: new Date('2010-01-01'),
      gender: 'FEMALE',
      bloodGroup: 'A+'
    },
    branch: {
      id: 'branch1',
      name: 'Main Campus'
    }
  },
  class: {
    id: 'class1',
    name: 'Grade 5',
    section: 'A',
    academicYear: '2023-2024'
  },
  parent: {
    id: 'parent1',
    relation: 'Mother',
    user: {
      firstName: 'Mary',
      lastName: 'Johnson',
      email: 'mary@example.com'
    }
  },
  attendance: [],
  examResults: [],
  fees: [],
  ...overrides
});

export const mockParent = (overrides: any = {}) => ({
  id: '1',
  parentId: 'P001',
  name: 'Mary Johnson',
  firstName: 'Mary',
  lastName: 'Johnson',
  email: 'mary@example.com',
  phone: '1234567890',
  relation: 'Mother',
  occupation: 'Engineer',
  students: [
    {
      id: '1',
      name: 'Alice Johnson',
      rollNumber: 'S001',
      class: 'Grade 5 A',
      branch: 'Main Campus'
    }
  ],
  totalStudents: 1,
  lastContact: new Date('2023-12-01'),
  status: 'Active',
  createdAt: new Date('2023-01-01'),
  ...overrides
});

// API Response generators
export const mockApiResponse = (success = true, data: any = null, error: string | null = null) => ({
  success,
  data,
  error,
  message: success ? 'Operation successful' : error || 'Operation failed'
});

export const mockApiError = (error: string) => mockApiResponse(false, null, error);

export const mockApiSuccess = (data: any) => mockApiResponse(true, data, null);

// Form data utilities
export const createFormData = (data: Record<string, string>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};

// Test wrapper components
interface TestWrapperProps {
  children: React.ReactNode;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestWrapper, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock handlers for MSW (if using Mock Service Worker)
export const mockHandlers = [
  // Add mock handlers here when using MSW
];

// Test environment setup helpers
export const setupTestEnvironment = () => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
};

// Database test utilities
export const clearTestDatabase = async () => {
  // Add database cleanup logic for tests
  console.log('Clearing test database...');
};

export const seedTestDatabase = async () => {
  // Add database seeding logic for tests
  console.log('Seeding test database...');
};

// Authentication test utilities
export const mockAuthenticatedUser = (role = 'ADMIN') => ({
  id: 'user1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role,
  schoolId: 'school1',
  branchId: 'branch1',
  isActive: true
});

export const mockAuthSession = (user = mockAuthenticatedUser()) => ({
  user,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
});

// Test data constants
export const TEST_IDS = {
  // Teachers
  TEACHERS_TABLE: 'teachers-table',
  TEACHER_ROW: 'teacher-row',
  ADD_TEACHER_BUTTON: 'add-teacher-button',
  TEACHER_SEARCH_INPUT: 'teacher-search-input',
  EXPERIENCE_FILTER: 'experience-filter',
  BRANCH_FILTER: 'branch-filter',
  
  // Students
  STUDENTS_TABLE: 'students-table',
  STUDENT_ROW: 'student-row',
  ADD_STUDENT_BUTTON: 'add-student-button',
  
  // Parents
  PARENTS_TABLE: 'parents-table',
  PARENT_ROW: 'parent-row',
  ADD_PARENT_BUTTON: 'add-parent-button',
  
  // Common
  ITEMS_PER_PAGE: 'items-per-page',
  PAGINATION_INFO: 'pagination-info',
  CLEAR_FILTERS_BUTTON: 'clear-filters-button',
  LOADING_SPINNER: 'loading-spinner',
  ERROR_MESSAGE: 'error-message',
  
  // Forms
  FIELD_ERROR: 'field-error',
  SUBMIT_BUTTON: 'submit-button',
  CANCEL_BUTTON: 'cancel-button',
  
  // Dialogs
  VIEW_DIALOG: 'view-dialog',
  EDIT_DIALOG: 'edit-dialog',
  DELETE_DIALOG: 'delete-dialog',
  
  // Auth
  LOGIN_FORM: 'login-form',
  LOGIN_ERROR: 'login-error',
  LOGOUT_BUTTON: 'logout-button',
  PASSWORD_TOGGLE: 'password-toggle',
  REMEMBER_ME: 'remember-me'
} as const;

// Performance test utilities
export const measureRenderTime = (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

// Accessibility test utilities
export const checkAccessibility = async (container: HTMLElement) => {
  // Basic accessibility checks
  const buttons = container.querySelectorAll('button');
  const inputs = container.querySelectorAll('input');
  const links = container.querySelectorAll('a');
  
  // Check for required ARIA attributes
  buttons.forEach(button => {
    if (!button.textContent && !button.getAttribute('aria-label')) {
      console.warn('Button missing accessible label:', button);
    }
  });
  
  inputs.forEach(input => {
    if (input.type !== 'hidden' && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
      const label = container.querySelector(`label[for="${input.id}"]`);
      if (!label) {
        console.warn('Input missing label:', input);
      }
    }
  });
  
  return true;
}; 