import { test, expect } from '@playwright/test';

test.describe('SpotMap smoke', () => {
  test('carga home y elementos críticos', async ({ page }, testInfo) => {
    await page.goto('/index.html');

    await expect(page.locator('#map')).toBeVisible();
    await expect(page.locator('#btn-login')).toBeVisible();
    await expect(page.locator('#btn-add-spot')).toBeVisible();

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBeFalsy();

    if (testInfo.project.name.includes('mobile')) {
      await expect(page.locator('#btn-toggle-sidebar')).toBeVisible();
      await page.locator('#btn-toggle-sidebar').click();
      await expect(page.locator('#sidebar')).toBeVisible();
      await expect(page.locator('#spot-list')).toBeVisible();
    } else {
      await expect(page.locator('#spot-list')).toBeVisible();
    }
  });

  test('abre modal de login en mobile y desktop', async ({ page }) => {
    await page.goto('/index.html');

    await page.locator('#btn-login').click({ force: true });
    await expect(page.locator('#modalLogin')).toBeVisible();
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
  });
});
