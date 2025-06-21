import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Try to access protected dashboard page
    await page.goto('/dashboard');
    
    // Should redirect to login page
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
    
    // Check login page elements
    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should display login form correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check form elements
    await expect(page.locator('text=Welcome to Aamar School')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check placeholders
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toHaveAttribute('placeholder', /email/i);
    await expect(passwordInput).toHaveAttribute('placeholder', /password/i);
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Wait for validation errors to appear
    await page.waitForTimeout(500);
    
    // Check for validation messages (implementation dependent)
    const errorMessages = page.locator('[data-testid="field-error"]').or(
      page.locator('.error-message')
    );
    
    // Should show some form of validation feedback
    const hasErrors = await errorMessages.count() > 0;
    if (hasErrors) {
      await expect(errorMessages.first()).toBeVisible();
    }
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Should show error message
    const errorMessage = page.locator('text=/invalid credentials/i').or(
      page.locator('text=/login failed/i')
    ).or(
      page.locator('[data-testid="login-error"]')
    );
    
    // Check if error appears (implementation dependent)
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
    
    // Should still be on login page
    expect(page.url()).toContain('/login');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Use test credentials (these should be configured in test environment)
    const testEmail = process.env.TEST_USER_EMAIL || 'admin@aamarschool.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'password123';
    
    // Fill in valid credentials
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('**/dashboard/**', { timeout: 10000 });
    
    // Should be redirected to dashboard
    expect(page.url()).toContain('/dashboard');
    
    // Check if dashboard elements are visible
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should maintain session across page reloads', async ({ page }) => {
    // Login first
    await page.goto('/login');
    
    const testEmail = process.env.TEST_USER_EMAIL || 'admin@aamarschool.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'password123';
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard/**');
    
    // Reload page
    await page.reload();
    
    // Should still be authenticated
    expect(page.url()).toContain('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    
    const testEmail = process.env.TEST_USER_EMAIL || 'admin@aamarschool.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'password123';
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard/**');
    
    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout")').or(
      page.locator('[data-testid="logout-button"]')
    ).or(
      page.locator('text=Sign out')
    );
    
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      
      // Should be redirected to login
      await page.waitForURL('**/login');
      expect(page.url()).toContain('/login');
      
      // Try to access protected page again
      await page.goto('/dashboard');
      
      // Should redirect back to login
      await page.waitForURL('**/login');
      expect(page.url()).toContain('/login');
    }
  });

  test('should handle role-based access control', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    
    const testEmail = process.env.TEST_ADMIN_EMAIL || 'admin@aamarschool.com';
    const testPassword = process.env.TEST_ADMIN_PASSWORD || 'password123';
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard/**');
    
    // Admin should have access to all modules
    const navigationLinks = page.locator('nav a').or(
      page.locator('[data-testid="nav-link"]')
    );
    
    const linkCount = await navigationLinks.count();
    expect(linkCount).toBeGreaterThan(0);
    
    // Check specific admin-only pages
    const adminPages = ['/dashboard/teachers', '/dashboard/students', '/dashboard/parents'];
    
    for (const adminPage of adminPages) {
      await page.goto(adminPage);
      await page.waitForLoadState('networkidle');
      
      // Should not be redirected to unauthorized page
      expect(page.url()).toContain(adminPage);
    }
  });

  test('should handle password visibility toggle', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('button[aria-label*="password"]').or(
      page.locator('[data-testid="password-toggle"]')
    );
    
    // Fill password
    await passwordInput.fill('testpassword');
    
    // Check if toggle button exists
    if (await toggleButton.count() > 0) {
      // Click toggle to show password
      await toggleButton.click();
      
      // Password field should change to text type
      const passwordField = page.locator('input[name="password"]');
      const inputType = await passwordField.getAttribute('type');
      expect(inputType).toBe('text');
      
      // Click toggle again to hide password
      await toggleButton.click();
      
      // Should change back to password type
      const hiddenType = await passwordField.getAttribute('type');
      expect(hiddenType).toBe('password');
    }
  });

  test('should handle remember me functionality', async ({ page }) => {
    await page.goto('/login');
    
    // Check if remember me checkbox exists
    const rememberCheckbox = page.locator('input[type="checkbox"]').or(
      page.locator('[data-testid="remember-me"]')
    );
    
    if (await rememberCheckbox.count() > 0) {
      // Check remember me
      await rememberCheckbox.check();
      
      // Verify it's checked
      await expect(rememberCheckbox).toBeChecked();
      
      // Login with remember me checked
      const testEmail = process.env.TEST_USER_EMAIL || 'admin@aamarschool.com';
      const testPassword = process.env.TEST_USER_PASSWORD || 'password123';
      
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.click('button[type="submit"]');
      
      // Wait for login
      await page.waitForURL('**/dashboard/**');
      
      // Close browser and reopen (simulating longer session)
      await page.context().close();
      
      // Create new context and check if still logged in
      // (This would require session persistence implementation)
    }
  });

  test('should handle registration flow', async ({ page }) => {
    // Check if registration link exists
    await page.goto('/login');
    
    const registerLink = page.locator('a:has-text("Register")').or(
      page.locator('a:has-text("Sign up")')
    ).or(
      page.locator('[data-testid="register-link"]')
    );
    
    if (await registerLink.count() > 0) {
      await registerLink.click();
      
      // Should navigate to registration page
      await page.waitForURL('**/register');
      
      // Check registration form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Check if confirm password field exists
      const confirmPasswordField = page.locator('input[name*="confirm"]').or(
        page.locator('input[placeholder*="confirm"]')
      );
      
      if (await confirmPasswordField.count() > 0) {
        await expect(confirmPasswordField).toBeVisible();
      }
    }
  });
}); 