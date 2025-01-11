import requestor from '@utilities/requestor'
import {useEffect, useState, useContext, createContext} from 'react'
import { toast } from 'react-toastify'
import { WidgetsContext } from '@components/EventWidgets'
import { Delete, ChevronRight, ChevronLeft } from '@mui/icons-material'
import { Box, IconButton, Typography, useTheme } from '@mui/material'
import HoldIconButton from '@components/ui/HoldIconButton'
import { transparentize } from 'polished'
import AddHost from './components/AddHost'
import HostTable from './components/HostTable'

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

export const PingPlotterContext = createContext({
    id: null,
    HostsAdded: [],
    setHostsAdded: () => {},
})

export default function PingPlotter({widgetId = null, messages = []}) {

    const { deleteWidget } = useContext(WidgetsContext)
    const [Data, setData] = useState({
        name: '',
    })
    const [HostsAdded, setHostsAdded] = useState([])
    const [DisplayDetails, setDisplayDetails] = useState(false)
    const Theme = useTheme()
    const InitialDeleteIconColor = transparentize(0.5, Theme.palette.error.main)
    const RouterRoot = "/widgets/ping-plotter/plotters"
    const ColumnSpan = DisplayDetails ? 'span 2' : 'span 1'

    useEffect(() => {
        if (!widgetId) return
        requestor.get(`${RouterRoot}/${widgetId}`).then((response) => {
            setData(response.data)
        }).catch((error) => {
            toast.error('Failed to get ping plotter data')
            console.error(error)
        })
    }, [widgetId])

    async function handleDelete() {
        try {
            await requestor.delete(`${RouterRoot}/${widgetId}`)
            deleteWidget(widgetId)
        } catch (error) {
            toast.error('Failed to delete ping plotter')
            console.error(error)
        }
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, gridColumn: ColumnSpan }}>
            <PingPlotterContext.Provider value={{id: widgetId, HostsAdded, setHostsAdded, messages}}>
                <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'auto 1fr auto', alignItems: 'center' }}>
                    <HoldIconButton 
                        color={InitialDeleteIconColor} 
                        hoverColor={Theme.palette.error.main} 
                        onComplete={handleDelete}
                    >
                        <Delete />
                    </HoldIconButton>
                    <Typography variant="h5">
                        {Data.name}
                    </Typography>
                    <IconButton 
                        onClick={() => setDisplayDetails(!DisplayDetails)}
                        color="secondary"

                    >
                        {DisplayDetails ? <ChevronLeft /> : <ChevronRight />}
                    </IconButton>
                </Box>
                <AddHost />
                <HostTable displayDetails={DisplayDetails}/>
            </PingPlotterContext.Provider>
        </Box>
    )
}