import { useParams } from 'react-router-dom'
import moment from 'moment'
import useCharacter from '@utils/hooks/useCharacter'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { Typography, Box, IconButton, useTheme, Divider } from '@mui/material'
import { transparentize } from 'polished'
import HoldIconButton from '@/components/UI/HoldIconButton'

const NoValueSX = { color: 'text.disabled', fontStyle: 'italic' }

export default function CharacterPage() {
    const { id } = useParams()
    const Theme = useTheme()
    const {Character, deleteCharacter } = useCharacter(id)
    const DisplayCreation = moment(Character.creationDate).format('MMMM Do YYYY, h:mm:ss a')
    const InitialEditIconColor = transparentize(0.5, Theme.palette.primary.main)
    const InitialDeleteIconColor = transparentize(0.5, Theme.palette.error.main)
    const HeightValue = (Character.heightFeet || Character.heightInches) ? `${Character.heightFeet}' ${Character.heightInches}"` : ''

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '60rem', width: '30vw' }}>
            <Box display={'flex'} flexDirection={'row'} gap={'1rem'} alignItems={'center'} component={'header'}>
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
            <Box sx={{display: "flex", flexDirection: "row", gap: 1, mb: 1}} data-testid="creation-date">
                <Typography variant="body1">Created:</Typography>
                <Typography variant="body1" sx={{fontStyle: "italic"}}>{DisplayCreation}</Typography>
            </Box>
            <Box sx={{display: "flex", flexDirection: "row", gap: "1rem"}}>
                <QuickStat value={HeightValue} fallback="Unknown Height" testId='height' />
                <Divider orientation="vertical" flexItem />
                <QuickStat 
                    value={Character.weight} fallback="Unknown Weight" 
                    toDisplay={(value) => `${value} lbs`} testId='weight'
                />
                <Divider orientation="vertical" flexItem />
                <QuickStat 
                    value={Character.age} fallback="Unknown Age" testId='age'
                    toDisplay={(value) => `${value} years old`}
                />
            </Box>
            <Typography variant="body1" data-testid="description" sx={(Character.description) ? undefined : NoValueSX}>
                {Character.description || "No Description"}
            </Typography>
            <Divider />
            <AttributeItem label="Primary" value={Character.primaryWeapon} />
            <AttributeItem label="Secondary" value={Character.secondaryWeapon} />
        </Box>
    )
}

function QuickStat({value, fallback, toDisplay = (value) => value, testId = ""}){

    let customSX = {
        color: "text.primary",
        fontStyle: "normal"
    }

    if (!value) customSX = NoValueSX

    return (
        <Typography variant="body1" sx={customSX} data-testid={`quick-stat-${testId}`}>
            {(value) ? toDisplay(value) : fallback}
        </Typography>
    )
}

function AttributeItem({label, value, fallback = "Unknown"}){

    let customSX = {
        color: "text.primary",
        fontStyle: "normal"
    }

    if (!value) customSX = NoValueSX

    return (
        <Box sx={{display: "flex", flexDirection: "row", gap: 1}} data-testid={`attribute-${label}`}>
            <Typography variant="body1" sx={{fontWeight: "bold"}}>{label}:</Typography>
            <Typography variant="body1" sx={customSX}>
                {(value) ? value : fallback}
            </Typography>
        </Box>
    )
}