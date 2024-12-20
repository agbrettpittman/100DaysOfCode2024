import requestor from '@utilities/requestor'
import {useEffect, useState, useContext} from 'react'
import { toast } from 'react-toastify'
import { WidgetsContext } from '@components/EventWidgets'
import { Delete } from '@mui/icons-material'
import { Box, useTheme } from '@mui/material'
import HoldIconButton from '@components/ui/HoldIconButton'
import { transparentize } from 'polished'

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

    const { deleteWidget } = useContext(WidgetsContext)
    const [Data, setData] = useState({
        name: '',
    })
    const Theme = useTheme()
    const InitialDeleteIconColor = transparentize(0.5, Theme.palette.error.main)

    useEffect(() => {
        requestor.get(`/widgets/ping-plotter/plotters/${widgetId}`).then((response) => {
            setData(response.data)
        }).catch((error) => {
            toast.error('Failed to get ping plotter data')
            console.error(error)
        })
    }, [widgetId])

    async function handleDelete() {
        try {
            await requestor.delete(`/widgets/ping-plotter/plotters/${widgetId}`)
            deleteWidget(widgetId)
        } catch (error) {
            toast.error('Failed to delete ping plotter')
            console.error(error)
        }
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
            <HoldIconButton 
                color={InitialDeleteIconColor} 
                hoverColor={Theme.palette.error.main} 
                onComplete={handleDelete}
            >
                <Delete />
            </HoldIconButton>
            Ping Plotter: {Data.name}
        </Box>
        
    )
}