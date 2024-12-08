import { ListItem, ListItemButton, ListItemText } from '@mui/material';
import styled from 'styled-components';
import { Link, useParams } from 'react-router-dom';

const StyledListItemButton = styled(ListItemButton)`
    &.Mui-selected {
        background-color: ${({ theme }) => theme.palette.action.selected};
    }
`

export default function DrawerNavItem({item}) {

    const {id: routeId} = useParams()
    const { id, eventName } = item
    const selected = id === Number(routeId)
    const hrefTo = `/events/${id}`

    return (
        <ListItem key={id} disablePadding button component={Link} to={hrefTo} sx={{ color: 'inherit'}} >
            <StyledListItemButton selected={selected}>
                <ListItemText primary={eventName} />
            </StyledListItemButton>
        </ListItem>
    )
}