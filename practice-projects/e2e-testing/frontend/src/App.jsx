import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { Outlet } from "react-router-dom";
import MainAppBar from './components/AppFrame/MainAppBar';
import AppNav from './components/AppFrame/AppNav';
import { useEffect, createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AppContext = createContext({});

export default function App() {

    const navigate = useNavigate();
    const [CharacterList, setCharacterList] = useState([]);

    useEffect(() => {
        // verify there is a username in local storage, if not, redirect to login
        if (!localStorage.getItem('username')) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        getCharacterList()
    }, [])
    
    async function getCharacterList() {
        const creator = localStorage.getItem('username')
        const params = { creator }
        const response = await axios.get('/characters', { params })
        setCharacterList(response.data)
    }

    const AppContextValue = {
        CharacterList,
        getCharacterList
    }
    

    return (
        <AppContext.Provider value={AppContextValue}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <MainAppBar />
                <AppNav />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                    <Outlet />
                </Box>
            </Box>
        </AppContext.Provider>
    );
}