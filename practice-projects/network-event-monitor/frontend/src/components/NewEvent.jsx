import { Dialog, DialogTitle, Box } from "@mui/material";
import EventEdit from "@pages/events/EventEdit";

export default function NewEvent({onClose = () => {}}) {
    return (
        <Dialog open={true} onClose={onClose}>
            <DialogTitle>New Event</DialogTitle>
            <Box padding={2}>
                <EventEdit />
            </Box>
        </Dialog>
    )
}