// @ts-check
import { test, expect } from '@playwright/test';
import { addCharacterAndNavigate, clickAddCharacterButton, DrawerLocator } from '../testUtils';
import moment from 'moment';

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

test("Landing Page Has Correct Text", async ({ page }) => {
    await page.goto(host);

    const LandingTitle = page.locator("main h2");
    expect(await LandingTitle.textContent()).toBe("Lair of the Ancients");

    const LandingSubtitle = page.locator("main h3");
    expect(await LandingSubtitle.textContent()).toBe(
        'Welcome! You can find your characters on the sidebar or add a new one with the "New Character" button.'
    );
});

test("Page Not Found Works", async ({ page }) => {
    await page.goto(host + "does-not-exist");
    const NotFoundTitle = page.locator("main h2");
    expect(await NotFoundTitle.textContent()).toBe("404");

    const NotFoundSubtitle = page.locator("main h3");
    expect(await NotFoundSubtitle.textContent()).toBe("Page Not Found");

    const NotFoundText = page.locator("main p");
    expect(await NotFoundText.textContent()).toBe("The page you are looking for does not exist.");

    const NotFoundButton = page.locator("main button");
    expect(await NotFoundButton.textContent()).toBe("Go to Home");

    await NotFoundButton.click();
    await page.waitForURL(host);
    expect(page.url()).toBe(host);
})

test("Characters Root Redirects To Home", async ({ page }) => {
    await page.goto(host + "characters");
    await page.waitForURL(host);
    expect(page.url()).toBe(host);
})

test('Clicking New Character Adds Characters', async ({ page }) => {
    
    await page.goto(host);
    const iterations = 3

    // Function to get the current number of characters and whether the "New Character" button is present
    async function getDrawerItemCount(charactersExpected = 0){
        const DrawerItemsLocator = page.locator(`${DrawerLocator} a`)
        let characterCount = 0

        // If we expect characters, wait for the first character to appear
        if (charactersExpected) {
            await DrawerItemsLocator.first().waitFor({ state: 'attached' });
        }

        // Get the text of all the characters
        const characterTexts = await DrawerItemsLocator.allTextContents();

        // Check if the "New Character" button is present
        characterTexts.forEach(text => {
            characterCount++
        });

        // run assertions
        if (charactersExpected) expect(characterCount).toBe(charactersExpected)

        return characterCount
    }

    // Run initial check
    const InitialCharCount = await getDrawerItemCount()

    // Click the "New Character" button multiple times and check the number of characters
    for (let i = 1; i <= iterations; i++) {
        await clickAddCharacterButton(page)
        const NewCount = InitialCharCount + i
        await getDrawerItemCount(NewCount)
    }

});

test('Clicking on Character in Drawer Redirects to Character Page', async ({ page }) => {
    await page.goto(host);
    // check if there are any characters
    const DrawerItemsLocator = page.locator(`${DrawerLocator} a`)
    const characterCount = await DrawerItemsLocator.count()
    if (characterCount === 0) {
        await clickAddCharacterButton(page)
    }
    // get the href of the first character
    const FirstCharacter = DrawerItemsLocator.first()
    let firstCharacterHref = await FirstCharacter.getAttribute("href")
    if (!firstCharacterHref) throw new Error("First character href is null")
    // remove the first / if it exists
    if (firstCharacterHref.startsWith("/")) {
        firstCharacterHref = firstCharacterHref.slice(1)
    }
    // click the first character
    await FirstCharacter.click()

    const NewURL = host + firstCharacterHref

    await page.waitForURL(NewURL);
    expect(page.url()).toBe(NewURL);
})

test('Character Page Looks Correct', async ({ page }) => {
    await page.goto(host);
    await addCharacterAndNavigate(page);
    const characterName = page.locator("main h1");
    // verify the character name is not empty and is visible
    expect(await characterName.textContent()).toBeTruthy();
    expect(await characterName.isVisible()).toBe(true);

    const characterCreationDate = page.locator("main p.creationDate");
    // verify the character creation date is not empty, is visible, and is in the correct format
    expect(await characterCreationDate.textContent()).toBeTruthy();
    expect(await characterCreationDate.isVisible()).toBe(true);
    const creationDate = await characterCreationDate.textContent()
    const date = moment(creationDate, "MMMM Do YYYY, h:mm:ss a", true)
    expect(date.isValid()).toBe(true);
    throw new Error("Test not implemented");
})