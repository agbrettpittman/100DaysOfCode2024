import { useParams } from 'react-router-dom'
import moment from 'moment'
import useCharacter from '@utils/hooks/useCharacter'
import { Edit } from '@mui/icons-material'
import { Typography, Box, IconButton } from '@mui/material'

export default function CharacterPage() {
    const { id } = useParams()

    const [Character, setCharacter] = useCharacter(id)
    const DisplayCreation = moment(Character.creationDate).format('MMMM Do YYYY, h:mm:ss a')

    return (
        <div>
            <Box display={'flex'} flexDirection={'row'} gap={'1rem'} gridArea={'characterTitle'} alignItems={'center'} sx={{ mb: 2}}>
                <Typography component="h1" variant="h4" fontStyle={(Character.name) ? "normal" : "italic"}>
                    {Character.name}
                </Typography>
                <IconButton aria-label="edit" color="primary" href={`/characters/${id}/edit`}>
                    <Edit/>
                </IconButton>
            </Box>
            <p className="creationDate">{DisplayCreation}</p>
        </div>
    )
}