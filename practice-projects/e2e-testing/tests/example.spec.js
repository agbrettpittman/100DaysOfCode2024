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
    // screen width
    const viewportSize = page.viewportSize();
    if (!viewportSize) throw new Error("Viewport size is null");

    const appBar = page.locator("header");
    const appBarStyle = await appBar.evaluate(el => {
        const Styles = getComputedStyle(el)
        return {
            backgroundColor: Styles.backgroundColor,
            width: Styles.width,
        };
    });
    expect(appBarStyle.backgroundColor).toBe("rgb(164, 105, 46)");
    expect(appBarStyle.width).toBe(`${viewportSize.width}px`);

    const appTitle = page.locator("header h1");
    const appTitleStyle = await appTitle.evaluate(el => {
        const Styles = getComputedStyle(el)
        return {
            color: Styles.color,
            fontSize: Styles.fontSize,
        };
    });
    expect(appTitleStyle.color).toBe("rgb(255, 255, 255)");
    expect(appTitleStyle.fontSize).toBe("24px");

    const logo = page.locator("header img");
    expect(await logo.evaluate(el => el.getAttribute("src"))).toBe("/LotA.png");
    expect(await logo.isVisible()).toBe(true);

    
});

test('Clicking New Character Adds Characters', async ({ page }) => {
    
    await page.goto(host);
    const iterations = 3

    // Function to get the current number of characters and whether the "New Character" button is present
    async function getDrawerItems(charactersExpected = 0){
        const DrawerItemsLocator = page.locator(".MuiDrawer-root .MuiList-root li")
        let characterCount = 0
        let newCharacterButtonFound = false

        // If we expect characters, wait for the first character to appear
        if (charactersExpected) {
            await DrawerItemsLocator.nth(1).waitFor({ state: 'attached' });
        }

        // Get the text of all the characters
        const characterTexts = await DrawerItemsLocator.allTextContents();

        // Check if the "New Character" button is present
        characterTexts.forEach(text => {
            if (text === "New Character") newCharacterButtonFound = true
            else characterCount++
        });

        // run assertions
        expect(newCharacterButtonFound).toBe(true)
        if (charactersExpected) expect(characterCount).toBe(charactersExpected)

        return {characterCount, newCharacterButtonFound}
    }

    // Run initial check
    const { characterCount: InitialCharCount } = await getDrawerItems()
    
    const CharacterAddButton = page.locator(".MuiDrawer-root .MuiList-root li:has(svg[data-testid='AddIcon'])")

    // Click the "New Character" button multiple times and check the number of characters
    for (let i = 1; i <= iterations; i++) {
        await CharacterAddButton.click()
        const NewCount = InitialCharCount + i
        await getDrawerItems(NewCount)
    }

});
