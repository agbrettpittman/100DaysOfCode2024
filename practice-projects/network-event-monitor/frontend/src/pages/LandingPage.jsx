import { Box, Typography } from '@mui/material'
import React from 'react'

export default function LandingPage({}) {
  return (
    <Box sx={{opacity: 0.5}}>
        <Typography component="h2" variant="h3" align='center' sx={{ fontWeight: "lighter", mt:16 }}>
            Welcome
        </Typography>
        <Typography component="h3" variant="subtitle1" align='center' sx={{ mt:2 }}>
            This app helps monitor active network events and determine their current status
        </Typography>
    </Box>
  )
}