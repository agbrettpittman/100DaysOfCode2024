import { useParams } from "react-router-dom"
import useEvent from "@utilities/hooks/useEvent";
import {TextField, Box, IconButton, useTheme, Button} from '@mui/material';
import MyNumberInput from "@components/ui/controls/MyNumberInput";
import { ArrowBack } from "@mui/icons-material";
import { transparentize } from "polished";
import { DateTimePicker } from "@mui/x-date-pickers";
import moment from "moment";

export default function EventEdit({}){
    
    const { id } = useParams()
    const {Event, setEvent, saveEvent} = useEvent(id)
    const Theme = useTheme()
    const InitialBackIconColor = transparentize(0.5, Theme.palette.primary.main)

    function modifyEvent(event) {
        setEvent(event.target.name, event.target.value)
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '60rem', width: '30vw' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                <IconButton
                    href={`/events/${id}`}
                    sx={{ color: InitialBackIconColor, "&:hover": {color: 'primary.main'}}}
                >
                    <ArrowBack />
                </IconButton>
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
                onClick={saveEvent}
                color="secondary"
            >
                Save
            </Button>
        </Box>
    )

}