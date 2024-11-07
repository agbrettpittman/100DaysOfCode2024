// @ts-check
import { test, expect } from '@playwright/test';

const host = "http://localhost:5173/";

test('Tab Name is Correct', async ({ page }) => {
  await page.goto(host);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("Mini LotA");
});

test('Banner Looks Correct', async ({ page }) => {
    await page.goto(host);
    /*
    // Get the h1 element and check its text content
    const h1 = page.locator("h1");

    // Verify it has the correct text
    expect(h1).toHaveText("Mini LotA");

    console.log(h1);

    // Verify it has a font size of 24 px and is white
    expect(h1).toHaveCSS("font-size", "24px");
    expect(h1).toHaveCSS("color", "rgb(255, 255, 255)");
    */

    const appBar = await page.locator("header");

    // Verify it has the correct text
    //expect(appBar).toHaveText("Mini LotA");
    const bgColor = await appBar.evaluate(el => getComputedStyle(el).getPropertyValue('--AppBar-background'));
    console.log(bgColor);
    expect(appBar).toHaveCSS("background-color", "rgb(164, 105, 46)");
});
