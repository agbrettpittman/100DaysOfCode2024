import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import styled from 'styled-components';
import { Link, useParams } from 'react-router-dom';
import DrawerCharacterListItem from './DrawerCharacterListItem';

const StyledListItemButton = styled(ListItemButton)`
    &.Mui-selected {
        background-color: ${({ theme }) => theme.palette.action.selected};
    }
`

export default function DrawerCharacterListItem({character}) {

    const {id: routeId} = useParams()
    const { id, name } = character
    const selected = id === Number(routeId)
    const hrefTo = `/characters/${id}`

    return (
        <ListItem key={id} disablePadding button component={Link} to={hrefTo}>
            <StyledListItemButton selected={selected}>
                <ListItemText primary={name} />
            </StyledListItemButton>
        </ListItem>
    )
}