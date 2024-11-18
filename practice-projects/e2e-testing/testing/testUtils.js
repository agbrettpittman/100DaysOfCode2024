export const host = "http://localhost:5173/";

export const DrawerLocator = ".MuiDrawer-root .MuiList-root"

export async function clickAddCharacterButton(page){
    const CharacterAddButton = page.locator(`${DrawerLocator} li:has(svg[data-testid='AddIcon'])`)
    await CharacterAddButton.click()
}

export async function getDrawerItems(page, charactersExpected = 0){
    const DrawerItemsLocator = page.locator(`${DrawerLocator} a`)

    // If we expect characters, wait for the first character to appear
    if (charactersExpected) {
        await DrawerItemsLocator.first().waitFor({ state: 'attached' });
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
    const NewDrawerList = await getDrawerItems(page, 1)
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
}