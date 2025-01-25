import React from 'react'
import { Box, Typography } from '@mui/material'

export default function WidgetError({error, name, id}) {
    let errorText = "Unknown details"
    console.error(error)
    if (!error) errorText = "Unknown error";
    else if (error instanceof Error) errorText = error.message;
    else if (typeof error === "string") errorText = error;
    else if (
        typeof error === "object"
        && "statusText" in error
        && typeof error.statusText === "string"
    ) {
        errorText = error.statusText;
    }
    return (
        <Box>
            <Typography component={"h3"} color='error'>
                Error Rendering {name} {id}
            </Typography>
            <Typography component={"body1"} color='error'>
                {errorText}
            </Typography>
        </Box>
    )
}