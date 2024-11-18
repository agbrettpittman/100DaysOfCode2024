
import React from 'react'
import { IconButton } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

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
            ${({ confirmationColor }) => confirmationColor} ${({ coverage }) => coverage}%,
            transparent 0
        );

        /* Hollow out the center to leave only the border */
        mask: radial-gradient(circle, transparent 60%, black 61%);
        -webkit-mask: radial-gradient(circle, transparent 60%, black 61%);
    }
`

/**
 * HoldIconButton component creates a button with a dynamic circular border that grows when the button is held down.
 * The border coverage increases over time and triggers an onComplete callback when fully covered.
 *
 * @param {Object} props - The properties object.
 * @param {string} [props.color=""] - The color of the button.
 * @param {string} [props.hoverColor=""] - The color of the button when hovered.
 * @param {Function} [props.onComplete=() => {}] - The callback function to be called when the border coverage reaches 100%.
 * @param {number} [props.speed=10] - The speed at which the border coverage increases or decreases.
 * @param {React.ReactNode} props.children - The child elements to be rendered inside the button.
 *
 * @returns {JSX.Element} The rendered HoldIconButton component.
 */
function HoldIconButton({color = "", hoverColor = "", onComplete = () => {}, speed = 10, children}) {
    const [ConfirmationPercentage, setConfirmationPercentage] = useState(0)
    const [ButtonClicked, setButtonClicked] = useState(false)
    const ConfirmationInterval = useRef(null)
    const ActiveColor = hoverColor || color

    useEffect(() => {
        // if the button is clicked, gradually increase the border coverage
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
            }, speed)
        } else {
            // if ConfirmationPercentage is not 0, gradually decrease it
            if (ConfirmationPercentage > 0){
                ConfirmationInterval.current = setInterval(() => {
                    setConfirmationPercentage((prev) => {
                        if (prev <= 0){
                            clearInterval(ConfirmationInterval.current)
                            return 0
                        }
                        return prev - 1
                    })
                }, speed)
            }
        }

        return () => clearInterval(ConfirmationInterval.current)
    }, [ButtonClicked])

    const IconButtonSX = {
        color: color,
        "&:hover": {color: ActiveColor},
    }

    return (
        <StyledIconButton 
            sx={IconButtonSX}
            coverage={ConfirmationPercentage}
            onMouseDown={() => setButtonClicked(true)}
            onMouseUp={() => setButtonClicked(false)}
            confirmationColor={ActiveColor}
        >
            {children}
        </StyledIconButton>
    )
}

export default HoldIconButton