export const host = "http://localhost:5173/";

export const DrawerLocator = ".MuiDrawer-root .MuiList-root"

export async function initialActions(page){
    // go to the host (you'll initially be redirected to the login page)
    await page.goto(host)
    await page.waitForURL(`${host}login`)

    // login using the username `test-{rando_string}-{current_timestamp}
    const randomString = Math.random().toString(36).substring(7)
    const username = `test${randomString}${Date.now()}`
    await page.fill('input', username)
    await page.click('button')

    // wait for the redirect to the home page
    await page.waitForURL(host)

}

export async function clickAddCharacterButton(page){
    const CharacterAddButton = page.locator(`${DrawerLocator} li:has(svg[data-testid='AddIcon'])`)
    await CharacterAddButton.click()
}

export async function getDrawerItems(page, charactersExpected = 0){
    const DrawerItemsLocator = page.locator(`${DrawerLocator} a`)

    // If we expect characters, wait for that character to be attached
    if (charactersExpected) {
        await DrawerItemsLocator.nth(charactersExpected - 1).waitFor({ state: 'attached' });
    }

    const Items = await DrawerItemsLocator.all()
    return Items
}

export async function addCharacterAndNavigate(page){

    async function getDrawerHrefList(Items){
        return await Promise.all(Items.map(async item => {
            let href = await item.getAttribute("href")
            if (!href) throw new Error("Character href is null")
            return href
        }))
    }

    // get the characters currently in the drawer
    const InitialDrawerList = await getDrawerItems(page)
    // get the href list of the characters
    const InitialCharacterHrefs = await getDrawerHrefList(InitialDrawerList)
    // click the add character button
    await clickAddCharacterButton(page)
    // get the characters currently in the drawer
    const ExpectedNewCharacterCount = InitialCharacterHrefs.length + 1
    const NewDrawerList = await getDrawerItems(page, ExpectedNewCharacterCount)
    // get the href list of the characters
    const NewCharacterHrefs = await getDrawerHrefList(NewDrawerList)
    // find the new character href
    let newCharacterHref = NewCharacterHrefs.find(href => !InitialCharacterHrefs.includes(href))
    // click the new character
    await page.click(`${DrawerLocator} a[href="${newCharacterHref}"]`)

    // remove the first / if it exists
    if (newCharacterHref.startsWith("/")) {
        newCharacterHref = newCharacterHref.slice(1)
    }

    await page.waitForURL(host + newCharacterHref)
    // wait for the character name to load
    await page.waitForSelector("main h1")
}

export async function logoutOfApp(page){
    const LogoutButton = page.locator(".MuiAppBar-root button");
    await LogoutButton.click();
    await page.waitForURL(`${host}login`)
}

export async function checkForToast(page, text, type){
    const LocatorClass = (type) ? `Toastify__toast--${type}` : "Toastify__toast"
    const ToastLocator = page.locator(`.${LocatorClass}`)
    await ToastLocator.waitFor({ state: 'attached' })
    const ToastText = await ToastLocator.innerText()
    expect(ToastText).toBe(text)
}