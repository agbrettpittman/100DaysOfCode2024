import { useParams } from 'react-router-dom'
import moment from 'moment'
import useCharacter from '@utils/hooks/useCharacter'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { Typography, Box, IconButton, useTheme, Divider } from '@mui/material'
import { transparentize } from 'polished'
import HoldIconButton from '@/components/UI/HoldIconButton'

export default function CharacterPage() {
    const { id } = useParams()
    const Theme = useTheme()
    const {Character, deleteCharacter } = useCharacter(id)
    const DisplayCreation = moment(Character.creationDate).format('MMMM Do YYYY, h:mm:ss a')
    const InitialEditIconColor = transparentize(0.5, Theme.palette.primary.main)
    const InitialDeleteIconColor = transparentize(0.5, Theme.palette.error.main)
    const HeightValue = (Character.heightFeet || Character.heightInches) ? `${Character.heightFeet}' ${Character.heightInches}"` : ''

    return (
        <div>
            <Box 
                display={'flex'} flexDirection={'row'} gap={'1rem'} alignItems={'center'} sx={{ mb: 2}}
                component={'header'}
            >
                <Typography component="h1" variant="h4">
                    {Character.name}
                </Typography>
                <IconButton 
                    href={`${id}/edit`} 
                    sx={{ color: InitialEditIconColor, "&:hover": {color: 'primary.main'}}}
                >
                    <EditIcon />
                </IconButton>
                <HoldIconButton 
                    color={InitialDeleteIconColor} 
                    hoverColor={Theme.palette.error.main} 
                    onComplete={deleteCharacter}
                >
                    <DeleteIcon />
                </HoldIconButton>
            </Box>
            <Box sx={{display: "flex", flexDirection: "row", gap: "1rem"}}>
                <AttributeText value={HeightValue} fallback="Unknown Height" />
                <Divider orientation="vertical" flexItem />
                <AttributeText 
                    value={Character.weight} fallback="Unknown Weight" 
                    toDisplay={(value) => `${value} lbs`} 
                />
                <Divider orientation="vertical" flexItem />
                <AttributeText 
                    value={Character.age} fallback="Unknown Age" 
                    toDisplay={(value) => `${value} years old`}
                />
            </Box>
            <p className="creationDate">{DisplayCreation}</p>
        </div>
    )
}

function AttributeText({value, fallback, toDisplay = (value) => value}){

    const SX = {
        color: (value) ? "text.primary" : "text.disabled",
        fontStyle: (value) ? "normal" : "italic"
    }

    return (
        <Typography variant="body1" sx={SX}>
            {(value) ? toDisplay(value) : fallback}
        </Typography>
    )
}