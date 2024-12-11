import useEvent from "@utilities/hooks/useEvent";
import { TextField, Box, Button } from '@mui/material';
import { DateTimePicker } from "@mui/x-date-pickers";
import moment from "moment";

export default function EventForm({id, onSave=()=>{}, defaults = {}}){
    
    const {Event, setEvent, saveEvent} = useEvent(id, defaults)

    function modifyEvent(event) {
        setEvent(event.target.name, event.target.value)
    }

    function handleSave(){
        saveEvent()
        onSave()
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '60rem', width: '30vw' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                <TextField
                    label="Event Name"
                    value={Event.eventName || ''}
                    name="eventName"
                    onChange={modifyEvent}
                    variant="outlined"
                    fullWidth
                />
            </Box>
            <TextField
                label="Reference ID"
                value={Event.referenceID || ''}
                name="referenceID"
                onChange={modifyEvent}
                variant="outlined"
                fullWidth
            />
            <DateTimePicker
                label="Event Datetime"
                value={Event.eventDatetime || moment()}
                name="eventDatetime"
                onChange={(date) => setEvent('eventDatetime', date)}
                inputVariant="outlined"
                fullWidth
            />
            <TextField
                label="Description"
                value={Event.description || ''}
                name="description"
                onChange={modifyEvent}
                variant="outlined"
                fullWidth
                multiline
                rows={4}
            />
            <Button
                variant="contained"
                onClick={handleSave}
                color="secondary"
            >
                Save
            </Button>
        </Box>
    )

}