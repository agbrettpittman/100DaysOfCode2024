import { Box, Typography } from '@mui/material'
import React from 'react'

export default function Root({}) {
  return (
    <Box sx={{opacity: 0.5}}>
        <Typography component="h2" variant="h3" align='center' sx={{ fontWeight: "lighter", mt:16 }}>
            Who Won That?
        </Typography>
        <Typography component="h3" variant="subtitle1" align='center' sx={{ mt:2 }}>
            Welcome! You can find the available rooms on the left side.
        </Typography>
    </Box>
  )
}