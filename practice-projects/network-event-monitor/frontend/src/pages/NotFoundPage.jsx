import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound(){
    const navigate = useNavigate();

    return (
        <Container style={{ textAlign: 'center', marginTop: '50px' }}>
            <Typography variant="h3" component="h2" gutterBottom>
                404
            </Typography>
            <Typography variant="h6" component="h3" gutterBottom>
                Page Not Found
            </Typography>
            <Typography variant="body1" gutterBottom>
                The page you are looking for does not exist.
            </Typography>
            <Button 
                sx={{ mt: 4 }}
                variant="contained" color="primary" onClick={() => navigate('/')}>
                Go to Home
            </Button>
        </Container>
    );
};