import { Dialog, DialogTitle, Box, Button, IconButton } from "@mui/material";
import EventForm from "@components/EventForm";
import { useNavigate } from "react-router-dom";
import { Close } from "@mui/icons-material";
import { ErrorBoundary } from "react-error-boundary";
import ErrorPage from "@pages/ErrorPage";

export default function EventPopup({onClose = () => {}, id = null, defaults = {}}) {
    const Title = id ? 'Edit Event' : 'New Event'
    const navigate = useNavigate()
    return (
        <Dialog open={true} onClose={onClose}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <DialogTitle>{Title}</DialogTitle>
                <IconButton onClick={onClose} sx={{marginRight: 2}}>
                    <Close />
                </IconButton>
            </Box>
            <Box padding={2}>
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <EventForm id={id} onSave={onClose} defaults={defaults}/>
                </ErrorBoundary>
            </Box>
        </Dialog>
    )
}