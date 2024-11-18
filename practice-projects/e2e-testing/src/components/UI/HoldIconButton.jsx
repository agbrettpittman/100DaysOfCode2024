import React from 'react'
import { IconButton } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

const StyledIconButton = styled(IconButton)`
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

function HoldIconButton({color = "", hoverColor = "", onComplete = () => {}, children}) {
    const [ConfirmationPercentage, setConfirmationPercentage] = useState(0)
    const [ButtonClicked, setButtonClicked] = useState(false)
    const ConfirmationInterval = useRef(null)

    useEffect(() => {
        // if the delete icon is clicked, gradually increase the border coverage
        // to create a circular border growing effect
        ConfirmationInterval.current = null
        if (ButtonClicked){
            ConfirmationInterval.current = setInterval(() => {
                setConfirmationPercentage((prev) => {
                    if (prev > 100){
                        clearInterval(ConfirmationInterval.current)
                        setButtonClicked(false)
                        onComplete()
                        return 0
                    }
                    return prev + 1
                })
            }, 10)
        } else {
            // if DeletionPercentage is not 0, gradually decrease it
            if (DeletionPercentage > 0){
                ConfirmationInterval.current = setInterval(() => {
                    setConfirmationPercentage((prev) => {
                        if (prev <= 0){
                            clearInterval(ConfirmationInterval.current)
                            return 0
                        }
                        return prev - 1
                    })
                }, 10)
            }
        }

        return () => clearInterval(ConfirmationInterval.current)
    }, [ButtonClicked])

    const IconButtonSX = {
        color: color,
        "&:hover": {color: hoverColor || color},
    }

    return (
        <StyledIconButton 
            sx={IconButtonSX}
            coverage={ConfirmationPercentage}
            onMouseDown={() => setButtonClicked(true)}
            onMouseUp={() => setButtonClicked(false)}
        >
            {children}
        </StyledIconButton>
    )
}

export default HoldIconButton