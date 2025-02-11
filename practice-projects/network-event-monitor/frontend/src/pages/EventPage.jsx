import { useParams } from 'react-router-dom'
import useEvent from '@utilities/hooks/useEvent'
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material'
import { Typography, Box, IconButton, useTheme, Divider, Button, Icon } from '@mui/material'
import { transparentize } from 'polished'
import HoldIconButton from '@components/ui/HoldIconButton'
import EventWidgets from '@components/EventWidgets'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import EventPopup from '@components/EventPopup'

const NoValueSX = { color: 'text.disabled', fontStyle: 'italic' }

export default function EventPage() {
    const { id } = useParams()
    const Theme = useTheme()
    const {Event, deleteEvent, getEvent } = useEvent({id})
    const [Editing, setEditing] = useState(false)
    function getDisplayDatetime(type) {
        return Event[type].format('MMMM Do YYYY, h:mm:ss a')
    }
    const InitialDeleteIconColor = transparentize(0.5, Theme.palette.error.main)
    const InitialEditIconColor = transparentize(0.5, Theme.palette.primary.main)
    const CanEditWidgets = Event.end.isAfter(new Date())

    function handleEditClose() {
        setEditing(false)
        getEvent()
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Editing && (
                <EventPopup 
                    onClose={handleEditClose}
                    defaults={Event}
                    id={id}
                />
            )}
            <Box display={'flex'} flexDirection={'row'} gap={'1rem'} alignItems={'center'} component={'header'}>
                <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                    <IconButton sx={{ color: InitialEditIconColor, '&:hover': { color: Theme.palette.primary.main } }} onClick={() => setEditing(true)}>
                        <EditIcon />
                    </IconButton>
                    <HoldIconButton 
                        color={InitialDeleteIconColor} 
                        hoverColor={Theme.palette.error.main} 
                        onComplete={deleteEvent}
                    >
                        <DeleteIcon />
                    </HoldIconButton>
                </Box>
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
            <EventWidgets canEdit={CanEditWidgets} />
        </Box>
    )
}