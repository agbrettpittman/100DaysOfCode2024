import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';
import { Link } from "react-router-dom";

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
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <LogoLink>
                    <Logo src="/LotA.png" alt="Logo" />
                    <Typography variant="h5" noWrap component="h1">
                        Mini LotA
                    </Typography>
                </LogoLink>
            </Toolbar>
    </AppBar>
  )
}