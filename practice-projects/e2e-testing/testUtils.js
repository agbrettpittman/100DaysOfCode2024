export async function clickAddCharacterButton(page){
    const CharacterAddButton = page.locator(".MuiDrawer-root .MuiList-root li:has(svg[data-testid='AddIcon'])")
    await CharacterAddButton.click()
}