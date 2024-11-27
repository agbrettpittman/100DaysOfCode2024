import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Divider, ListItemIcon } from '@mui/material';
import { Add } from '@mui/icons-material';
import DrawerListItem from './DrawerListItem';
import axios from 'axios';
import { useEffect, useState, useContext } from 'react';
import { AppContext } from '@/App';
import { toast } from 'react-toastify';

const drawerWidth = 240;

export default function AppNav() {

    const { RoomList, getRoomList } = useContext(AppContext)

    async function createRoom() {
        const newCharacter = {
            creator: localStorage.getItem('username')
        }
        axios.post('/rooms', newCharacter).then(() => {
            getCharacterList()
        }).catch((error) => {
            toast.error('Failed to create character')
            console.error(error)
        })
    }

    return (
        <Drawer
            variant="permanent"
            sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
        >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    <ListItem disablePadding>
                        <ListItemButton sx={{ justifyContent: 'start', gap: 1 }} onClick={createRoom}>
                            <ListItemIcon sx={{ minWidth: 0 }}>
                                <Add />
                            </ListItemIcon>
                            <ListItemText primary="New Room" />
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                    {RoomList.map((room) => (
                        <DrawerListItem key={room.id} room={room} />
                    ))}
                </List>
            </Box>
        </Drawer>
    )
}