import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

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
                variant="contained" color="primary" onClick={handleGoHome}>
                Go to Home
            </Button>
        </Container>
    );
};

export default NotFound;