import { useParams } from 'react-router-dom'
import moment from 'moment'
import useRoom from '@utils/hooks/useRoom'
import { Typography, Box } from '@mui/material'

export default function RoomPage() {
    const { id } = useParams()
    const {Room } = useRoom(id)
    const DisplayCreation = moment(Room.creationDate).format('MMMM Do YYYY, h:mm:ss a')

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '60rem', width: '30vw' }}>
            <Box display={'flex'} flexDirection={'row'} gap={'1rem'} alignItems={'center'} component={'header'}>
                <Typography component="h1" variant="h4">
                    {Room.name}
                </Typography>
            </Box>
            <Box sx={{display: "flex", flexDirection: "row", gap: 1, mb: 1}} data-testid="creation-date">
                <Typography variant="body1">Created:</Typography>
                <Typography variant="body1" sx={{fontStyle: "italic"}}>{DisplayCreation}</Typography>
            </Box>
            <Typography variant="body1" component="p">{Room.description}</Typography>
        </Box>
    )
}