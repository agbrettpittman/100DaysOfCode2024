import { Box } from '@mui/material'
import moment from 'moment'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import React from 'react'
import { useContext } from 'react'
import { AppContext } from '@/App'
import { useNavigate } from 'react-router-dom'

const localizer = momentLocalizer(moment)

export default function LandingPage({}) {
    const { EventList } = useContext(AppContext)
    const navigate = useNavigate()

    const events = EventList.map((event) => {
        return {
            id: event.id,
            title: event.eventName,
            start: event.eventDatetime,
            end: event.eventDatetime
        }
    })

    return (
        <Box>
            <Calendar
                localizer={localizer}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                events={events}
                onSelectEvent={(event) => navigate(`/events/${event.id}`)}
            /> 
        </Box>
    )
}