import {useEffect, useRef, useState, createContext} from 'react'
import { toast } from 'react-toastify';
import { Autocomplete, Box, Button, TextField } from '@mui/material';
import { useParams } from 'react-router-dom';
import requestor from '@utilities/requestor';

const WidgetModules = import.meta.glob('/src/components/widgets/*/index.jsx');

export const WidgetsContext = createContext({});

export default function EventWidgets() {

    const [widgets, setWidgets] = useState([]);
    const [AvailableWidgets, setAvailableWidgets] = useState({});
    const [NewWidgetSelection, setNewWidgetSelection] = useState(null);
    const WidgetModulesLoaded = useRef(false);
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

    async function initialLoad(){
        if (WidgetModulesLoaded.current) return
        await loadWidgetModules();
        await loadEventWidgets();
    }

    async function loadEventWidgets() {
        requestor.get(`/events/${id}/widgets`,{ 
            id: `/events/${id}/widgets`
        }).then((response) => {
            console.log(response.data)
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

    async function deleteWidget(widgetId) {
        requestor.delete(`/events/${id}/widgets/${widgetId}`).then(async () => {
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
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
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
            <WidgetsContext.Provider value={{ deleteWidget }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    {widgets.map((widget) => {
                        const { widget_id, widgetName } = widget;
                        const loadedWidget = AvailableWidgets[widgetName];
                        if (!loadedWidget || !loadedWidget.Component) {
                            return <p key={widget.id}>Loading {widgetName}...</p>;
                        }   
                        
                        const { Component } = loadedWidget;
                        return <Component key={widget.id} widgetId={widget_id} />;
                    })}
                </Box>
            </WidgetsContext.Provider>
        </div>
    )
}