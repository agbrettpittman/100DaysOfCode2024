import {useEffect, useState} from 'react'
import { toast } from 'react-toastify';

async function loadWidgetComponent(widgetName){
    try {
        const module = await import(`/src/components/widgets/${widgetName}`);
        return module.default;
    } catch (error) {
        console.error(`Failed to load widget: ${widgetName}`, error);
        toast.error(`Failed to load widget: ${widgetName}`);
        return null;
    }
};

export default function EventWidgets({widgets = []}) {

    const [loadedWidgets, setLoadedWidgets] = useState({});

    useEffect(() => {
        loadWidgets();
    }, [widgets])

    async function loadWidgets() {
        const componentPromises = widgets.map(async (widget) => {
            const Component = await loadWidgetComponent(widget.widgetName);
            return { id: widget.id, Component, widgetId: widget.widget_id };
        });

        const components = await Promise.all(componentPromises);
        setLoadedWidgets(
            components.reduce((acc, { id, Component, widgetId }) => {
                acc[id] = { Component, widgetId };
                return acc;
            }, {})
        );
    }



    return (
        <div>
            {widgets.map((widget) => {
                const loadedWidget = loadedWidgets[widget.id];
                if (!loadedWidget || !loadedWidget.Component) {
                    return <p key={widget.id}>Loading {widget.widgetName}...</p>;
                }

                const { Component, widgetId } = loadedWidget;
                return <Component key={widget.id} widgetId={widgetId} />;
            })}
        </div>
    )
}