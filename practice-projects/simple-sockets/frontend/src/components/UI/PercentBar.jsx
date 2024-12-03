import { Typography } from '@mui/material'
import React from 'react'
import styled from 'styled-components'

const ContainerBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: relative;
    justify-content: center;
`

const BarBlock = styled.div`
    width: 100%;
    height: 1.5rem;
    background-color: #f0f0f0;
    border-radius: 0.5rem;
    position: relative;
    overflow: hidden;
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: ${({percent}) => percent}%;
        background-color: #4caf50;
        transition: width 1s;
    }
`

export default function PercentBar({text="", percent=0,...otherProps}) {
    return (
        <ContainerBlock {...otherProps}>
            <BarBlock percent={percent} />
            <Typography 
                variant="body2"
                position={'absolute'}
                color="white"
                paddingLeft={'0.5rem'}
            >{text}</Typography>
        </ContainerBlock>
    )
}