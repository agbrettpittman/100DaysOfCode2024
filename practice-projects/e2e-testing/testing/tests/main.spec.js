// @ts-check
import { test, expect } from '@playwright/test';
import { host, addCharacterAndNavigate, clickAddCharacterButton, DrawerLocator, getDrawerItems, initialActions, logoutOfApp } from '../testUtils';
import moment from 'moment';

test('Tab Name is Correct', async ({ page }) => {
  await page.goto(host);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("Mini LotA");
});

test('Login and Logout Works', async ({ page }) => {
    await initialActions(page)
    // check if the username is displayed
    let username = await page.evaluate(() => {
        return localStorage.getItem('username');
    });
    const usernameLocator = page.locator("header h2");
    expect(await usernameLocator.textContent()).toBe(username);

    // click the logout button
    await logoutOfApp(page)
    expect(page.url()).toBe(`${host}login`);
})

test('Banner Looks Correct', async ({ page }) => {
    await initialActions(page)
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
    await initialActions(page)

    const LandingTitle = page.locator("main h2");
    expect(await LandingTitle.textContent()).toBe("Lair of the Ancients");

    const LandingSubtitle = page.locator("main h3");
    expect(await LandingSubtitle.textContent()).toBe(
        'Welcome! You can find your characters on the sidebar or add a new one with the "New Character" button.'
    );
});

test("Page Not Found Works", async ({ page }) => {
    await initialActions(page)
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

test("Clicking Logo Redirects To Home", async ({ page }) => {
    await initialActions(page)
    
    await page.goto(host + "does-not-exist");
    const Logo = page.locator("header a");
    await Logo.click();
    await page.waitForURL(host);
    expect(page.url()).toBe(host);
})

test("Characters Root Redirects To Home", async ({ page }) => {
    await initialActions(page)
    await page.goto(host + "characters");
    await page.waitForURL(host);
    expect(page.url()).toBe(host);
})

test('Clicking New Character Adds Characters', async ({ page }) => {
    
    await initialActions(page)
    const iterations = 3

    // Function to get the current number of characters and whether the "New Character" button is present
    async function getDrawerItemCount(charactersExpected = 0){
        const DrawerItemsLocator = page.locator(`${DrawerLocator} a`)

        // If we expect characters, wait for the first character to appear
        if (charactersExpected) {
            await DrawerItemsLocator.first().waitFor({ state: 'attached' });
        }

        // Get the text of all the characters
        const characterTexts = await DrawerItemsLocator.allTextContents();

        // run assertions
        if (charactersExpected) {
            expect(characterTexts.length).toBe(charactersExpected)
        }

        return characterTexts
    }

    // Run initial check
    const InitialChracters = await getDrawerItemCount()
    let lastCharacterList = InitialChracters

    // Click the "New Character" button multiple times and check the number of characters
    for (let i = 1; i <= iterations; i++) {
        await clickAddCharacterButton(page)
        const NewCount = InitialChracters.length + i
        let newChracterList = await getDrawerItemCount(NewCount)
        // check if the first character in the new list exists in the last list
        const firstCharacter = newChracterList[0]
        expect(lastCharacterList).not.toContain(firstCharacter)
    }

});

test('Clicking on Character in Drawer Redirects to Character Page', async ({ page }) => {
    await initialActions(page)
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

test('Switching Between Characters Changes Information', async ({ page }) => {
    await initialActions(page)
    // add a new character, go to the character page, and get the character name and creation date
    await addCharacterAndNavigate(page)
    const character1NameLocator = page.locator("main h1");
    const character1CreationDateLocator = page.locator("main div[data-testid='creation-date'] p:last-child");
    const character1Name = await character1NameLocator.textContent()
    const character1CreationDateText = await character1CreationDateLocator.textContent()
    // wait a couple seconds
    await page.waitForTimeout(2000)
    // add a new character
    await addCharacterAndNavigate(page)
    // get the new character name and creation date
    const character2Name = await character1NameLocator.textContent()
    const character2CreationDateText = await character1CreationDateLocator.textContent()
    // verify the character name and creation date have changed
    expect(character1Name).not.toBe(character2Name)
    expect(character1CreationDateText).not.toBe(character2CreationDateText)
})


test('Character Page Looks Correct', async ({ page }) => {
    await initialActions(page)
    await addCharacterAndNavigate(page);
    const characterName = page.locator("main h1");
    // verify the character name is not empty and is visible
    expect(await characterName.textContent()).toBeTruthy();
    expect(await characterName.isVisible()).toBe(true);

    const characterCreationDate = page.locator("main div[data-testid='creation-date'] p:last-child");
    // verify the character creation date is not empty, is visible, and is in the correct format
    expect(await characterCreationDate.textContent()).toBeTruthy();
    expect(await characterCreationDate.isVisible()).toBe(true);
    const creationDate = await characterCreationDate.textContent()
    const date = moment(creationDate, "MMMM Do YYYY, h:mm:ss a", true)
    expect(date.isValid()).toBe(true);
})

test('Edit Button Goes to Edit Page', async ({ page }) => {
    await initialActions(page)
    await addCharacterAndNavigate(page);
    // get the current url
    const CurrentURL = page.url();
    const ExpectedEditURL = `${CurrentURL}/edit`
    const EditButton = page.locator(`main header a[href$="/edit"]`);
    await EditButton.click();
    await page.waitForURL(ExpectedEditURL)
    expect(page.url()).toBe(ExpectedEditURL);
})

test('Edit Page Inputs Work', async ({ page }) => {

    const CharacterDetails = {
        name: {
            oldValue: "",
            newValue: "Ragnar Lodbrok",
            inputSelector: `input[name="name"]`,
            displaySelector: "main h1",
        },
        description: {
            oldValue: "",
            defaultValue: "No Description",
            newValue: "A legendary Viking hero",
            inputSelector: `textarea[name="description"]`,
            displaySelector: "main p[data-testid='description']",
        },
        heightFeet: {
            oldValue: "",
            newValue: "6",
            defaultValue: "Unknown Height",
            inputSelector: `input[name="heightFeet"]`,
            displaySelector: "main p[data-testid='quick-stat-height']",
        },
        heightInches: {
            oldValue: "",
            newValue: "2",
            defaultValue: "Unknown Height",
            inputSelector: `input[name="heightInches"]`,
            displaySelector: "main p[data-testid='quick-stat-height']",
        },
        weight: {
            oldValue: "",
            newValue: "200",
            newDisplayFormat: (x) => `${x} lbs`,
            inputSelector: `input[name="weight"]`,
            defaultValue: "Unknown Weight",
            displaySelector: "main p[data-testid='quick-stat-weight']",
        },
        age: {
            oldValue: "",
            newValue: "40",
            newDisplayFormat: (x) => `${x} years old`,
            defaultValue: "Unknown Age",
            inputSelector: `input[name="age"]`,
            displaySelector: "main p[data-testid='quick-stat-age']",
        },
        primaryWeapon: {
            oldValue: "",
            newValue: "Axe",
            defaultValue: "Unknown",
            inputSelector: `input[name="primaryWeapon"]`,
            displaySelector: "main div[data-testid='attribute-Primary'] p:last-child",
        },
        secondaryWeapon: {
            oldValue: "",
            newValue: "Shield",
            defaultValue: "Unknown",
            inputSelector: `input[name="secondaryWeapon"]`,
            displaySelector: "main div[data-testid='attribute-Secondary'] p:last-child",
        },
    }
    const NormalInitialChecks = [
        "description", "heightFeet", "heightInches", 
        "weight", "age", "primaryWeapon", "secondaryWeapon"
    ]

    const NormalPostChecks = [
        "name","description", "weight", "age", "primaryWeapon", "secondaryWeapon"
    ]

    await initialActions(page)
    await addCharacterAndNavigate(page);
    //################### Get Initial Character Details ########################################
    //  Get the character name (It is auto generated so a default value cannot be reliably predicted)
    const characterNameLocator = page.locator(CharacterDetails.name.displaySelector);
    CharacterDetails.name.oldValue = await characterNameLocator.textContent() || ''

    //Run through the normal initial checks
    NormalInitialChecks.forEach(async (key) => {
        const locator = page.locator(CharacterDetails[key].displaySelector);
        CharacterDetails[key].oldValue = await locator.textContent() || ''
        expect(CharacterDetails[key].oldValue).toBe(CharacterDetails[key].defaultValue)
    })

    // Get the initial drawer values to check later
    const InitialDrawerItems = await getDrawerItems(page)
    let InitialDrawerCharacterNames = []
    for (let i = 0; i < InitialDrawerItems.length; i++) {
        InitialDrawerCharacterNames.push(await InitialDrawerItems[i].textContent())
    }
    expect(InitialDrawerCharacterNames).toContain(CharacterDetails.name.oldValue)

    //################### Navigate to Edit Page ########################################
    const CharacterPageURL = page.url();
    const EditURL = `${CharacterPageURL}/edit`
    await page.goto(EditURL);

    //################### Make changes to character ########################################

    // Verify the character name has loaded
    const NameInput = page.locator(`input[name="name"]`);
    await expect(NameInput).toHaveValue(CharacterDetails.name.oldValue)

    for (const Detail in CharacterDetails) {
        const { newValue, inputSelector } = CharacterDetails[Detail]
        const Input = page.locator(inputSelector);
        await Input.fill(newValue)
    }

    // verify the drawer has not changed
    const NewDrawerItems = await getDrawerItems(page)
    let NewDrawerCharacterNames = []
    for (let i = 0; i < NewDrawerItems.length; i++) {
        NewDrawerCharacterNames.push(await NewDrawerItems[i].textContent())
    }

    // verify the right name has changed in the drawer
    InitialDrawerCharacterNames.forEach((drawerName, index) => {
        if (drawerName === CharacterDetails.name.oldValue) {
            expect(NewDrawerCharacterNames[index]).toBe(CharacterDetails.name.newValue)
        } else {
            expect(NewDrawerCharacterNames[index]).toBe(drawerName)
        }
    })

    //##################### Navigate Back to Character Page ##############################
    const BackButton = page.locator(`main a:has(svg[data-testid='ArrowBackIcon'])`);
    await BackButton.click();
    await page.waitForURL(CharacterPageURL)
    await characterNameLocator.waitFor({ state: 'attached' });

    //##################### Verify Changes ##############################################

    // Verify normal fields have changed

    NormalPostChecks.forEach(async (key) => {
        const locator = page.locator(CharacterDetails[key].displaySelector);
        const newValue = CharacterDetails[key].newValue
        const newValueFormatted = (CharacterDetails[key].newDisplayFormat) ? 
            CharacterDetails[key].newDisplayFormat(newValue) : newValue
        expect(await locator.textContent()).toBe(newValueFormatted)
    })

    // verify height value (this becomes a combined value)
    const ExpectedHeightValue = `${CharacterDetails.heightFeet.newValue}' ${CharacterDetails.heightInches.newValue}"`
    const HeightValueLocator = page.locator(CharacterDetails.heightFeet.displaySelector);
    expect(await HeightValueLocator.textContent()).toBe(ExpectedHeightValue)

})

test('Delete Button Works', async ({ page }) => {
    await initialActions(page)
    await addCharacterAndNavigate(page);
    // get the current drawer values
    const characterNameLocator = page.locator("main h1");
    const CharacterName = await characterNameLocator.textContent()
    if (!CharacterName) throw new Error("Character name is null")
    const InitialDrawerItems = await getDrawerItems(page)
    let InitialDrawerCharacterNames = []
    for (let i = 0; i < InitialDrawerItems.length; i++) {
        InitialDrawerCharacterNames.push(await InitialDrawerItems[i].textContent())
    }

    // delete the character
    const DeleteButton = page.locator(`main header button:has(svg[data-testid='DeleteIcon'])`);
    // click the delete button and hold it for the required time plus a little extra so the browser doesn't let go too early
    const RequiredTime = 1000
    const HoldTime = RequiredTime + 500
    await DeleteButton.click({ delay: HoldTime })

    // wait to be navigated back to the home page
    await page.waitForURL(host);
    // verify the character is deleted in the drawer
    const NewDrawerItems = await getDrawerItems(page)
    let NewDrawerCharacterNames = []
    for (let i = 0; i < NewDrawerItems.length; i++) {
        NewDrawerCharacterNames.push(await NewDrawerItems[i].textContent())
    }
    expect(NewDrawerCharacterNames).not.toContain(CharacterName)
})

test('Authorization Works', async ({ page }) => {
    // log in and add a character
    await initialActions(page)
    await addCharacterAndNavigate(page)
    const CurrentURL = page.url()
    await logoutOfApp(page)

    // log back in (this time with a different username)
    await initialActions(page)
    await page.goto(CurrentURL)

    // verify a 403 error is displayed
    const ErrorTitle = page.locator("main h2");
    const ErrorSubtitle = page.locator("main h3");
    const ErrorText = page.locator("main p");
    const ErrorButton = page.locator("main button");

    // wait for the title to be mounted
    await ErrorTitle.waitFor({ state: 'attached' });

    // verify the error text
    expect(await ErrorTitle.textContent()).toBe("403");
    expect(await ErrorSubtitle.textContent()).toBe("Unauthorized");
    expect(await ErrorText.textContent()).toBe("You do not have permission to view this page.");
    expect(await ErrorButton.textContent()).toBe("Go to Home");

    // click the button and verify the URL changes
    await ErrorButton.click();
    await page.waitForURL(host);
    expect(page.url()).toBe(host);
})