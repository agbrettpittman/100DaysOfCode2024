import { useParams } from 'react-router-dom'
import moment from 'moment'
import useCharacter from '@utils/hooks/useCharacter'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { Typography, Box, IconButton, useTheme } from '@mui/material'
import { transparentize } from 'polished'
import styled from 'styled-components'
import { useEffect, useRef, useState } from 'react'

// make a red border grow from left to right circularly
// around the delete icon when clicked
const DeleteIconButton = styled(IconButton)`
    position: relative;
    overflow: hidden;
    border-radius: 50%;
    transition: all 0.5s;
    &::before {
        content: '';
        position: absolute;
        top: 50%; /* Center the pseudo-element vertically */
        left: 50%; /* Center the pseudo-element horizontally */
        transform: translate(-50%, -50%) rotate(-90deg); /* Start from the top */
        width: 100%; /* Full size of the button */
        height: 100%; /* Full size of the button */
        border-radius: 50%; /* Circular shape */
        
        /* Conic gradient for dynamic border coverage */
        background: conic-gradient(
            ${({ theme }) => theme.palette.error.main} ${({ coverage }) => coverage}%,
            transparent 0
        );

        /* Hollow out the center to leave only the border */
        mask: radial-gradient(circle, transparent 60%, black 61%);
        -webkit-mask: radial-gradient(circle, transparent 60%, black 61%);
    }
`

export default function CharacterPage() {
    const { id } = useParams()
    const Theme = useTheme()
    const {Character, deleteCharacter } = useCharacter(id)
    const [DeletionPercentage, setDeletionPercentage] = useState(0)
    const [DeleteIconClicked, setDeleteIconClicked] = useState(false)
    const CurrentDeleteIconInterval = useRef(null)
    const DisplayCreation = moment(Character.creationDate).format('MMMM Do YYYY, h:mm:ss a')
    const InitialEditIconColor = transparentize(0.5, Theme.palette.primary.main)
    const InitialDeleteIconColor = transparentize(0.5, Theme.palette.error.main)

    useEffect(() => {
        // if the delete icon is clicked, gradually increase the border coverage
        // to create a circular border growing effect
        CurrentDeleteIconInterval.current = null
        if (DeleteIconClicked){
            CurrentDeleteIconInterval.current = setInterval(() => {
                setDeletionPercentage((prev) => {
                    if (prev > 100){
                        clearInterval(CurrentDeleteIconInterval.current)
                        setDeleteIconClicked(false)
                        deleteCharacter()
                        return 0
                    }
                    return prev + 1
                })
            }, 10)
        } else {
            // if DeletionPercentage is not 0, gradually decrease it
            if (DeletionPercentage > 0){
                CurrentDeleteIconInterval.current = setInterval(() => {
                    setDeletionPercentage((prev) => {
                        if (prev <= 0){
                            clearInterval(CurrentDeleteIconInterval.current)
                            return 0
                        }
                        return prev - 1
                    })
                }, 10)
            }
        }

        return () => clearInterval(CurrentDeleteIconInterval.current)
    }, [DeleteIconClicked])


    return (
        <div>
            <Box 
                display={'flex'} flexDirection={'row'} gap={'1rem'} alignItems={'center'} sx={{ mb: 2}}
                component={'header'}
            >
                <Typography component="h1" variant="h4">
                    {Character.name}
                </Typography>
                <IconButton 
                    href={`${id}/edit`} 
                    sx={{ color: InitialEditIconColor, "&:hover": {color: 'primary.main'}}}
                >
                    <EditIcon />
                </IconButton>
                <DeleteIconButton 
                    sx={{ 
                        color: InitialDeleteIconColor, 
                        "&:hover": {color: 'error.main'},
                    }}
                    coverage={DeletionPercentage}
                    onMouseDown={() => setDeleteIconClicked(true)}
                    onMouseUp={() => setDeleteIconClicked(false)}
                >
                    <DeleteIcon />
                </DeleteIconButton>
            </Box>
            <p className="creationDate">{DisplayCreation}</p>
        </div>
    )
}