import { Box, Typography } from '@mui/material'
import React from 'react'

export default function Root({}) {
  return (
    <Box sx={{opacity: 0.5}}>
        <Typography component="h2" variant="h3" align='center' sx={{ fontWeight: "lighter", mt:16 }}>
            Lair of the Ancients
        </Typography>
        <Typography component="h3" variant="subtitle1" align='center' sx={{ mt:2 }}>
            Welcome! You can find your characters on the sidebar or add a new one with the "New Character" button.
        </Typography>
    </Box>
  )
}