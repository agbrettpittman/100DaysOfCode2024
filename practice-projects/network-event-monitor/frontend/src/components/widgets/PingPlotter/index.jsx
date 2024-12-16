import axios from 'axios'
import {useEffect, useState} from 'react'
import { toast } from 'react-toastify'

export default function pingPlotter({widgetId}) {

    const [Data, setData] = useState({
        name: '',
    })

    useEffect(() => {
        axios.get(`/widgets/ping-plotter/plotters/${widgetId}`).then((response) => {
            setData(response.data)
        }).catch((error) => {
            toast.error('Failed to get ping plotter data')
            console.error(error)
        })
    }, [widgetId])

    return (
        <div>Ping Plotter {Data.name}</div>
    )
}