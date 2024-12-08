import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "@/App";
import { toast } from "react-toastify";
import moment from "moment";

export default function useEvent(id) {

    const [Event, updateState] = useState({
        id: null,
        eventDatetime: moment(),
        eventName: '',
        description: '',
        referenceID: ''
    })
    const { id: routeId } = useParams()
    const navigate = useNavigate()
    const { getEventList } = useContext(AppContext)

    useEffect(() => {
        axios.get(`/events/${id}`).then((response) => {
            let newState = {...response.data}
            newState.eventDatetime = moment(newState.eventDatetime)
            updateState(newState)
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to get event')
        })
    }, [id])

    function setEvent(key, value) {
        updateState((prevState) => {
            return {
                ...prevState,
                [key]: value
            }
        })
    }

    function saveEvent() {
        // replace the event datetime with a sql formatted string
        const PostData = {
            ...Event,
            eventDatetime: Event.eventDatetime.format('YYYY-MM-DD HH:mm:ss')
        }
        axios.put(`/events/${id}`, PostData).then(() => {
            getEventList()
            toast.success('Event changes saved')
        }).catch((error) => {
            console.error(error)
            toast.error('Failed to save event changes')
        })
    }

    function deleteEvent() {
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