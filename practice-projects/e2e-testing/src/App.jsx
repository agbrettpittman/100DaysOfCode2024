import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { Outlet } from "react-router-dom";
import MainAppBar from './components/AppFrame/MainAppBar';
import AppNav from './components/AppFrame/AppNav';

export default function App() {

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <MainAppBar />
            <AppNav />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Outlet />
            </Box>
        </Box>
    );
}