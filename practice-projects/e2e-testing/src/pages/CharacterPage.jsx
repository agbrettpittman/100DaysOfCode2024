import { useParams } from 'react-router-dom'
import moment from 'moment'
import useCharacter from '@utils/hooks/useCharacter'
import { Edit } from '@mui/icons-material'
import { Typography, Box, IconButton } from '@mui/material'

export default function CharacterPage() {
    const { id } = useParams()

    const {Character} = useCharacter(id)
    const DisplayCreation = moment(Character.creationDate).format('MMMM Do YYYY, h:mm:ss a')

    return (
        <div>
            <Box 
                display={'flex'} flexDirection={'row'} gap={'1rem'} alignItems={'center'} sx={{ mb: 2}}
                component={'header'}
            >
                <Typography component="h1" variant="h4">
                    {Character.name}
                </Typography>
                <IconButton color="primary" href={`${id}/edit`}>
                    <Edit/>
                </IconButton>
            </Box>
            <p className="creationDate">{DisplayCreation}</p>
        </div>
    )
}