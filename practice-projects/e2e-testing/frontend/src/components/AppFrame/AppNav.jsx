import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Divider, ListItemIcon } from '@mui/material';
import { Add } from '@mui/icons-material';
import DrawerCharacterListItem from './DrawerCharacterListItem';
import axios from 'axios';
import { useEffect, useState, useContext } from 'react';
import { AppContext } from '@/App';

const drawerWidth = 240;

export default function AppNav() {

    const { CharacterList, getCharacterList } = useContext(AppContext)

    async function createCharacter() {
        // get the count of all characters that match a regex with the name "New Character" and a number
        const count = CharacterList.filter((character) => character.name.match(/^New Character \d+$/)).length
        const newCharacter = {
            name: `New Character ${count + 1}`,
            creationDate: new Date(),
            creator: localStorage.getItem('username')
        }
        axios.post('/characters', newCharacter).then(() => {
            getCharacterList()
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
                            <ListItemText primary="New Character" />
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                    {CharacterList.map((character) => (
                        <DrawerCharacterListItem key={character.id} character={character} />
                    ))}
                </List>
            </Box>
        </Drawer>
    )
}