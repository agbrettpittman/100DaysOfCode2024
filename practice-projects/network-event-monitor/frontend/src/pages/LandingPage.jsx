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
    const [SelectedEvent, setSelectedEvent] = useState(null)
    const navigate = useNavigate()

    const events = EventList.map((event) => {
        return {
            id: event.id,
            title: event.eventName,
            start: event.start,
            end: event.end
        }
    })

    function handlePopupClose() {
        setSelectedDate(null)
        setSelectedEvent(null)
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
                onSelectEvent={(event) => setSelectedEvent(event)}
                onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)}
                selectable
            />
            {(SelectedDate || SelectedEvent) ? ( 
                <EventPopup 
                    onClose={handlePopupClose} 
                    defaults={(SelectedEvent) ? SelectedEvent : {eventDatetime: SelectedDate}}
                    id={(SelectedEvent) ? SelectedEvent.id : null}
                />
            ) : null}
        </Box>
    )
}