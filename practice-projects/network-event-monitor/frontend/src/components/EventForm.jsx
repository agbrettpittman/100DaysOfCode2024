import useEvent from "@utilities/hooks/useEvent";
import { TextField, Box, Button } from '@mui/material';
import { DateTimePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";

export default function EventForm({id, onSave=()=>{}, defaults = {}}){
    
    const {Event, setEvent, saveEvent, Changed} = useEvent({id, defaults, onSave})
    const navigate = useNavigate()
    const { id : routeId } = useParams()

    function modifyEvent(event) {
        setEvent(event.target.name, event.target.value)
    }

    function goToEventPage() {
        navigate(`/events/${id}`)
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
                label="Start"
                value={Event.start || moment()}
                name="start"
                onChange={(date) => setEvent('start', date)}
                inputVariant="outlined"
                fullWidth
            />
            <DateTimePicker
                label="End"
                value={Event.end || moment().add(2, 'hours')}
                name="end"
                onChange={(date) => setEvent('end', date)}
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
            {id && routeId !== id && (
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={goToEventPage}
                    fullWidth
                >
                    View Event
                </Button>
            )}
            <Button
                variant="contained"
                color="success"
                onClick={saveEvent}
                disabled={!Changed}
            >
                Save
            </Button>
        </Box>
    )

}