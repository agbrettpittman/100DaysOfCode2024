import { Box } from '@mui/material'
import moment from 'moment'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import { useContext, useState } from 'react'
import { AppContext } from '@/App'
import { useNavigate } from 'react-router-dom'
import EventPopup from '@components/EventPopup'

const localizer = momentLocalizer(moment)

export default function LandingPage({}) {
    const { EventList, getEventList } = useContext(AppContext)
    const [SelectedDate, setSelectedDate] = useState(null)
    const navigate = useNavigate()

    const events = EventList.map((event) => {
        return {
            id: event.id,
            title: event.eventName,
            start: event.eventDatetime,
            end: event.eventDatetime
        }
    })

    function handlePopupClose() {
        setSelectedDate(null)
        getEventList()
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
                onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)}
                selectable
            />
            {SelectedDate && <EventPopup onClose={handlePopupClose} defaults={{ eventDatetime: SelectedDate }} />}
        </Box>
    )
}