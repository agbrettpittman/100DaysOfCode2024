import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import styled from 'styled-components';
import { db } from './utils/db';
import { Divider, ListItemIcon } from '@mui/material';
import { Add } from '@mui/icons-material';

const drawerWidth = 240;

const Logo = styled.img`
    filter: ${({ theme }) => theme.palette.mode === 'dark' ? 'invert(1)' : 'invert(0)'};
    height: 40px;
    width: 40px;
`

export default function App() {

    const [Characters, setCharacters] = useState([])

    useEffect(() => {
        getCharacters()
    }, [])

    async function getCharacters() {
        const foundCharacters = await db.characters.toArray()
        setCharacters(foundCharacters)
    }

    async function createCharacter() {
        // get current character count and add 1
        const count = await db.characters.count()
        const newCharacter = {
            name: `Test Character ${count + 1}`,
            creationDate: new Date()
        }
        await db.characters.add(newCharacter)
        getCharacters()
    }

    async function deleteAllCharacters() {
        await db.characters.clear()
        getCharacters()
    }

    return (
        <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar sx={{ display: 'flex', gap: 2 }}>
                <Logo src="/LotA.png" alt="Logo" />
            <Typography variant="h5" noWrap component="h1">
                Mini LotA
            </Typography>
            </Toolbar>
        </AppBar>
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
                {Characters.map((character) => (
                <ListItem key={character.id} disablePadding>
                    <ListItemButton>
                        <ListItemText primary={character.name} />
                    </ListItemButton>
                </ListItem>
                ))}
                
            </List>
            </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
            <button onClick={deleteAllCharacters}>Delete All Characters</button>
        </Box>
        </Box>
    );
}