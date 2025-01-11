import React, { useState, useContext } from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/Button';
import { toast } from 'react-toastify';
import requestor from '@utilities/requestor';
import { PingPlotterContext } from '..';
import { Box } from '@mui/material';
import { Add } from '@mui/icons-material';

function AddHost(){
    const [host, setHost] = useState('');
    const { id, setHostsAdded } = useContext(PingPlotterContext);

    async function handleAddHost() {
        requestor.post(`/widgets/ping-plotter/plotters/${id}/hosts`, { host })
        .then(async response => {
            console.log('Host added:', response.data);
            toast.success('Host added successfully');
            await requestor.storage.remove(`/widgets/ping-plotter/plotters/${id}/hosts`)
            setHostsAdded(hostsAdded => [...hostsAdded, response.data]);
        })
        .catch(error => {
            console.error('Error adding host:', error);
            toast.error('Error adding host');
        });
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
                label="Hostname or IP Address"
                variant="outlined"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                size="small"
            />
            <IconButton 
                color="primary" 
                onClick={handleAddHost}
            >
                <Add />
            </IconButton>
        </Box>
    );
};

export default AddHost;