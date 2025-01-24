import { useContext, useEffect, useState } from 'react'
import { Box, IconButton, TextField, Typography, useTheme } from '@mui/material'
import { Check, Close, Delete, Edit, ChevronRight, ChevronLeft } from '@mui/icons-material'
import HoldIconButton from '@components/ui/HoldIconButton'
import { transparentize } from 'polished'
import { PingPlotterContext } from '..'
import requestor from '@utilities/requestor'
import { toast } from 'react-toastify'

export default function TitleBar({ name = "", handleDelete = () => {}, onSave = () => {}}) {
    
    const [Editing, setEditing] = useState(false)
    const [NewName, setNewName] = useState(name)
    const { Expanded, setExpanded, RouterRoot } = useContext(PingPlotterContext)
    const Theme = useTheme()
    const InitialDeleteIconColor = transparentize(0.5, Theme.palette.error.main)

    useEffect(() => {
        discardChanges()
    }, [name])

    function discardChanges() {
        setEditing(false)
        setNewName(name)
    }

    async function saveEdit() {
        try {
            await requestor.put(RouterRoot, { name: NewName })
            await requestor.storage.remove(RouterRoot)
            onSave()
            setEditing(false)
        } catch (error) {
            toast.error('Failed to save changes')
            console.error(error)
        }
    }

    return (
        <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'auto auto 1fr auto', alignItems: 'center' }}>

            {Editing ?
                <>
                    <IconButton onClick={discardChanges} color="error">
                        <Close />
                    </IconButton>
                    <HoldIconButton
                        onComplete={saveEdit}
                        color={Theme.palette.success.main}
                        hoverColor={Theme.palette.success.dark}
                    >
                        <Check />
                    </HoldIconButton>
                    <TextField
                        value={NewName}
                        onChange={(e) => setNewName(e.target.value)}
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
                    <Typography variant="h5">{name}</Typography>
                </>
            }
            <IconButton
                onClick={() => setExpanded(!Expanded)}
                color="secondary"
            >
                {Expanded ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
        </Box>
    )
}