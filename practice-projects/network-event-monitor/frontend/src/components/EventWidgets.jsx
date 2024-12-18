import {useEffect, useState} from 'react'
import { toast } from 'react-toastify';
import { Autocomplete, Box, Button, TextField } from '@mui/material';


const WidgetModules = import.meta.glob('/src/components/widgets/*/index.jsx');


export default function EventWidgets({widgets = []}) {

    const [AvailableWidgets, setAvailableWidgets] = useState({});
    const [NewWidgetSelection, setNewWidgetSelection] = useState(null);
    const DropdownOptions = Object.keys(AvailableWidgets)
    .filter((widgetName) => AvailableWidgets[widgetName].Create)
    .map((widgetName) => ({
        label: AvailableWidgets[widgetName].Title,
        value: widgetName,
    }));

    useEffect(() => {
        loadAllWidgets();
    }, [widgets])

    async function loadAllWidgets() {
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
        console.log(NewWidgetSelection)
        if (!NewWidgetSelection) return
        const widgetName = NewWidgetSelection.value;
        const widgetModule = AvailableWidgets[widgetName];
        if (widgetModule.Create) {
            await widgetModule.Create();
        }
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
        </div>
    )
}