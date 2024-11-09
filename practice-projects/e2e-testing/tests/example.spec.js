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
    const iterations = 3
    await page.goto(host);

    const CharacterList = page.locator(".MuiDrawer-root .MuiList-root li")

    
    async function getCharacterLis(){
        let currentCharacters = 0
        let newCharacterButtonFound = false
        const characterTexts = await CharacterList.allTextContents();
        characterTexts.forEach(text => {
            if (text === "New Character") {
                newCharacterButtonFound = true
            }
            currentCharacters++
        });
        console.log(`Current characters: ${currentCharacters}`)

        return {currentCharacters, newCharacterButtonFound}
    }

    let {currentCharacters, newCharacterButtonFound} = await getCharacterLis()
    
    expect(newCharacterButtonFound).toBe(true)

    // Click the "New Character" button
    const CharacterAddButton = page.locator(".MuiDrawer-root .MuiList-root li:has(svg[data-testid='AddIcon'])")

    for (let i = 0; i <= iterations; i++) {
        await CharacterAddButton.click()
        let {currentCharacters: newCurrentCharacters} = await getCharacterLis()
        expect(newCurrentCharacters).toBe(currentCharacters + i)
    }


});
