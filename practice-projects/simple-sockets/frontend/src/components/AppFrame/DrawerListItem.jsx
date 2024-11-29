import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import styled from 'styled-components';
import { Link, useParams } from 'react-router-dom';

const StyledListItemButton = styled(ListItemButton)`
    &.Mui-selected {
        background-color: ${({ theme }) => theme.palette.action.selected};
    }
`

export default function DrawerListItem({room}) {

    const {id: routeId} = useParams()
    const { id, name } = room
    const selected = id === Number(routeId)
    const hrefTo = `/rooms/${id}`

    return (
        <ListItem key={id} disablePadding button component={Link} to={hrefTo} sx={{ color: 'inherit'}} >
            <StyledListItemButton selected={selected}>
                <ListItemText primary={name} />
            </StyledListItemButton>
        </ListItem>
    )
}