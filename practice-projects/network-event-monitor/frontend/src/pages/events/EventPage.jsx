import { useParams } from 'react-router-dom'
import moment from 'moment'
import useEvent from '@utilities/hooks/useEvent'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { Typography, Box, IconButton, useTheme, Divider } from '@mui/material'
import { transparentize } from 'polished'
import HoldIconButton from '@components/ui/HoldIconButton'

const NoValueSX = { color: 'text.disabled', fontStyle: 'italic' }

export default function EventPage() {
    const { id } = useParams()
    const Theme = useTheme()
    const {Event, deleteEvent } = useEvent(id)
    const DisplayEventDatetime = Event.eventDatetime.format('MMMM Do YYYY, h:mm:ss a')
    const InitialEditIconColor = transparentize(0.5, Theme.palette.primary.main)
    const InitialDeleteIconColor = transparentize(0.5, Theme.palette.error.main)

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box display={'flex'} flexDirection={'row'} gap={'1rem'} alignItems={'center'} component={'header'}>
                <IconButton 
                    href={`${id}/edit`} 
                    sx={{ color: InitialEditIconColor, "&:hover": {color: 'primary.main'}}}
                >
                    <EditIcon />
                </IconButton>
                <HoldIconButton 
                    color={InitialDeleteIconColor} 
                    hoverColor={Theme.palette.error.main} 
                    onComplete={deleteEvent}
                >
                    <DeleteIcon />
                </HoldIconButton>
                <Typography component="h1" variant="h4">
                    {Event.eventName}
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Typography variant="h5" sx={{ fontStyle: 'italic', color: 'text.secondary', fontWeight: 'light' }}>
                    {Event.referenceID}
                </Typography>
            </Box>
            <Typography variant="body1" sx={{fontStyle: "italic"}}>{DisplayEventDatetime}</Typography>
            <Typography variant="body1" data-testid="description" sx={(Event.description) ? undefined : NoValueSX}>
                {Event.description || "No Description"}
            </Typography>
        </Box>
    )
}