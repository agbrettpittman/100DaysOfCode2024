import requestor from '@utilities/requestor'
import { useEffect, useState, createContext, useMemo } from 'react'
import { toast } from 'react-toastify'
import { Box } from '@mui/material'
import AddHost from './components/AddHost'
import HostTable from './components/HostTable'
import TitleBar from './components/TitleBar'

export const Title = 'Ping Plotter'

export async function Create(){
    const PostData = {
        name: 'New Ping Plotter',
    }
    const URL = '/widgets/built-in/ping-plotter/plotters'
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
    RouterRoot: "",
    HostsAdded: [],
    setHostsAdded: () => {},
    messages: [],
    Expanded: false,
    setExpanded: () => {},
})

export default function PingPlotter({widgetId = null, messages = [], handleDelete = () => {}}) {
    
    const [Name, setName] = useState("")
    const [HostsAdded, setHostsAdded] = useState([])
    const [Expanded, setExpanded] = useState(false)    
    const RouterRoot = `/widgets/built-in/ping-plotter/plotters/${widgetId}`
    const ColumnSpan = Expanded ? 'span 2' : 'span 1'
    const memoizedMessages = useMemo(() => messages, [JSON.stringify(messages)])

    useEffect(() => {
        getData()
    }, [widgetId])

    useEffect(() => {
        const message = messages[messages.length - 1];
        const data = message?.data;
        if (!data || data.type !== 'plotter change') return;
        if (data.name) setName(data.name)
    }, [memoizedMessages])
    
    async function getData() {
        if (!widgetId) return
        try {
            const url = RouterRoot
            const response = await requestor.get(url, {
                id: url
            })
            setName(response.data?.name)
        } catch (error) {
            toast.error('Failed to get ping plotter data')
            console.error(error)
        }
    }

    async function deleteSelf() {
        try {
            await requestor.delete(RouterRoot)
            handleDelete()
        } catch (error) {
            toast.error('Failed to delete ping plotter')
            console.error(error)
        }
    }

    const PingPlotterContextValue = {
        id: widgetId,
        RouterRoot,
        HostsAdded,
        setHostsAdded,
        messages: memoizedMessages,
        Expanded,
        setExpanded,
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, gridColumn: ColumnSpan }}>
            <PingPlotterContext.Provider value={PingPlotterContextValue}>
                <TitleBar name={Name} handleDelete={deleteSelf} onSave={getData} />
                <AddHost />
                <HostTable />
            </PingPlotterContext.Provider>
        </Box>
    )
}