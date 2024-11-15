import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { db } from '@utils/db';
import { Divider, ListItemIcon } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useLiveQuery } from 'dexie-react-hooks';
import DrawerCharacterListItem from './DrawerCharacterListItem';

const drawerWidth = 240;

export default function AppNav() {

    const Characters = useLiveQuery(() => 
        db.characters.toArray().then((characters) => characters.reverse())
    , []) || []

    async function createCharacter() {
        // get current character count and add 1
        const count = await db.characters.count()
        const newCharacter = {
            name: `Test Character ${count + 1}`,
            creationDate: new Date()
        }
        await db.characters.add(newCharacter)
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
                    {Characters.map((character) => (
                        <DrawerCharacterListItem key={character.id} character={character} />
                    ))}
                </List>
            </Box>
        </Drawer>
    )
}