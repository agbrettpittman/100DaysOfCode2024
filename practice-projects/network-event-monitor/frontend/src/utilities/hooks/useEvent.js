import { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "@/App";
import requestor from "@utilities/requestor";
import { toast } from "react-toastify";
import moment from "moment";

const initialEvent = {
    id: null,
    eventName: '',
    description: '',
    referenceID: '',
    widgets: [],
}

function getDefaultEvent(defaults){
    const { 
        start: defaultStart, 
        end: defaultEnd,
        ...otherDefaults
    } = defaults
    return {
        ...initialEvent,
        ...otherDefaults,
        start: defaultStart ? moment(defaultStart) : moment(),
        end: defaultEnd ? moment(defaultEnd) : moment().add(2, 'hours')
    }
}

export default function useEvent({id = null, defaults = {}, onSave=()=>{}}) {

    const [Event, updateState] = useState(getDefaultEvent(defaults))
    const [DBEvent, setDBEvent] = useState(null)
    const { id: routeId } = useParams()
    const navigate = useNavigate()
    const { getEventList } = useContext(AppContext)
    const memoizedDefaults = useMemo(() => defaults, [JSON.stringify(defaults)])

    useEffect(() => {
        getEvent()
    }, [id, memoizedDefaults])

    function getEvent() {
        if (!id) {
            console.log(memoizedDefaults)
            updateState(getDefaultEvent(memoizedDefaults))
            setDBEvent(null)
            return
        }
        requestor.get(`/events/${id}`, {
            id: `/events/${id}`
        }).then((response) => {
            let newState = { ...response.data }
            newState.start = moment(newState.start)
            newState.end = moment(newState.end)
            updateState(newState)
            setDBEvent(newState)
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to get event')
        })
    }

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
                start: Event.start.format('YYYY-MM-DD HH:mm:ss'),
                end: Event.end.format('YYYY-MM-DD HH:mm:ss')
            }
        }
        requestor.request(RequestConfig).then(async () => {
            await requestor.storage.remove(`/events/${id}`)
            await requestor.storage.remove('/events')
            getEventList()
            onSave()
            toast.success('Event changes saved')
        }).catch((error) => {
            console.error(error)
            toast.error(error?.response?.data?.detail || 'Failed to save event')
        })
    }

    function deleteEvent() {
        // If there is no ID, there is no event to delete
        if (!id) {
            toast.error('No event to delete')
            return
        }
        requestor.delete(`/events/${id}`).then(() => {
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

    return { 
        Event, 
        getEvent, 
        setEvent, 
        deleteEvent, 
        saveEvent, 
        Changed: JSON.stringify(Event) !== JSON.stringify(DBEvent) }

}