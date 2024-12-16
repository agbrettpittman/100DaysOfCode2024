import { useParams } from 'react-router-dom'
import moment from 'moment'
import useEvent from '@utilities/hooks/useEvent'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { Typography, Box, IconButton, useTheme, Divider } from '@mui/material'
import { transparentize } from 'polished'
import HoldIconButton from '@components/ui/HoldIconButton'
import PingPlotter from '@components/widgets/PingPlotter'
import EventWidgets from '@components/EventWidgets'

const NoValueSX = { color: 'text.disabled', fontStyle: 'italic' }

export default function EventPage() {
    const { id } = useParams()
    const Theme = useTheme()
    const {Event, deleteEvent } = useEvent({id})
    function getDisplayDatetime(type) {
        return Event[type].format('MMMM Do YYYY, h:mm:ss a')
    }
    const InitialDeleteIconColor = transparentize(0.5, Theme.palette.error.main)

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box display={'flex'} flexDirection={'row'} gap={'1rem'} alignItems={'center'} component={'header'}>
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
            <Box display={'flex'} flexDirection={'row'} gap={'1rem'} alignItems={'center'}>
                <Typography variant="body1" sx={{fontStyle: "italic"}}>
                    {getDisplayDatetime("start")}
                </Typography>
                <Typography variant="body1" sx={{color: 'text.secondary', fontWeight: 'light', fontSize: '1.25rem'}}>
                    {' - '}
                </Typography>
                <Typography variant="body1" sx={{fontStyle: "italic"}}>
                    {getDisplayDatetime("end")}
                </Typography>
            </Box>
            <Typography variant="body1" data-testid="description" sx={(Event.description) ? undefined : NoValueSX}>
                {Event.description || "No Description"}
            </Typography>
            <EventWidgets widgets={Event.widgets} />
        </Box>
    )
}