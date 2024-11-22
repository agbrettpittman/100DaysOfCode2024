import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { Outlet } from "react-router-dom";
import MainAppBar from './components/AppFrame/MainAppBar';
import AppNav from './components/AppFrame/AppNav';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function App() {

    const navigate = useNavigate();

    useEffect(() => {
        // verify there is a username in local storage, if not, redirect to login
        if (!localStorage.getItem('username')) {
            navigate('/login');
        }
    }, [navigate]);

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