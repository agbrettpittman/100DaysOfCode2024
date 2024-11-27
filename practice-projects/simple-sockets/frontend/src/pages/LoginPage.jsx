import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    function handleLogin() {
        if (!username) return;
        // if the username contains special characters, display an error message
        if (username.match(/[^A-Za-z0-9]/)) {
            setMessage('Username can only contain letters and numbers');
            return;
        }
        localStorage.setItem('username', username);
        navigate('/');
    }

    return (
        <Box maxWidth="sm" display="flex" flexDirection="column" gap={2} alignItems="center" margin="auto" marginTop={20}>
            <Typography variant="h3" component="h1" gutterBottom align="center" fontWeight="light">
                Layer of the Ancients
            </Typography>
            <Box display="flex" flexDirection="row" gap={2} alignItems="center" width="30rem">
                <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{margin: 0 }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleLogin}
                    sx={{ height: '3rem', width: '8rem' }}
                >
                    Login
                </Button>
            </Box>
            <Typography variant="body1" component="p" align="center">
                {message}
            </Typography>
        </Box>
    );
};

export default LoginPage;