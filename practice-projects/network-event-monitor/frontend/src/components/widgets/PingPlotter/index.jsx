import requestor from '@utilities/requestor'
import {useEffect, useState} from 'react'
import { toast } from 'react-toastify'

export const Title = 'Ping Plotter'

export async function Create(){
    const PostData = {
        name: 'New Ping Plotter',
    }
    const URL = '/widgets/ping-plotter/plotters'
    try {
        const response = await requestor.post(URL, PostData)
        return response.data.id
    } catch (error) {
        toast.error('Failed to create new ping plotter')
        console.error(error)
        return null
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