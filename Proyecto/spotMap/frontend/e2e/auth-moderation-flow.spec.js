import { test, expect } from '@playwright/test';

const requiredEnv = {
  userEmail: process.env.E2E_USER_EMAIL,
  userPassword: process.env.E2E_USER_PASSWORD,
  moderatorEmail: process.env.E2E_MODERATOR_EMAIL,
  moderatorPassword: process.env.E2E_MODERATOR_PASSWORD
};

const missingEnv = Object.entries(requiredEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const onePixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8F5QAAAABJRU5ErkJggg==',
  'base64'
);

async function login(page, email, password) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    await page.goto('/index.html');
    await page.locator('#btn-login').click();
    await expect(page.locator('#modalLogin')).toBeVisible();
    await page.locator('#login-email').fill(email);
    await page.locator('#login-password').fill(password);
    await page.locator('#form-login button[type="submit"]').click();

    try {
      await expect(page.locator('#auth-logged-in')).toBeVisible({ timeout: attempt === 1 ? 12000 : 20000 });
      return;
    } catch (error) {
      if (attempt === 2) {
        throw error;
      }
      await page.waitForTimeout(1500);
    }
  }
}

async function logout(page) {
  const userMenuBtn = page.locator('#auth-logged-in .dropdown-toggle');
  await expect(userMenuBtn).toBeVisible({ timeout: 10000 });
  await userMenuBtn.click();
  await page.locator('#btn-logout').click();
  await expect(page.locator('#auth-logged-out')).toBeVisible({ timeout: 10000 });
}

test.describe('@auth-flow Spot moderation flow', () => {
  test.skip(missingEnv.length > 0, `Missing E2E env vars: ${missingEnv.join(', ')}`);

  test('user creates spot, moderator approves, user receives notification', async ({ page }) => {
    const spotTitle = `E2E Spot ${Date.now()}`;

    await login(page, requiredEnv.userEmail, requiredEnv.userPassword);

    await page.locator('#btn-add-spot').click();
    await expect(page.locator('#modalAddSpot')).toBeVisible();

    await page.locator('#spot-title').fill(spotTitle);
    await page.locator('#spot-lat').fill('40.4168');
    await page.locator('#spot-lng').fill('-3.7038');
    await page.locator('#spot-description').fill('Spot creado por prueba E2E completa');
    await page.locator('#spot-category').fill('test');
    await page.locator('#spot-tags').fill('e2e,moderation,notification');

    await page.locator('#spot-photo-1').setInputFiles({
      name: 'e2e-image.png',
      mimeType: 'image/png',
      buffer: onePixelPng
    });

    await page.locator('#btn-save-spot').click();
    await expect(page.locator('#modalAddSpot')).not.toBeVisible({ timeout: 25000 });
    await expect(page.locator('#spot-list')).toContainText(spotTitle, { timeout: 25000 });

    await logout(page);

    await login(page, requiredEnv.moderatorEmail, requiredEnv.moderatorPassword);

    const moderationBtn = page.locator('#btn-moderation-panel');
    await expect(moderationBtn).toBeVisible({ timeout: 15000 });
    await moderationBtn.click();

    const spotCard = page.locator('#moderation-content .col-12', { hasText: spotTitle }).first();
    await expect(spotCard).toBeVisible({ timeout: 30000 });
    await spotCard.locator('.approve-btn').click();

    await expect(page.locator('#moderation-content .col-12', { hasText: spotTitle })).toHaveCount(0, { timeout: 30000 });

    await logout(page);

    await login(page, requiredEnv.userEmail, requiredEnv.userPassword);

    const notificationsBtn = page.locator('#notifications-button');
    await expect(notificationsBtn).toBeVisible({ timeout: 15000 });
    await page.locator('#btn-notifications').click();

    const notificationsList = page.locator('#notifications-list');
    await expect(notificationsList).toContainText('Spot aprobado', { timeout: 30000 });
    await expect(notificationsList).toContainText(spotTitle, { timeout: 30000 });
  });
});
