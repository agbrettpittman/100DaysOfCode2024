import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';
import { Link } from "react-router-dom";
import { IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Logout } from '@mui/icons-material';

const LogoLink = styled(Link)`
    text-decoration: none;
    color: inherit;
    width: fit-content;
    display: flex;
    gap: 1em;
    align-items: center;
`

const Logo = styled.img`
    filter: ${({ theme }) => theme.palette.mode === 'dark' ? 'invert(1)' : 'invert(0)'};
    height: 40px;
    width: 40px;
`

export default function MainAppBar() {

    const username = localStorage.getItem('username');
    const navigate = useNavigate();

    function handleLogout(){
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <LogoLink>
                    <Logo src="/LotA.png" alt="Logo" />
                    <Typography variant="h5" noWrap component="h1">
                        Mini LotA
                    </Typography>
                </LogoLink>
                <Box sx={{ flexGrow: 1 }} />
                <Typography variant="h6" noWrap component="h2" sx={{ mr: 2 }}>
                    {username}
                </Typography>
                <IconButton onClick={handleLogout} color="inherit">
                    <Logout />
                </IconButton>
            </Toolbar>
        </AppBar>
    )
}