import {useEffect, useRef, useState, createContext} from 'react'
import { toast } from 'react-toastify';
import { Autocomplete, Box, Button, TextField } from '@mui/material';
import { useParams } from 'react-router-dom';
import requestor from '@utilities/requestor';
import styled from 'styled-components';
import { ErrorBoundary } from 'react-error-boundary';
import WidgetError from './ui/WidgetError';

const WidgetModules = import.meta.glob('/src/components/widgets/*/*/index.jsx');

const WidgetGrid = styled(Box)`
    display: grid;
    gap: 16px;
    margin-top: 16px;
    grid-template-columns: repeat(auto-fill, 500px);

    & > * {
        border: 1px solid;
        border-color: rgba(0, 0, 0, 0.12);
        border-radius: 4px;
        padding: 8px;
        max-height: 500px;
    }
`;

export default function EventWidgets({canEdit}) {

    const [widgets, setWidgets] = useState([]);
    const [AvailableWidgets, setAvailableWidgets] = useState({});
    const [NewWidgetSelection, setNewWidgetSelection] = useState(null);
    const [SocketUpdates, setSocketUpdates] = useState([]);
    const WidgetModulesLoaded = useRef(false);
    const WebsocketConnection = useRef(null);
    const { id } = useParams();
    const DropdownOptions = Object.keys(AvailableWidgets)
    .filter((widgetName) => AvailableWidgets[widgetName].Create)
    .map((widgetName) => ({
        label: AvailableWidgets[widgetName].Title,
        value: widgetName,
    }));

    useEffect(() => {
        initialLoad();
    }, [])

    useEffect(() => {
        
        setupWebsocket();
        return () => {
            if (WebsocketConnection.current) {
                closeCurrentWebsocket();
            }
        }
    }, [id])

    function closeCurrentWebsocket() {
        if (WebsocketConnection.current) {
            console.log('Closing websocket connection')
            WebsocketConnection.current.onerror = null;
            WebsocketConnection.current.close();
            WebsocketConnection.current = null;
        }
    }

    async function setupWebsocket() {
        if (WebsocketConnection.current) {
            closeCurrentWebsocket();
        }
        if (!id) return;
        // Create socket connection
        const SocketBase = import.meta.env.VITE_APP_SOCKET_BASE
        const socket = new WebSocket(`${SocketBase}/events/ws/${id}`)

        socket.onmessage = (event) => {
            const ParsedResponseData = JSON.parse(event.data)
            
            setSocketUpdates((prev) => [...prev, ParsedResponseData])
        }

        socket.onerror = (event) => {
            toast.error('Failed to connect to event websocket')
            console.error(event)
        }

        socket.onclose = (event) => {
            console.log(event)
        }

        WebsocketConnection.current = socket;
    }


    async function initialLoad(){
        if (WidgetModulesLoaded.current) return
        await loadWidgetModules();
        await loadEventWidgets();
    }

    async function loadEventWidgets() {
        requestor.get(`/events/${id}/widgets`,{ 
            id: `/events/${id}/widgets`
        }).then((response) => {
            setWidgets(response.data);
        }).catch((error) => {
            toast.error('Failed to get widgets for event')
            console.error(error)
        })
    }
    
    async function loadWidgetModules() {
        let tempWidgets = {};
        for (const [path, loader] of Object.entries(WidgetModules)) {
            try {
                const module = await loader(); // Load the module
                
                // Use the folder name as the widget key (assumes standard folder structure)
                const widgetName = path.split('/').slice(-2, -1)[0];
                
                // Add the widget data to the widgets object
                tempWidgets[widgetName] = {
                    Title: module.Title || widgetName,
                    Create: module.Create || undefined,
                    Component: module.default, // The main component
                };
                
                
            } catch (error) {
                console.error(`Failed to load widget module from ${path}:`, error);
            }
        }
        
        setAvailableWidgets(tempWidgets);
        
    }
    
    async function createNewWidget() {
        if (!NewWidgetSelection) return
        const widgetName = NewWidgetSelection.value;
        const widgetModule = AvailableWidgets[widgetName];
        if (widgetModule.Create) {
            const WidgetID = await widgetModule.Create();
            if (!WidgetID) {
                toast.error('Failed to add widget to event')
                console.log(WidgetID)
                return
            }
            const PostData = {
                widget_id: WidgetID,
                widgetName: widgetName,
            }
            requestor.post(`/events/${id}/widgets`, PostData).then(async () => {
                toast.success(`Added ${widgetModule.Title} to event`)
                // invalidate the cache
                await requestor.storage.remove(`/events/${id}/widgets`)
                
                loadEventWidgets();
            }).catch((error) => {
                toast.error('Failed to add widget to event')
                console.error(error)
            })
                
        }
    }

    async function deleteWidget(widgetMappingId) {
        const DeleteURL = `/events/${id}/widgets/${widgetMappingId}`
        requestor.delete(DeleteURL).then(async () => {
            toast.success('Deleted widget')
            // invalidate the cache
            await requestor.storage.remove(`/events/${id}/widgets`)
            loadEventWidgets();
        }).catch((error) => {
            toast.error('Failed to delete widget')
            console.error(error)
        })
    }

    return (
        <div>
            {canEdit && (
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 8 }}>
                    <Autocomplete
                        disablePortal
                        options={DropdownOptions}
                        sx={{ width: 300 }}
                        value={NewWidgetSelection}
                        onChange={(event, newValue) => {
                            setNewWidgetSelection(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} label="Widgets" />}
                    />
                    <Button
                    variant="contained"
                    onClick={createNewWidget}
                    sx={{ width: 'fit-content' }}
                    >
                        Add Widget
                    </Button>
                </Box>
            )}
            <WidgetGrid>
                {widgets.map((widget) => {
                    const { widget_id, widgetName } = widget;
                    const loadedWidget = AvailableWidgets[widgetName];
                    if (!loadedWidget || !loadedWidget.Component) {
                        return <p key={widget.id}>Loading {widgetName}...</p>;
                    }   
                    
                    const { Component } = loadedWidget;
                    const messages = SocketUpdates.filter(
                        (update) => update.mapping_id === widget.id
                    );
                    return (
                        <ErrorBoundary 
                            key={widget.id} 
                            FallbackComponent={
                                (error) => (
                                    <WidgetError 
                                        error={error} name={widgetName} id={widget_id}
                                    />
                                )
                            }
                        >
                            <Component
                                widgetId={widget_id} messages={messages} 
                                handleDelete={() => deleteWidget(widget.id)}
                            />
                        </ErrorBoundary>
                    );
                })}
            </WidgetGrid>
        </div>
    )
}