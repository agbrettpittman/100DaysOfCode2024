import { Divider, ListItemIcon, Box, Drawer, Toolbar, List, ListItem, ListItemButton, ListItemText} from '@mui/material';
import { Add } from '@mui/icons-material';
import DrawerNavItem from './DrawerNavItem';
import axios from 'axios';
import { useContext } from 'react';
import { AppContext } from '@/App';
import { toast } from 'react-toastify';

const drawerWidth = 240;

export default function DrawerNav() {

    const { EventList, getEventList } = useContext(AppContext)

    async function createCharacter() {
        axios.post('/events', {}).then(() => {
            getEventList()
        }).catch((error) => {
            toast.error('Failed to create event')
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
                        <ListItemButton sx={{ justifyContent: 'start', gap: 1 }} onClick={createCharacter}>
                            <ListItemIcon sx={{ minWidth: 0 }}>
                                <Add />
                            </ListItemIcon>
                            <ListItemText primary="New Event" />
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                    {EventList.map((item) => (
                        <DrawerNavItem key={item.id} item={item} />
                    ))}
                </List>
            </Box>
        </Drawer>
    )
}