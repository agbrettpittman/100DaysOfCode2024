import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "@/App";
import { toast } from "react-toastify";
import moment from "moment";

const initialEvent = {
    id: null,
    eventName: '',
    description: '',
    referenceID: ''
}

function getDefaultEvent(defaults){
    const { eventDatetime: defaultEventDateTime, ...otherDefaults } = defaults
    return {
        ...initialEvent,
        ...otherDefaults,
        eventDatetime: defaultEventDateTime ? moment(defaultEventDateTime) : moment()
    }
}

export default function useEvent(id = null, defaults = {}) {

    const [Event, updateState] = useState(getDefaultEvent(defaults))
    const { id: routeId } = useParams()
    const navigate = useNavigate()
    const { getEventList } = useContext(AppContext)

    useEffect(() => {
        if (!id) {
            updateState(getDefaultEvent(defaults))
            return
        }
        axios.get(`/events/${id}`).then((response) => {
            let newState = {...response.data}
            newState.eventDatetime = moment(newState.eventDatetime)
            updateState(newState)
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to get event')
        })
    }, [id, defaults])

    function setEvent(key, value) {
        updateState((prevState) => {
            return {
                ...prevState,
                [key]: value
            }
        })
    }

    function saveEvent() {
        /*
            * Build the request configuration object so that it is a
            * PUT request if the event has an ID, otherwise it is a POST request
            * to create a new event. Also, format the eventDatetime to be in the
            * correct format for the DB.
         */
        const RequestConfig = {
            method: id ? 'put' : 'post',
            url: id ? `/events/${id}` : '/events',
            data: {
                ...Event,
                eventDatetime: Event.eventDatetime.format('YYYY-MM-DD HH:mm:ss')
            }
        }
        axios.request(RequestConfig).then(() => {
            getEventList()
            toast.success('Event changes saved')
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to save event changes')
        })
    }

    function deleteEvent() {
        // If there is no ID, there is no event to delete
        if (!id) {
            toast.error('No event to delete')
            return
        }
        axios.delete(`/events/${id}`).then(() => {
            getEventList()
            if (Number(routeId) === Number(id)) {
                navigate('/')
            }
            toast.success('Event deleted')
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to delete event')
        })
    }

    return { Event, setEvent, deleteEvent, saveEvent }

}