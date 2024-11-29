import { useParams } from 'react-router-dom'
import moment from 'moment'
import useRoom from '@utils/hooks/useRoom'
import { Save as SaveIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { Typography, Box, IconButton, useTheme, Divider, TextField } from '@mui/material'
import { transparentize } from 'polished'
import HoldIconButton from '@/components/UI/HoldIconButton'

export default function RoomEditPage() {
    const { id } = useParams()
    const Theme = useTheme()
    const {Room, setRoom, deleteRoom, saveRoom } = useRoom(id)
    const DisplayCreation = moment(Room.creationDate).format('MMMM Do YYYY, h:mm:ss a')
    const InitialDeleteIconColor = transparentize(0.5, Theme.palette.error.main)
    function updateRoom(e){
        setRoom(e.target.name, e.target.value)
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '60rem', width: '30vw' }}>
            <Box display={'flex'} flexDirection={'row'} gap={'1rem'} alignItems={'center'} component={'header'}>
                <TextField
                    variant="outlined"
                    value={Room.name}
                    name="name"
                    onChange={updateRoom}
                />
                <IconButton onClick={saveRoom} color="info">
                    <SaveIcon />
                </IconButton>
                <HoldIconButton 
                    color={InitialDeleteIconColor} 
                    hoverColor={Theme.palette.error.main} 
                    onComplete={deleteRoom}
                >
                    <DeleteIcon />
                </HoldIconButton>
            </Box>
            <Box sx={{display: "flex", flexDirection: "row", gap: 1, mb: 1}} data-testid="creation-date">
                <Typography variant="body1">Created:</Typography>
                <Typography variant="body1" sx={{fontStyle: "italic"}}>{DisplayCreation}</Typography>
            </Box>
            <TextField
                label="Description"
                value={Room.description || ''}
                name="description"
                onChange={updateRoom}
                variant="outlined"
                fullWidth
                multiline
                rows={4}
            />
        </Box>
    )
}