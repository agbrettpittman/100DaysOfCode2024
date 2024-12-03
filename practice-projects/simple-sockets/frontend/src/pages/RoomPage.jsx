import { useParams } from 'react-router-dom'
import moment from 'moment'
import useRoom from '@utils/hooks/useRoom'
import { Typography, Box, Divider, useTheme} from '@mui/material'
import HoldIconButton from '@/components/UI/HoldIconButton'
import { ThumbUp, ThumbDown } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { transparentize } from 'polished'
import axios from 'axios'
import { useState, useRef } from 'react'

export default function RoomPage() {
    const { id } = useParams()
    const { Room, getRoomData } = useRoom(id)
    const Theme = useTheme()
    const [DisableVoting, setDisableVoting] = useState(false)
    const DisplayCreation = moment(Room.creationDate).format('MMMM Do YYYY, h:mm:ss a')
    const InitialUpIconColor = transparentize(0.5, Theme.palette.info.main)
    const InitialDownIconColor = transparentize(0.5, Theme.palette.error.main)
    const DisableInterval = useRef(null)

    function castVote(candidate, vote){
        if (!candidate || ['up', 'down'].indexOf(vote) === -1){
            toast.error('Candidate and vote are required')
            return
        }
        let method = (vote === 'up') ? 'post' : 'delete'
        if (DisableInterval.current) return
        axios.request({
            url: `/rooms/${id}/candidates/${candidate.id}/vote`,
            method: method
        }).then(() => {
            setDisableVoting(true)
            DisableInterval.current = setTimeout(() => {
                setDisableVoting(false)
                clearInterval(DisableInterval.current)
                DisableInterval.current = null
            }, 5000)
            toast.success(`${vote} vote cast for ${candidate.name}`)
            getRoomData()
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to cast vote')
        })

    }

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
            <Typography variant="body1" component="p" color="textSecondary">{Room.description}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2}}>
                <Typography variant="h4" component="h2">Candidates</Typography>
                {Room.candidates.map((candidate, index) => (
                    <Box key={index} sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                        <Typography variant="body1">{candidate.votes}</Typography>
                        <HoldIconButton 
                            onComplete={() => castVote(candidate, 'up')} 
                            color={InitialUpIconColor} 
                            hoverColor={Theme.palette.info.main}
                            disabled={DisableVoting}
                        >
                            <ThumbUp />
                        </HoldIconButton>
                        <HoldIconButton 
                            onComplete={() => castVote(candidate, 'down')}
                            color={InitialDownIconColor}
                            hoverColor={Theme.palette.error.main}
                            disabled={DisableVoting}
                        >
                            <ThumbDown />
                        </HoldIconButton>
                        <Typography variant="body1">{candidate.name}</Typography>
                        <Divider orientation="vertical" flexItem />
                        <Typography variant="body2" color="textSecondary">{candidate.title}</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    )
}