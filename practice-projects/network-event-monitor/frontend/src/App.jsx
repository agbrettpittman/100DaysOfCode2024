import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { Outlet } from "react-router-dom";
import MainAppBar from '@components/appFrame/MainAppBar';
import DrawerNav from '@components/appFrame/DrawerNav';
import { useEffect, createContext, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorPage from '@pages/ErrorPage';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';

export const AppContext = createContext({});

export default function App() {

    const [EventList, setEventList] = useState([]);

    useEffect(() => {
        getEventList()
    }, [])
    
    async function getEventList() {
        axios.get('/events').then((response) => {
            const NewEvents = response.data.map((event) => {
                return {
                    ...event,
                    eventDatetime: moment(event.eventDatetime)
                }
            })
            setEventList(NewEvents)
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to get event list')
        })
    }

    const AppContextValue = {
        EventList,
        getEventList
    }
    

    return (
        <AppContext.Provider value={AppContextValue}>
            <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale='en'>
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline />
                    <MainAppBar />
                    <DrawerNav />
                    <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                        <ErrorBoundary FallbackComponent={ErrorPage}>
                            <Outlet />
                        </ErrorBoundary>
                    </Box>
                    <ToastContainer />
                </Box>
            </LocalizationProvider>
        </AppContext.Provider>
    );
}