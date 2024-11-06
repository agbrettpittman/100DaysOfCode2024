// @ts-check
import { test, expect } from '@playwright/test';

const host = "http://localhost:5173/";

test('has title', async ({ page }) => {
  await page.goto(host);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Vite/);
});

test('button count increments', async ({ page }) => {
    await page.goto(host);
    const CountButton = page.getByRole('button', { name: /count is/ });

    for (let i = 0; i < 3; i++) {
        await expect(CountButton).toHaveText(`count is ${i}`); // Check the count before clicking
        await CountButton.click();
    }

    await expect(CountButton).toHaveText('count is 3'); // Final check after all clicks
});

test('Vite Logo Navigates to Vite Site', async ({ page }) => {
    await page.goto(host);
    // verify the link has a logo in
    const ViteLogo = page.getByRole('link', { name: /Vite/ });

    // Listen for the new tab opening
    const [newTab] = await Promise.all([
        page.context().waitForEvent('page'), // Wait for the new page
        ViteLogo.click() // Click the link that opens the new tab
    ]);

    // Wait for the new tab to load and verify the URL
    await expect(newTab).toHaveURL('https://vite.dev/');
})

test('React Logo Navigates to React Site', async ({ page }) => {
    await page.goto(host);
    // verify the link has a logo in
    const ReactLogo = page.getByRole('link', { name: /React/ });

    // Listen for the new tab opening
    const [newTab] = await Promise.all([
        page.context().waitForEvent('page'), // Wait for the new page
        ReactLogo.click() // Click the link that opens the new tab
    ]);

    // Wait for the new tab to load and verify the URL
    await expect(newTab).toHaveURL('https://react.dev/');
})

test('Vite Logo Filter Has Dropshadow on Hover', async ({ page }) => {
    await page.goto(host);
    // verify the link has a logo in
    const ViteLogo = page.getByRole('img', { name: /Vite/ });

    // Hover over the link
    await ViteLogo.hover();

    // Check the dropshadow is applied
    await expect(ViteLogo).toHaveCSS('filter', 'drop-shadow(rgba(100, 108, 255, 0.667) 0px 0px 32px)');
})