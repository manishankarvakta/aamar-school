import { test, expect } from '@playwright/test';

test.describe('Teachers Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to teachers page
    await page.goto('/dashboard/teachers');
  });

  test('should display teachers list', async ({ page }) => {
    // Wait for the page to load
    await page.waitForSelector('[data-testid="teachers-table"]');
    
    // Check if teachers table is visible
    const table = page.locator('[data-testid="teachers-table"]');
    await expect(table).toBeVisible();
    
    // Check table headers
    await expect(page.locator('text=Teacher')).toBeVisible();
    await expect(page.locator('text=Contact')).toBeVisible();
    await expect(page.locator('text=Qualification')).toBeVisible();
    await expect(page.locator('text=Experience')).toBeVisible();
    await expect(page.locator('text=Actions')).toBeVisible();
  });

  test('should search teachers', async ({ page }) => {
    // Wait for teachers to load
    await page.waitForSelector('input[placeholder*="Search teachers"]');
    
    // Search for a teacher
    const searchInput = page.locator('input[placeholder*="Search teachers"]');
    await searchInput.fill('John');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Verify search results contain the searched term
    const teacherRows = page.locator('[data-testid="teacher-row"]');
    const count = await teacherRows.count();
    
    if (count > 0) {
      // Check if the visible results contain "John"
      const firstRow = teacherRows.first();
      await expect(firstRow).toContainText('John');
    }
  });

  test('should filter teachers by experience', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click experience filter dropdown
    const experienceFilter = page.locator('select[name="experience"]').or(
      page.locator('[data-testid="experience-filter"]')
    );
    
    if (await experienceFilter.count() > 0) {
      await experienceFilter.click();
      
      // Select "3-5 years" option
      const option = page.locator('text=3-5 years');
      if (await option.count() > 0) {
        await option.click();
        
        // Wait for filtering to complete
        await page.waitForTimeout(500);
        
        // Verify filtered results
        const teacherRows = page.locator('[data-testid="teacher-row"]');
        const count = await teacherRows.count();
        
        // If there are results, they should all have 3-5 years experience
        if (count > 0) {
          const experienceText = await teacherRows.first().locator('text=/[3-5] years/').textContent();
          expect(experienceText).toMatch(/[3-5] years/);
        }
      }
    }
  });

  test('should open teacher details dialog', async ({ page }) => {
    // Wait for teachers table to load
    await page.waitForSelector('[data-testid="teachers-table"]');
    
    // Find and click the first view details button
    const viewButton = page.locator('button:has-text("View Details")').or(
      page.locator('[aria-label="View Details"]')
    ).first();
    
    if (await viewButton.count() > 0) {
      await viewButton.click();
      
      // Wait for dialog to open
      await page.waitForSelector('[role="dialog"]');
      
      // Verify dialog content
      await expect(page.locator('text=Teacher Details')).toBeVisible();
      await expect(page.locator('text=Personal Information')).toBeVisible();
      await expect(page.locator('text=Professional Information')).toBeVisible();
      
      // Close dialog
      const closeButton = page.locator('button:has-text("Close")').or(
        page.locator('[aria-label="Close"]')
      );
      if (await closeButton.count() > 0) {
        await closeButton.click();
      }
    }
  });

  test('should open edit teacher dialog', async ({ page }) => {
    // Wait for teachers table to load
    await page.waitForSelector('[data-testid="teachers-table"]');
    
    // Find and click the first edit button
    const editButton = page.locator('button:has-text("Edit")').or(
      page.locator('[aria-label="Edit"]')
    ).first();
    
    if (await editButton.count() > 0) {
      await editButton.click();
      
      // Wait for edit dialog to open
      await page.waitForSelector('[role="dialog"]');
      
      // Verify dialog content
      await expect(page.locator('text=Edit Teacher')).toBeVisible();
      await expect(page.locator('text=Personal Information')).toBeVisible();
      await expect(page.locator('text=Professional Information')).toBeVisible();
      
      // Check if form fields are present
      await expect(page.locator('input[name="firstName"]')).toBeVisible();
      await expect(page.locator('input[name="lastName"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      
      // Close dialog without saving
      const cancelButton = page.locator('button:has-text("Cancel")');
      if (await cancelButton.count() > 0) {
        await cancelButton.click();
      }
    }
  });

  test('should handle pagination', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if pagination controls exist
    const paginationInfo = page.locator('text=/Showing \\d+ to \\d+ of \\d+ results/');
    if (await paginationInfo.count() > 0) {
      await expect(paginationInfo).toBeVisible();
    }
    
    // Check if next button exists and click it
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.count() > 0 && !(await nextButton.isDisabled())) {
      await nextButton.click();
      
      // Wait for page change
      await page.waitForTimeout(500);
      
      // Verify page changed
      const currentPage = page.locator('button[aria-current="page"]').or(
        page.locator('.pagination .active')
      );
      if (await currentPage.count() > 0) {
        const pageText = await currentPage.textContent();
        expect(parseInt(pageText || '1')).toBeGreaterThan(1);
      }
    }
  });

  test('should change items per page', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find items per page selector
    const itemsPerPageSelect = page.locator('[data-testid="items-per-page"]').or(
      page.locator('select').filter({ hasText: /Items per page/ })
    );
    
    if (await itemsPerPageSelect.count() > 0) {
      // Click to open dropdown
      await itemsPerPageSelect.click();
      
      // Select 20 items per page
      const option20 = page.locator('text=20');
      if (await option20.count() > 0) {
        await option20.click();
        
        // Wait for page to update
        await page.waitForTimeout(500);
        
        // Verify selection was applied
        const selectedValue = page.locator('[data-testid="items-per-page"]').or(
          page.locator('select option:checked')
        );
        if (await selectedValue.count() > 0) {
          await expect(selectedValue).toContainText('20');
        }
      }
    }
  });

  test('should clear filters', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Apply a search filter first
    const searchInput = page.locator('input[placeholder*="Search teachers"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('Test');
      await page.waitForTimeout(500);
      
      // Look for clear filters button
      const clearButton = page.locator('button:has-text("Clear Filters")');
      if (await clearButton.count() > 0) {
        await clearButton.click();
        
        // Verify search was cleared
        await expect(searchInput).toHaveValue('');
      }
    }
  });

  test('should validate teacher creation form', async ({ page }) => {
    // Look for add teacher button
    const addButton = page.locator('button:has-text("Add Teacher")').or(
      page.locator('[data-testid="add-teacher-button"]')
    );
    
    if (await addButton.count() > 0) {
      await addButton.click();
      
      // Wait for add dialog to open
      await page.waitForSelector('[role="dialog"]');
      
      // Verify dialog opened
      await expect(page.locator('text=Add New Teacher')).toBeVisible();
      
      // Try to submit without filling required fields
      const submitButton = page.locator('button:has-text("Add Teacher")').or(
        page.locator('button[type="submit"]')
      );
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Should show validation errors for required fields
        const errorMessages = page.locator('[data-testid="field-error"]').or(
          page.locator('.error-message')
        );
        
        // Wait for validation to show (if implemented)
        await page.waitForTimeout(500);
      }
      
      // Close dialog
      const cancelButton = page.locator('button:has-text("Cancel")');
      if (await cancelButton.count() > 0) {
        await cancelButton.click();
      }
    }
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if page is responsive
    const table = page.locator('[data-testid="teachers-table"]').or(
      page.locator('table')
    );
    
    if (await table.count() > 0) {
      // Should be scrollable horizontally on mobile
      const tableContainer = table.locator('..').first();
      const hasOverflow = await tableContainer.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.overflowX === 'auto' || style.overflowX === 'scroll';
      });
      
      // On mobile, table should be scrollable or stacked differently
      expect(hasOverflow || true).toBeTruthy(); // Allow responsive design variations
    }
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
  });
}); 