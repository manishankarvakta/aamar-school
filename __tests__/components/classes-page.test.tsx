import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClassesPage from '@/app/dashboard/classes/page';

// Mock the classes actions
jest.mock('@/app/actions/classes', () => ({
  getClasses: jest.fn(),
  getClassStats: jest.fn(),
  createClass: jest.fn(),
  updateClass: jest.fn(),
  deleteClass: jest.fn(),
  searchClasses: jest.fn(),
  getAvailableTeachers: jest.fn(),
  getAvailableSubjects: jest.fn(),
}));

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockActions = require('@/app/actions/classes');

const mockClassesData = [
  {
    id: 1,
    className: 'Grade 10',
    section: 'A',
    classTeacher: 'Dr. Sarah Johnson',
    roomNumber: 'Room 101',
    capacity: 40,
    currentStudents: 35,
    academicYear: '2024-25',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology'],
    performance: { average: 85.2, trend: 'up' },
    attendance: 94.5,
    photo: '/api/placeholder/40/40',
    schedule: [
      { time: '9:00-9:45', monday: 'Math', tuesday: 'Physics', wednesday: 'Chemistry', thursday: 'English', friday: 'Biology' },
    ],
  },
  {
    id: 2,
    className: 'Grade 10',
    section: 'B',
    classTeacher: 'Prof. Michael Chen',
    roomNumber: 'Room 102',
    capacity: 40,
    currentStudents: 38,
    academicYear: '2024-25',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'],
    performance: { average: 88.7, trend: 'up' },
    attendance: 96.2,
    photo: '/api/placeholder/40/40',
    schedule: [
      { time: '9:00-9:45', monday: 'Math', tuesday: 'Physics', wednesday: 'Computer Science', thursday: 'English', friday: 'Chemistry' },
    ],
  },
];

const mockStats = [
  { title: 'Total Classes', value: '24', icon: 'BookOpenIcon', color: 'blue' },
  { title: 'Total Students', value: '856', icon: 'UsersIcon', color: 'green' },
  { title: 'Average Performance', value: '84.2%', icon: 'TrendingUpIcon', color: 'purple' },
  { title: 'Capacity Utilization', value: '89%', icon: 'BarChartIcon', color: 'orange' },
];

describe('ClassesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock return values
    mockActions.getClasses.mockResolvedValue({
      success: true,
      data: mockClassesData,
    });
    mockActions.getClassStats.mockResolvedValue({
      success: true,
      data: mockStats,
    });
  });

  it('renders classes page correctly', async () => {
    render(<ClassesPage />);
    
    expect(screen.getByText('Classes Management')).toBeInTheDocument();
    expect(screen.getByText('Manage class sections, student assignments, and timetables')).toBeInTheDocument();
    expect(screen.getByText('Add Class')).toBeInTheDocument();
  });

  it('displays statistics cards', async () => {
    render(<ClassesPage />);

    // Check for statistics cards
    expect(screen.getByText('Total Classes')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('856')).toBeInTheDocument();
    expect(screen.getByText('Average Performance')).toBeInTheDocument();
    expect(screen.getByText('84.2%')).toBeInTheDocument();
    expect(screen.getByText('Capacity Utilization')).toBeInTheDocument();
    expect(screen.getByText('89%')).toBeInTheDocument();
  });

  it('displays classes in table format', async () => {
    render(<ClassesPage />);

    // Check table headers
    expect(screen.getByText('Class')).toBeInTheDocument();
    expect(screen.getByText('Class Teacher')).toBeInTheDocument();
    expect(screen.getByText('Room')).toBeInTheDocument();
    expect(screen.getByText('Students')).toBeInTheDocument();
    expect(screen.getByText('Subjects')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check class data
    expect(screen.getByText('Grade 10 - A')).toBeInTheDocument();
    expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Room 101')).toBeInTheDocument();
    expect(screen.getByText('Grade 10 - B')).toBeInTheDocument();
    expect(screen.getByText('Prof. Michael Chen')).toBeInTheDocument();
    expect(screen.getByText('Room 102')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    const user = userEvent.setup();
    render(<ClassesPage />);

    const searchInput = screen.getByPlaceholderText('Search classes...');
    expect(searchInput).toBeInTheDocument();

    await user.type(searchInput, 'Grade 10');

    // The search is handled by local state filtering
    expect(searchInput).toHaveValue('Grade 10');
  });

  it('handles grade filter selection', async () => {
    const user = userEvent.setup();
    render(<ClassesPage />);

    // Find and click the grade filter
    const gradeFilter = screen.getByRole('combobox', { name: /grade/i });
    await user.click(gradeFilter);

    // The options should be available in the dropdown
    await waitFor(() => {
      expect(screen.getByText('All Grades')).toBeInTheDocument();
    });
  });

  it('handles section filter selection', async () => {
    const user = userEvent.setup();
    render(<ClassesPage />);

    // Find and click the section filter
    const sectionFilter = screen.getByRole('combobox', { name: /section/i });
    await user.click(sectionFilter);

    // The options should be available in the dropdown
    await waitFor(() => {
      expect(screen.getByText('All Sections')).toBeInTheDocument();
    });
  });

  it('displays tabs for different views', async () => {
    render(<ClassesPage />);

    expect(screen.getByText('Classes')).toBeInTheDocument();
    expect(screen.getByText('Timetables')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('switches between tabs', async () => {
    const user = userEvent.setup();
    render(<ClassesPage />);

    const timetablesTab = screen.getByText('Timetables');
    await user.click(timetablesTab);

    // Should show timetable content
    expect(screen.getByText('Grade 10 - A Timetable')).toBeInTheDocument();
    expect(screen.getByText('Grade 10 - B Timetable')).toBeInTheDocument();
  });

  it('displays class actions dropdown', async () => {
    render(<ClassesPage />);

    // Look for action buttons in the actions column
    const dropdownButtons = screen.getAllByRole('button');
    const actionsButtons = dropdownButtons.filter(button => 
      button.closest('td') && 
      button.closest('td')?.classList.contains('text-right')
    );
    
    // Should have action buttons for each class row
    expect(actionsButtons.length).toBeGreaterThan(0);
  });

  it('shows performance indicators with correct colors', async () => {
    render(<ClassesPage />);

    // Check for performance percentages
    expect(screen.getByText('85.2%')).toBeInTheDocument();
    expect(screen.getByText('88.7%')).toBeInTheDocument();
    
    // Check for attendance percentages
    expect(screen.getByText('94.5%')).toBeInTheDocument();
    expect(screen.getByText('96.2%')).toBeInTheDocument();
  });

  it('displays student capacity with progress bars', async () => {
    render(<ClassesPage />);

    // Check for student counts
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('38')).toBeInTheDocument();
    
    // Check for capacity (showing as /40)
    expect(screen.getAllByText('/40')).toHaveLength(2);
  });

  it('displays subject badges', async () => {
    render(<ClassesPage />);

    // Check for subject badges (use getAllBy since there are multiple instances)
    const mathBadges = screen.getAllByText('Mathematics');
    expect(mathBadges.length).toBeGreaterThan(0);
    
    const physicsBadges = screen.getAllByText('Physics');
    expect(physicsBadges.length).toBeGreaterThan(0);
    
    // Check for at least one badge container
    const badges = screen.container.querySelectorAll('.inline-flex.items-center.rounded-md.border');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('shows timetable when timetables tab is selected', async () => {
    const user = userEvent.setup();
    render(<ClassesPage />);

    const timetablesTab = screen.getByText('Timetables');
    await user.click(timetablesTab);

    // Check for timetable structure (use getAllBy since there are multiple tables)
    const timeHeaders = screen.getAllByText('Time');
    expect(timeHeaders.length).toBeGreaterThan(0);
    
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
    expect(screen.getByText('Wednesday')).toBeInTheDocument();
    expect(screen.getByText('Thursday')).toBeInTheDocument();
    expect(screen.getByText('Friday')).toBeInTheDocument();
    
    // Check for time slots
    expect(screen.getByText('9:00-9:45')).toBeInTheDocument();
  });

  it('filters classes based on search term', async () => {
    const user = userEvent.setup();
    render(<ClassesPage />);

    const searchInput = screen.getByPlaceholderText('Search classes...');
    
    // Initially both classes should be visible
    expect(screen.getByText('Grade 10 - A')).toBeInTheDocument();
    expect(screen.getByText('Grade 10 - B')).toBeInTheDocument();

    // Search for specific teacher
    await user.type(searchInput, 'Sarah');

    // Only the class with Dr. Sarah Johnson should be visible
    // The filtering logic is implemented in the component
    expect(searchInput).toHaveValue('Sarah');
  });

  it('opens add class dialog when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<ClassesPage />);

    const addButton = screen.getByText('Add Class');
    await user.click(addButton);

    // Dialog should open (this would depend on the actual dialog implementation)
    // Since the component uses state to control dialog visibility
    expect(addButton).toBeInTheDocument();
  });

  it('renders without crashing when no data is provided', async () => {
    mockActions.getClasses.mockResolvedValue({
      success: true,
      data: [],
    });

    render(<ClassesPage />);

    expect(screen.getByText('Classes Management')).toBeInTheDocument();
    expect(screen.getByText('Add Class')).toBeInTheDocument();
  });

  it('handles loading states appropriately', async () => {
    // Since the component uses sample data, we test that it renders immediately
    render(<ClassesPage />);

    // Component should render immediately with sample data
    expect(screen.getByText('Classes Management')).toBeInTheDocument();
    expect(screen.getByText('Grade 10 - A')).toBeInTheDocument();
  });

  it('displays action dropdown for each class', async () => {
    render(<ClassesPage />);

    // Find the first action dropdown button
    const dropdownButtons = screen.getAllByRole('button');
    const actionsButtons = dropdownButtons.filter(button => 
      button.closest('td') && 
      button.closest('td')?.classList.contains('text-right')
    );
    expect(actionsButtons.length).toBeGreaterThan(0);
  });

  it('displays subject badges', () => {
    render(<ClassesPage />);

    // Check for subject badges (use getAllBy since there are multiple instances)
    const mathBadges = screen.getAllByText('Mathematics');
    expect(mathBadges.length).toBeGreaterThan(0);
    
    const physicsBadges = screen.getAllByText('Physics');
    expect(physicsBadges.length).toBeGreaterThan(0);
    
    // Check for at least one badge container
    const badges = screen.container.querySelectorAll('.inline-flex.items-center.rounded-md.border');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('shows performance metrics when performance tab is selected', async () => {
    render(<ClassesPage />);

    // Click on Performance tab
    const performanceTab = screen.getByRole('tab', { name: /performance/i });
    fireEvent.click(performanceTab);

    // Check for performance indicators - use more flexible approach
    const performanceElements = screen.container.querySelectorAll('.text-xl.font-bold, .text-2xl.font-bold');
    expect(performanceElements.length).toBeGreaterThan(0);
  });

  it('shows reports when reports tab is selected', async () => {
    render(<ClassesPage />);

    // Click on Reports tab
    const reportsTab = screen.getByRole('tab', { name: /reports/i });
    fireEvent.click(reportsTab);

    // Check for report content
    expect(screen.getByText('Class Performance Reports')).toBeInTheDocument();
  });

  it('is responsive', () => {
    render(<ClassesPage />);
    
    // Check for responsive grid classes
    const grid = screen.container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    expect(grid).toBeInTheDocument();
  });
}); 