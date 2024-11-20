import { useParams } from "react-router-dom"
import useCharacter from "@utils/hooks/useCharacter";
import {TextField, Box, IconButton, useTheme} from '@mui/material';
import { MyNumberInput } from "@/components/UI/controls/InputLibrary";
import { ArrowBack } from "@mui/icons-material";
import { transparentize } from "polished";


export default function CharacterEditPage({}){
    
    const { id } = useParams()
    const {Character, setCharacter} = useCharacter(id)
    const Theme = useTheme()
    const InitialBackIconColor = transparentize(0.5, Theme.palette.primary.main)

    function updateCharacter(event) {
        setCharacter(event.target.name, event.target.value)
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '60rem', width: '30vw' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                <IconButton
                    href={`/characters/${id}`}
                    sx={{ color: InitialBackIconColor, "&:hover": {color: 'primary.main'}}}
                >
                    <ArrowBack />
                </IconButton>
                <TextField
                    label="Character Name"
                    value={Character.name || ''}
                    name="name"
                    onChange={updateCharacter}
                    variant="outlined"
                    fullWidth
                />
            </Box>
            <TextField
                label="Description"
                value={Character.description || ''}
                name="description"
                onChange={updateCharacter}
                variant="outlined"
                fullWidth
                multiline
                rows={4}
            />
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                    <MyNumberInput
                        label="Height (feet)"
                        value={Character.heightFeet || 0}
                        name="heightFeet"
                        onChange={updateCharacter}
                        variant="outlined"
                        sx={{ width: '6rem' }}
                        fullWidth
                    />
                    <MyNumberInput
                        label="Height (inches)"
                        value={Character.heightInches || 0}
                        name="heightInches"
                        onChange={updateCharacter}
                        sx={{ width: '7rem' }}
                        variant="outlined"
                    />
                </Box>
                <MyNumberInput
                    label="Weight (lbs)"
                    value={Character.weight || 0}
                    name="weight"
                    onChange={updateCharacter}
                    sx={{ width: '6rem' }}
                    variant="outlined"
                />
                <MyNumberInput
                    label="Age (Years)"
                    value={Character.age || 0}
                    name="age"
                    onChange={updateCharacter}
                    sx={{ width: '6rem' }}
                    variant="outlined"
                />
            </Box>
            <TextField
                label="Primary Weapon"
                value={Character.primaryWeapon || ''}
                name="primaryWeapon"
                onChange={updateCharacter}
                variant="outlined"
                fullWidth
            />
            <TextField
                label="Secondary Weapon"
                value={Character.secondaryWeapon || ''}
                name="secondaryWeapon"
                onChange={updateCharacter}
                variant="outlined"
                fullWidth
            />
        </Box>
    )

}