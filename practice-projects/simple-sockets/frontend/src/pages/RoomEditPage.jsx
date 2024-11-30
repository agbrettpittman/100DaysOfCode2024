import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import useRoom from '@utils/hooks/useRoom'
import { Save as SaveIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material'
import { Typography, Box, IconButton, useTheme, Divider, TextField, Button } from '@mui/material'
import { transparentize } from 'polished'
import HoldIconButton from '@/components/UI/HoldIconButton'
import axios from 'axios'
import { toast } from 'react-toastify'

export default function RoomEditPage() {
    const { id } = useParams()
    const Theme = useTheme()
    const {Room, setRoom, deleteRoom, saveRoom } = useRoom(id)
    const [newCandidate, setNewCandidate] = useState({ name: '', title: '' });
    const [matchingCandidates, setMatchingCandidates] = useState([]);
    const DisplayCreation = moment(Room.creationDate).format('MMMM Do YYYY, h:mm:ss a')
    const InitialDeleteIconColor = transparentize(0.5, Theme.palette.error.main)

    useEffect(() => {
        getMatchingCandidates()
    }, [newCandidate])


    function updateRoom(e){
        setRoom(e.target.name, e.target.value)
    }

    function updateNewCandidate(e){
        setNewCandidate((prevState) => {
            return {
                ...prevState,
                [e.target.name]: e.target.value
            }
        })
    }

    function getMatchingCandidates(){
        if (!newCandidate.name && !newCandidate.title) {
            setMatchingCandidates([])
            return
        }
        let params = {
            name: newCandidate.name.trim(),
            title: newCandidate.title.trim()
        }
        axios.get("/candidates", { params }).then((response) => {
            setMatchingCandidates(response.data)
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to get matching candidates')
        })
    }

    function createCandidate(){
        if (!newCandidate.name || !newCandidate.title) {
            toast.error('Name and title are required')
            return
        }
        axios.post('/candidates', newCandidate).then( res => {
            setNewCandidate({ name: '', title: '' })
            getMatchingCandidates()
            addCandidate(res.data)
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to create candidate')
        })
    }

    function addCandidate(candidate){
        axios.post(`/rooms/${id}/candidates/${candidate.id}`).then(() => {
            setRoom('candidates', [...Room.candidates, candidate])
            setMatchingCandidates([])
            setNewCandidate({ name: '', title: '' })
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to add candidate to room')
        })
    }

    function removeCandidate(candidate){
        axios.delete(`/rooms/${id}/candidates/${candidate.id}`).then(() => {
            setRoom('candidates', Room.candidates.filter((c) => c.id !== candidate.id))
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to remove candidate from room')
        })
    }

    
    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'space-between', mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '40%', width: '30vw' }}>
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
                <Divider />
                <Typography variant="h5" component="h2">Add Candidates</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '60rem', width: '30vw' }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
                        <TextField
                            label="Name"
                            value={newCandidate.name}
                            name="name"
                            variant="outlined"
                            onChange={updateNewCandidate}
                        />
                        <TextField
                            label="Title"
                            variant="outlined"
                            value={newCandidate.title}
                            name="title"
                            onChange={updateNewCandidate}
                        />
                    </Box>
                    <Button variant="contained" color="primary" onClick={createCandidate} sx={{ width: '10rem' }}>
                        Create
                    </Button>
                    {(matchingCandidates.length > 0) && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="h6" mt={2} mb={1}
                            >Matching Candidates</Typography>
                            {matchingCandidates.map((candidate, index) => (
                                <Box key={index} sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                                    <Button variant="contained" color="secondary" onClick={() => addCandidate(candidate)}>
                                        Add
                                    </Button>
                                    <Typography variant="body1">{candidate.name}</Typography>
                                    <Divider orientation="vertical" flexItem />
                                    <Typography variant="body2" color="textSecondary">{candidate.title}</Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                    
                </Box>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '40%', width: '30vw'}}>
                <Typography variant="h4" component="h2">Candidates</Typography>
                {Room.candidates.map((candidate, index) => (
                    <Box key={index} sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                        <HoldIconButton 
                            color={InitialDeleteIconColor} 
                            hoverColor={Theme.palette.error.main} 
                            onComplete={() => removeCandidate(candidate)}
                        >
                            <CloseIcon />
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