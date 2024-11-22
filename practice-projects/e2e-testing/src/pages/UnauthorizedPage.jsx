import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage(){
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <Container style={{ textAlign: 'center', marginTop: '50px' }}>
            <Typography variant="h3" component="h2" gutterBottom>
                403
            </Typography>
            <Typography variant="h6" component="h3" gutterBottom>
                Unauthorized
            </Typography>
            <Typography variant="body1" gutterBottom>
                You do not have permission to view this page.
            </Typography>
            <Button 
                sx={{ mt: 4 }}
                variant="contained" color="primary" onClick={handleGoHome}>
                Go to Home
            </Button>
        </Container>
    );
};