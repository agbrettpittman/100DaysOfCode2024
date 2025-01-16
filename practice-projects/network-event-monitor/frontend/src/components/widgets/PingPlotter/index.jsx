import requestor from '@utilities/requestor'
import {useEffect, useState, useContext, createContext, useMemo, memo} from 'react'
import { toast } from 'react-toastify'
import { WidgetsContext } from '@components/EventWidgets'
import { Edit, Delete, ChevronRight, ChevronLeft, Check, Close } from '@mui/icons-material'
import { Box, IconButton, Typography, useTheme, TextField } from '@mui/material'
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
    messages: [],
})

export default function PingPlotter({widgetId = null, messages = []}) {

    const { deleteWidget } = useContext(WidgetsContext)
    const [Data, setData] = useState({
        name: '',
    })
    const [HostsAdded, setHostsAdded] = useState([])
    const [DisplayDetails, setDisplayDetails] = useState(false)
    const [Editing, setEditing] = useState(false)
    const [EditingName, setEditingName] = useState("")
    const Theme = useTheme()
    const InitialDeleteIconColor = transparentize(0.5, Theme.palette.error.main)
    const RouterRoot = "/widgets/ping-plotter/plotters"
    const ColumnSpan = DisplayDetails ? 'span 2' : 'span 1'
    const memoizedMessages = useMemo(() => messages, [JSON.stringify(messages)])

    useEffect(() => {
        getData()
        setEditing(false)
        setEditingName("")
    }, [widgetId])

    useEffect(() => {
        const message = messages[messages.length - 1];
        const data = message?.data;
        if (!data || data.type !== 'plotter change') return;
        if (data.name) {
            setData((prevData) => {
                return {
                    ...prevData,
                    name: data.name,
                }
            })
        }
    }, [memoizedMessages])
    
    async function getData() {
        if (!widgetId) return
        try {
            const url = `${RouterRoot}/${widgetId}`
            const response = await requestor.get(url, {
                id: url
            })
            setData(response.data)
            setEditingName(response.data.name)
        } catch (error) {
            toast.error('Failed to get ping plotter data')
            console.error(error)
        }
    }

    async function handleDelete() {
        try {
            await requestor.delete(`${RouterRoot}/${widgetId}`)
            deleteWidget(widgetId)
        } catch (error) {
            toast.error('Failed to delete ping plotter')
            console.error(error)
        }
    }

    function cancelEdit() {
        setEditing(false)
        setEditingName("")
    }

    

    async function saveEdit() {
        try {
            await requestor.put(`${RouterRoot}/${widgetId}`, { name: EditingName })
            await requestor.storage.remove(`${RouterRoot}/${widgetId}`)
            await getData()
            setEditing(false)
        } catch( error) {
            toast.error('Failed to save changes')
            console.error(error)
        }
    }

    const PingPlotterContextValue = {
        id: widgetId,
        HostsAdded,
        setHostsAdded,
        messages: memoizedMessages,
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, gridColumn: ColumnSpan }}>
            <PingPlotterContext.Provider value={PingPlotterContextValue}>
                <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'auto auto 1fr auto', alignItems: 'center' }}>
                    
                    {Editing ?
                        <>
                            <IconButton onClick={cancelEdit} color="error">
                                <Close />
                            </IconButton>
                            <HoldIconButton 
                                onClick={saveEdit} 
                                color={Theme.palette.success.main}
                                hoverColor={Theme.palette.success.dark}
                            >
                                <Check />
                            </HoldIconButton>
                            <TextField 
                                value={EditingName}
                                onChange={(e) => setEditingName(e.target.value)}
                            />
                        </>
                    :
                        <>
                            <HoldIconButton 
                                color={InitialDeleteIconColor} 
                                hoverColor={Theme.palette.error.main} 
                                onComplete={handleDelete}
                            >
                                <Delete />
                            </HoldIconButton>
                            <IconButton color="primary" onClick={() => setEditing(!Editing)}>
                                <Edit />
                            </IconButton>
                            <Typography variant="h5">
                                {Data.name}
                            </Typography>
                        </>
                    }
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