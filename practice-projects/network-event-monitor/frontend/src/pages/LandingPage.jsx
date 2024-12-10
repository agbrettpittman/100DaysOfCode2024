import { Box } from '@mui/material'
import moment from 'moment'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import { useContext, useState } from 'react'
import { AppContext } from '@/App'
import { useNavigate } from 'react-router-dom'
import NewEvent from '@components/NewEvent'

const localizer = momentLocalizer(moment)

export default function LandingPage({}) {
    const { EventList } = useContext(AppContext)
    const [DisplayEventForm, setDisplayEventForm] = useState(false)
    const navigate = useNavigate()

    const events = EventList.map((event) => {
        return {
            id: event.id,
            title: event.eventName,
            start: event.eventDatetime,
            end: event.eventDatetime
        }
    })

    function handleSelectSlot(slotInfo) {
        console.log(slotInfo)
    }

    return (
        <Box>
            <Calendar
                localizer={localizer}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                events={events}
                onSelectEvent={(event) => navigate(`/events/${event.id}`)}
                onSelectSlot={() => setDisplayEventForm(true)}
                selectable
            />
            {DisplayEventForm && <NewEvent onClose={() => setDisplayEventForm(false)}/>}
        </Box>
    )
}