import { createTheme, ThemeProvider } from '@mui/material/styles';
import { darken, lighten } from "polished";
import { createContext, useMemo, useState } from "react";
import "@mui/material/styles/createPalette";
import { Outlet } from 'react-router-dom';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });
const primaryMain = '#e33737'
const secondaryMain = '#fdcc9c'
const LightThemeOptions = {
    palette: {
        mode: 'light',
        primary: {
            main: primaryMain,
        },
        secondary: {
            main: secondaryMain,
        },
    },
}

const DarkThemeOptions = {
    palette: {
        mode: 'dark',
        primary: {
            main: darken(0.1, primaryMain),
        },
        secondary: {
            main: darken(0.1, secondaryMain),
        }
    }
}

let DarkThemeInit = createTheme(DarkThemeOptions)
let LightThemeInit = createTheme(LightThemeOptions)

const DarkTheme = createTheme(DarkThemeInit, {
    palette: {
        extendedBackground: {
            main: DarkThemeInit.palette.background.default,
            contrastLow: lighten(0.05, DarkThemeInit.palette.background.default),
            contrastMedium: lighten(0.1, DarkThemeInit.palette.background.default),
            contrastHigh: lighten(0.2, DarkThemeInit.palette.background.default),
        },
    },
})

const LightTheme = createTheme(LightThemeInit, {
    palette: {
        extendedBackground: {
            main: LightThemeInit.palette.background.default,
            contrastLow: darken(0.05, LightThemeInit.palette.background.default),
            contrastMedium: darken(0.1, LightThemeInit.palette.background.default),
            contrastHigh: darken(0.2, LightThemeInit.palette.background.default),
        },
    },
})

export default function ThemeWrapper({children}) {
    const [mode, setMode] = useState('light');
    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
    [],);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={mode === 'light' ? LightTheme : DarkTheme}>
                <Outlet />
            </ThemeProvider>
        </ColorModeContext.Provider>
    )
}