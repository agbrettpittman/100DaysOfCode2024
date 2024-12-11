import { Dialog, DialogTitle, Box } from "@mui/material";
import EventForm from "@components/EventForm";

export default function EventPopup({onClose = () => {}, id = null, defaults = {}}) {
    const Title = id ? 'Edit Event' : 'New Event'
    return (
        <Dialog open={true} onClose={onClose}>
            <DialogTitle>{Title}</DialogTitle>
            <Box padding={2}>
                <EventForm id={id} onSave={onClose} defaults={defaults}/>
            </Box>
        </Dialog>
    )
}