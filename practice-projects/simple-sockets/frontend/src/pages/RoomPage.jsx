import { useParams } from 'react-router-dom'
import moment from 'moment'
import useRoom from '@utils/hooks/useRoom'
import { Typography, Box, Divider, useTheme} from '@mui/material'
import HoldIconButton from '@/components/UI/HoldIconButton'
import { ThumbUp, ThumbDown, Web } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { transparentize } from 'polished'
import { useState, useRef, Fragment, useEffect } from 'react'
import PercentBar from '@/components/UI/PercentBar'

export default function RoomPage() {
    const { id } = useParams()
    const { Room, updateState:setRoom } = useRoom(id)
    const Theme = useTheme()
    const [DisableVoting, setDisableVoting] = useState(false)
    const [WebsocketConnection, setWebsocketConnection] = useState(null)
    const DisplayCreation = moment(Room.creationDate).format('MMMM Do YYYY, h:mm:ss a')
    const InitialUpIconColor = transparentize(0.5, Theme.palette.info.main)
    const InitialDownIconColor = transparentize(0.5, Theme.palette.error.main)
    const DisableInterval = useRef(null)
    const TotalVotes = Room.candidates.reduce((acc, candidate) => acc + candidate.votes, 0)

    useEffect(() => {
        // Create WebSocket connection
        const SocketBase = import.meta.env.VITE_APP_SOCKET_BACKEND
        const socket = new WebSocket(`${SocketBase}/rooms/ws/${id}`);

        // On message received
        socket.onmessage = (event) => {
            try{
                const {type, message} = JSON.parse(event.data);
                if (type === 'error'){
                    toast.error(message)
                    return
                }
                setRoom(prevValue => {
                    return {
                        ...prevValue,
                        candidates: prevValue.candidates.map(candidate => {
                            if (candidate.id === message.candidate_id){
                                return {
                                    ...candidate,
                                    votes: message.votes
                                }
                            }
                            return candidate
                        })
                    }
                })
            } catch (error) {
                console.error(error)
                toast.error('Failed to parse message from server')
            }
        };

        // On WebSocket error
        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            toast.error('Error connecting to server')
        };

        // On WebSocket close
        socket.onclose = () => console.log("WebSocket closed");

        // Store socket for sending messages
        setWebsocketConnection(socket);

        // Cleanup on component unmount
        return () => {
            socket.close();
        };
    }, [id]);

    function castVote(candidate, vote){
        if (!candidate || ['up', 'down'].indexOf(vote) === -1){
            toast.error('Candidate and vote are required')
            return
        }
        if (DisableInterval.current) return
        try {
            if (WebsocketConnection && WebsocketConnection.readyState === WebSocket.OPEN){
                WebsocketConnection.send(JSON.stringify({
                    type: 'vote',
                    candidate: candidate.id,
                    vote: vote
                }))
                setDisableVoting(true)
                DisableInterval.current = setTimeout(() => {
                    setDisableVoting(false)
                    clearInterval(DisableInterval.current)
                    DisableInterval.current = null
                }, 1000)
            } else toast.error('Failed to connect to server')
        } catch (error) {
            console.error(error)
            toast.error('Failed to cast vote')
        }
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
                {Room.candidates.map((candidate, index) => {
                    const VotePercent = TotalVotes > 0 ? (candidate.votes / TotalVotes) * 100 : 0
                    return (
                        <Fragment key={index}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
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
                            <PercentBar text={
                                `${VotePercent.toFixed(2)}% (${candidate.votes})`
                            } percent={VotePercent} />
                        </Fragment>

                    )
                })}
            </Box>
        </Box>
    )
}