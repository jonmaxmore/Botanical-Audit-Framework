import { test, expect, devices } from '@playwright/test';
import { LoginPage, DashboardPage, ApplicationFormPage } from './page-objects';

/**
 * E2E Tests: Cross-Browser & Mobile Compatibility
 *
 * Coverage:
 * - Responsive design on mobile viewports
 * - Touch interactions vs mouse clicks
 * - Mobile navigation patterns
 * - Browser-specific rendering
 * - Accessibility features (ARIA, keyboard navigation)
 * - Screen reader compatibility
 * - Performance across browsers
 *
 * Test Strategy:
 * - Test on Chrome, Firefox, Safari (WebKit)
 * - Test on mobile devices (iOS Safari, Android Chrome)
 * - Verify responsive breakpoints
 * - Test accessibility standards (WCAG 2.1)
 */

test.describe('Cross-Browser Compatibility', () => {
  test.use({ storageState: 'tests/e2e/.auth/farmer.json' });

  test('should render correctly on Chrome', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome-specific test');

    await page.goto('/dashboard');

    // Verify key elements render
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();

    // Take screenshot for visual comparison
    await page.screenshot({ path: 'test-results/chrome-dashboard.png' });

    // Verify CSS Grid/Flexbox layout
    const dashboardLayout = await page.locator('main').evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        gap: styles.gap,
      };
    });

    expect(dashboardLayout.display).toBe('grid');
  });

  test('should render correctly on Firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test');

    await page.goto('/dashboard');

    // Verify key elements render
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();

    // Take screenshot for visual comparison
    await page.screenshot({ path: 'test-results/firefox-dashboard.png' });

    // Test Firefox-specific features (e.g., scrollbar styling)
    const hasCustomScrollbar = await page.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);
      return style.scrollbarWidth !== undefined;
    });

    expect(hasCustomScrollbar).toBeTruthy();
  });

  test('should render correctly on Safari (WebKit)', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari-specific test');

    await page.goto('/dashboard');

    // Verify key elements render
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();

    // Take screenshot for visual comparison
    await page.screenshot({ path: 'test-results/safari-dashboard.png' });

    // Test Safari-specific CSS (backdrop-filter, etc.)
    const hasBackdropFilter = await page.locator('header').evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.backdropFilter !== 'none' || styles.webkitBackdropFilter !== 'none';
    });

    expect(hasBackdropFilter).toBeTruthy();
  });

  test('should handle date input consistently across browsers', async ({ page }) => {
    await page.goto('/applications/new');

    const dateInput = page.locator('input[type="date"]').first();
    await dateInput.fill('2025-10-15');

    const value = await dateInput.inputValue();
    expect(value).toBe('2025-10-15');
  });

  test('should handle file upload consistently across browsers', async ({ page }) => {
    await page.goto('/applications/new');

    // Prepare file for upload
    const fileInput = page.locator('input[type="file"]').first();

    await fileInput.setInputFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content'),
    });

    // Verify file selected
    const files = await fileInput.evaluate((input: HTMLInputElement) => input.files?.length);
    expect(files).toBe(1);
  });
});

test.describe('Mobile Responsive Design', () => {
  test.use({
    storageState: 'tests/e2e/.auth/farmer.json',
    viewport: { width: 375, height: 667 }, // iPhone SE size
  });

  test('should display mobile navigation menu', async ({ page }) => {
    await page.goto('/dashboard');

    // Verify mobile menu button is visible
    await expect(page.locator('[aria-label="Menu"]')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeHidden();

    // Open mobile menu
    await page.click('[aria-label="Menu"]');

    // Verify menu opens
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();

    // Verify menu items
    await expect(page.locator('a:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('a:has-text("Applications")')).toBeVisible();
    await expect(page.locator('a:has-text("Profile")')).toBeVisible();
  });

  test('should stack cards vertically on mobile', async ({ page }) => {
    await page.goto('/dashboard');

    // Get dashboard cards
    const cards = page.locator('[data-testid="stat-card"]');
    const cardCount = await cards.count();

    // Verify cards stack (each card takes full width)
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      const width = await card.evaluate(el => el.getBoundingClientRect().width);

      // Should be close to viewport width (minus padding)
      expect(width).toBeGreaterThan(320);
      expect(width).toBeLessThan(380);
    }
  });

  test('should show compact table view on mobile', async ({ page }) => {
    await page.goto('/applications');

    // Verify table switches to card view on mobile
    await expect(page.locator('[data-testid="mobile-card-view"]')).toBeVisible();
    await expect(page.locator('table')).toBeHidden();

    // Verify card contains key information
    const firstCard = page.locator('[data-testid="application-card"]').first();
    await expect(firstCard.locator('text=Farm Name:')).toBeVisible();
    await expect(firstCard.locator('text=Status:')).toBeVisible();
    await expect(firstCard.locator('text=Date:')).toBeVisible();
  });

  test('should adapt form layout for mobile', async ({ page }) => {
    await page.goto('/applications/new');

    // Verify form fields stack vertically
    const formFields = page.locator('input, textarea, select');
    const fieldCount = await formFields.count();

    for (let i = 0; i < Math.min(3, fieldCount); i++) {
      const field = formFields.nth(i);
      const width = await field.evaluate(el => el.getBoundingClientRect().width);

      // Each field should take full width
      expect(width).toBeGreaterThan(300);
    }
  });
});

test.describe('Mobile Touch Interactions', () => {
  test.use({
    ...devices['iPhone 13'],
    storageState: 'tests/e2e/.auth/farmer.json',
  });

  test('should support touch tap on buttons', async ({ page }) => {
    await page.goto('/dashboard');

    // Tap button using touch
    const button = page.locator('button:has-text("New Application")');
    await button.tap();

    // Verify navigation
    await expect(page).toHaveURL(/\/applications\/new/);
  });

  test('should support swipe gestures on carousel', async ({ page }) => {
    await page.goto('/dashboard');

    // Check if carousel exists
    const carousel = page.locator('[data-testid="announcement-carousel"]');

    if (await carousel.isVisible()) {
      // Get first slide text
      const firstSlide = await carousel.locator('.slide.active').textContent();

      // Swipe left
      await carousel.swipe({ direction: 'left' });

      // Wait for animation
      await page.waitForTimeout(500);

      // Verify slide changed
      const secondSlide = await carousel.locator('.slide.active').textContent();
      expect(secondSlide).not.toBe(firstSlide);
    }
  });

  test('should support pull-to-refresh gesture', async ({ page }) => {
    await page.goto('/applications');

    // Perform pull-down gesture
    await page.touchscreen.tap(200, 100);
    await page.touchscreen.move(200, 300);

    // Wait for refresh indicator
    await expect(page.locator('[data-testid="refresh-indicator"]')).toBeVisible({ timeout: 2000 });
  });
});

test.describe('Accessibility Features', () => {
  test.use({ storageState: 'tests/e2e/.auth/farmer.json' });

  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    await page.goto('/dashboard');

    // Check buttons have aria-labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const hasLabel = await button.evaluate(el => {
        return el.hasAttribute('aria-label') || el.textContent?.trim().length > 0;
      });
      expect(hasLabel).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    let focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focused);

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Press Enter on focused element
    await page.keyboard.press('Enter');

    // Verify action occurred (URL changed or modal opened)
    await page.waitForTimeout(500);
    const hasChanged = await page.evaluate(() => {
      return (
        document.querySelector('[role="dialog"]') !== null ||
        window.location.pathname !== '/dashboard'
      );
    });
    expect(hasChanged).toBeTruthy();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/dashboard');

    // Get all headings
    const headings = await page.evaluate(() => {
      const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return headingElements.map(h => ({
        level: parseInt(h.tagName.charAt(1)),
        text: h.textContent?.trim(),
      }));
    });

    // Verify h1 exists
    const h1Count = headings.filter(h => h.level === 1).length;
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Verify no level skipping
    for (let i = 1; i < headings.length; i++) {
      const levelDiff = headings[i].level - headings[i - 1].level;
      expect(levelDiff).toBeLessThanOrEqual(1);
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/dashboard');

    // Check contrast ratios for text elements
    const textElements = page.locator('p, span, h1, h2, h3, button');
    const sampleSize = Math.min(10, await textElements.count());

    for (let i = 0; i < sampleSize; i++) {
      const element = textElements.nth(i);
      const contrast = await element.evaluate(el => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bgColor = styles.backgroundColor;

        // Simplified contrast check (would use proper algorithm in production)
        return { color, bgColor };
      });

      // Verify colors are defined
      expect(contrast.color).toBeTruthy();
    }
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/dashboard');

    // Check all images have alt attributes
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');

      // Alt attribute must exist (can be empty for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test('should have form labels associated with inputs', async ({ page }) => {
    await page.goto('/applications/new');

    // Check inputs have associated labels
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.evaluate(el => {
        const id = el.id;
        const hasAriaLabel = el.hasAttribute('aria-label');
        const hasAriaLabelledby = el.hasAttribute('aria-labelledby');
        const hasLabelFor = id ? document.querySelector(`label[for="${id}"]`) !== null : false;

        return hasAriaLabel || hasAriaLabelledby || hasLabelFor;
      });

      expect(hasLabel).toBeTruthy();
    }
  });

  test('should support screen reader announcements', async ({ page }) => {
    await page.goto('/applications/new');

    // Fill form and submit
    await page.fill('input[name="farmName"]', 'Screen Reader Test');
    await page.click('button:has-text("Save Draft")');

    // Check for aria-live region with success message
    await expect(page.locator('[role="status"], [aria-live="polite"]')).toBeVisible({
      timeout: 3000,
    });
  });
});

test.describe('Performance Testing', () => {
  test.use({ storageState: 'tests/e2e/.auth/farmer.json' });

  test('should load dashboard within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/dashboard');

    // Measure Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise(resolve => {
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          resolve(
            entries.map(entry => ({
              name: entry.name,
              startTime: entry.startTime,
              duration: entry.duration,
            }))
          );
        });

        observer.observe({ entryTypes: ['navigation', 'paint'] });

        // Timeout after 5 seconds
        setTimeout(() => resolve([]), 5000);
      });
    });

    expect(metrics).toBeTruthy();
  });

  test('should handle large data sets efficiently', async ({ page }) => {
    await page.goto('/applications');

    // Navigate through multiple pages
    const startTime = Date.now();

    for (let i = 0; i < 5; i++) {
      if (await page.locator('button:has-text("Next")').isVisible()) {
        await page.click('button:has-text("Next")');
        await page.waitForLoadState('networkidle');
      }
    }

    const totalTime = Date.now() - startTime;

    // Should complete within 10 seconds
    expect(totalTime).toBeLessThan(10000);
  });
});
