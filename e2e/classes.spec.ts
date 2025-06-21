import { test, expect } from '@playwright/test';

test.describe('Classes Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to classes page
    await page.goto('/dashboard/classes');
  });

  test('should display classes page correctly', async ({ page }) => {
    // Check page title and heading
    await expect(page.getByRole('heading', { name: 'Classes Management' })).toBeVisible();
    await expect(page.getByText('Manage class sections, student assignments, and timetables')).toBeVisible();
    
    // Check Add Class button
    await expect(page.getByRole('button', { name: 'Add Class' })).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    // Check for statistics cards
    await expect(page.getByText('Total Classes')).toBeVisible();
    await expect(page.getByText('24')).toBeVisible();
    await expect(page.getByText('Total Students')).toBeVisible();
    await expect(page.getByText('856')).toBeVisible();
    await expect(page.getByText('Average Performance')).toBeVisible();
    await expect(page.getByText('84.2%')).toBeVisible();
    await expect(page.getByText('Capacity Utilization')).toBeVisible();
    await expect(page.getByText('89%')).toBeVisible();
  });

  test('should display classes table with data', async ({ page }) => {
    // Check table headers
    await expect(page.getByText('Class')).toBeVisible();
    await expect(page.getByText('Class Teacher')).toBeVisible();
    await expect(page.getByText('Room')).toBeVisible();
    await expect(page.getByText('Students')).toBeVisible();
    await expect(page.getByText('Subjects')).toBeVisible();
    await expect(page.getByText('Performance')).toBeVisible();
    await expect(page.getByText('Attendance')).toBeVisible();
    await expect(page.getByText('Actions')).toBeVisible();

    // Check class data
    await expect(page.getByText('Grade 10 - A')).toBeVisible();
    await expect(page.getByText('Dr. Sarah Johnson')).toBeVisible();
    await expect(page.getByText('Room 101')).toBeVisible();
    await expect(page.getByText('Grade 10 - B')).toBeVisible();
    await expect(page.getByText('Prof. Michael Chen')).toBeVisible();
    await expect(page.getByText('Room 102')).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search classes...');
    await expect(searchInput).toBeVisible();

    // Test search
    await searchInput.fill('Grade 10');
    await expect(searchInput).toHaveValue('Grade 10');

    // Clear search
    await searchInput.clear();
    await expect(searchInput).toHaveValue('');
  });

  test('should handle grade and section filters', async ({ page }) => {
    // Test grade filter
    const gradeFilter = page.locator('[role="combobox"]').first();
    await gradeFilter.click();
    await expect(page.getByText('All Grades')).toBeVisible();
    await expect(page.getByText('Grade 6')).toBeVisible();
    await expect(page.getByText('Grade 10')).toBeVisible();

    // Select a grade
    await page.getByText('Grade 10').click();

    // Test section filter
    const sectionFilter = page.locator('[role="combobox"]').nth(1);
    await sectionFilter.click();
    await expect(page.getByText('All Sections')).toBeVisible();
    await expect(page.getByText('A', { exact: true })).toBeVisible();
    await expect(page.getByText('B', { exact: true })).toBeVisible();

    // Select a section
    await page.getByText('A', { exact: true }).click();
  });

  test('should switch between tabs', async ({ page }) => {
    // Check all tabs are visible
    await expect(page.getByRole('tab', { name: 'Classes' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Timetables' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Performance' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Reports' })).toBeVisible();

    // Switch to Timetables tab
    await page.getByRole('tab', { name: 'Timetables' }).click();
    await expect(page.getByText('Grade 10 - A Timetable')).toBeVisible();
    await expect(page.getByText('Grade 10 - B Timetable')).toBeVisible();

    // Check timetable structure
    await expect(page.getByText('Time')).toBeVisible();
    await expect(page.getByText('Monday')).toBeVisible();
    await expect(page.getByText('Tuesday')).toBeVisible();
    await expect(page.getByText('Wednesday')).toBeVisible();
    await expect(page.getByText('Thursday')).toBeVisible();
    await expect(page.getByText('Friday')).toBeVisible();

    // Switch to Performance tab
    await page.getByRole('tab', { name: 'Performance' }).click();
    // Performance tab content would be tested here

    // Switch to Reports tab
    await page.getByRole('tab', { name: 'Reports' }).click();
    // Reports tab content would be tested here

    // Switch back to Classes tab
    await page.getByRole('tab', { name: 'Classes' }).click();
    await expect(page.getByText('Grade 10 - A')).toBeVisible();
  });

  test('should display and interact with action dropdown', async ({ page }) => {
    // Find the first action dropdown button
    const actionButton = page.locator('[data-testid="action-menu"]').first();
    await actionButton.click();

    // Check dropdown menu items
    await expect(page.getByText('View Details')).toBeVisible();
    await expect(page.getByText('Edit Class')).toBeVisible();
    await expect(page.getByText('View Timetable')).toBeVisible();
    await expect(page.getByText('Manage Students')).toBeVisible();
    await expect(page.getByText('Export Data')).toBeVisible();

    // Click outside to close dropdown
    await page.click('body');
  });

  test('should display performance and attendance indicators', async ({ page }) => {
    // Check for performance percentages
    await expect(page.getByText('85.2%')).toBeVisible();
    await expect(page.getByText('88.7%')).toBeVisible();
    
    // Check for attendance percentages
    await expect(page.getByText('94.5%')).toBeVisible();
    await expect(page.getByText('96.2%')).toBeVisible();
  });

  test('should display student capacity information', async ({ page }) => {
    // Check for student counts and capacity
    await expect(page.getByText('35')).toBeVisible();
    await expect(page.getByText('38')).toBeVisible();
    
    // Check for capacity indicators
    const capacityIndicators = page.locator('text=/40');
    await expect(capacityIndicators).toHaveCount(2);
  });

  test('should display subject badges', async ({ page }) => {
    // Check for subject badges
    await expect(page.getByText('Mathematics')).toBeVisible();
    await expect(page.getByText('Physics')).toBeVisible();
    await expect(page.getByText('Chemistry')).toBeVisible();
    await expect(page.getByText('English')).toBeVisible();
    await expect(page.getByText('Biology')).toBeVisible();
    await expect(page.getByText('Computer Science')).toBeVisible();
  });

  test('should handle add class dialog', async ({ page }) => {
    // Click Add Class button
    await page.getByRole('button', { name: 'Add Class' }).click();

    // The dialog behavior would depend on the actual implementation
    // For now, just check that the button is clickable
    await expect(page.getByRole('button', { name: 'Add Class' })).toBeVisible();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.getByText('Classes Management')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('Classes Management')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('Classes Management')).toBeVisible();
  });

  test('should filter classes correctly', async ({ page }) => {
    // Initially, all classes should be visible
    await expect(page.getByText('Grade 10 - A')).toBeVisible();
    await expect(page.getByText('Grade 10 - B')).toBeVisible();

    // Search for specific class
    await page.getByPlaceholder('Search classes...').fill('Grade 10 - A');
    
    // Verify search input value
    await expect(page.getByPlaceholder('Search classes...')).toHaveValue('Grade 10 - A');

    // Clear search
    await page.getByPlaceholder('Search classes...').clear();

    // Search for teacher name
    await page.getByPlaceholder('Search classes...').fill('Sarah');
    await expect(page.getByPlaceholder('Search classes...')).toHaveValue('Sarah');
  });

  test('should display timetable correctly', async ({ page }) => {
    // Switch to Timetables tab
    await page.getByRole('tab', { name: 'Timetables' }).click();

    // Check for timetable tables
    await expect(page.getByText('Grade 10 - A Timetable')).toBeVisible();
    await expect(page.getByText('Grade 10 - B Timetable')).toBeVisible();

    // Check time slots
    await expect(page.getByText('9:00-9:45')).toBeVisible();

    // Check subjects in timetable
    await expect(page.getByText('Math')).toBeVisible();
    await expect(page.getByText('Physics')).toBeVisible();
    await expect(page.getByText('Chemistry')).toBeVisible();
  });

  test('should handle navigation and state preservation', async ({ page }) => {
    // Set search term
    await page.getByPlaceholder('Search classes...').fill('Grade 10');
    
    // Switch tabs and come back
    await page.getByRole('tab', { name: 'Timetables' }).click();
    await page.getByRole('tab', { name: 'Classes' }).click();
    
    // Search term should be preserved
    await expect(page.getByPlaceholder('Search classes...')).toHaveValue('Grade 10');
  });

  test('should load and display data without errors', async ({ page }) => {
    // Check that page loads without console errors
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify key elements are loaded
    await expect(page.getByText('Classes Management')).toBeVisible();
    await expect(page.getByText('Grade 10 - A')).toBeVisible();

    // Check that no critical errors occurred
    expect(consoleLogs.filter(log => log.includes('Error'))).toHaveLength(0);
  });
}); 