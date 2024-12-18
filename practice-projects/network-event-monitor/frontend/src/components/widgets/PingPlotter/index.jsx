import requestor from '@utilities/requestor'
import {useEffect, useState} from 'react'
import { toast } from 'react-toastify'

export const Title = 'Ping Plotter'

export async function Create(){
    return {
        name: Title,
        widgetName: 'PingPlotter',
    }
}


export default function PingPlotter({widgetId}) {

    const [Data, setData] = useState({
        name: '',
    })

    useEffect(() => {
        requestor.get(`/widgets/ping-plotter/plotters/${widgetId}`).then((response) => {
            setData(response.data)
        }).catch((error) => {
            toast.error('Failed to get ping plotter data')
            console.error(error)
        })
    }, [widgetId])

    return (
        <div>Ping Plotter: {Data.name}</div>
    )
}