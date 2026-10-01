import { test, expect } from '@playwright/test';

test.describe('Wordle & Word Search E2E Assessment Tests', () => {

  // Test 1: Builder Use Case (Creating & Saving an Activity to Database)
  test('Builder Use Case: Create and save a new Word Search activity', async ({ page }) => {
    await page.goto('/wordsearch');

    // Fill out the activity builder configuration form
    await page.fill('#ws-activity-title', 'Playwright Test Search');
    await page.fill('#ws-target-words', 'ALPHA, BETA, GAMMA');

    // Click Save to Database
    await page.click('button:has-text("Save Activity to Database")');

    // Verify success feedback message is displayed
    const feedback = page.locator('text=Saved to database successfully!');
    await expect(feedback).toBeVisible({ timeout: 10000 });
  });

  // Test 2: User Activity Use Case (Generating & Viewing Word Search Grid)
  test('User Use Case: Generate Word Search puzzle and interact with grid tiles', async ({ page }) => {
    await page.goto('/wordsearch');

    // Click Generate Puzzle
    await page.click('button:has-text("Generate Puzzle")');

    // Verify grid or puzzle canvas is rendered on the page
    const gridContainer = page.locator('.grid, canvas, table, div[role="grid"]').first();
    await expect(gridContainer).toBeVisible({ timeout: 10000 });

    // Verify a tile/button inside the puzzle area is clickable
    const anyGridButton = page.locator('button').filter({ hasNotText: 'Generate' }).first();
    await expect(anyGridButton).toBeVisible();
    await anyGridButton.click();
  });

});