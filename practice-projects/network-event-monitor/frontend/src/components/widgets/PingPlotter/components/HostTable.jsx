import React, { useEffect, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, IconButton } from '@mui/material';
import requestor from '@utilities/requestor';
import { PingPlotterContext } from '..';
import { Delete, Edit, Close, Check } from '@mui/icons-material';
import HoldIconButton from '@components/ui/HoldIconButton';
import { useTheme } from '@mui/material';
import { transparentize } from 'polished';

export default function HostTable() {
    const [hosts, setHosts] = useState([]);
    const [editHostId, setEditHostId] = useState(null);
    const [editHostValue, setEditHostValue] = useState('');
    const { id, HostsAdded } = useContext(PingPlotterContext);
    const Theme = useTheme();
    const InitialDeleteIconColor = transparentize(0.5, Theme.palette.error.main);

    useEffect(() => {
        fetchHosts();
    }, [id, HostsAdded]);

    async function fetchHosts() {
        if (!id) return;
        requestor.get(`/widgets/ping-plotter/plotters/${id}/hosts`, {
            id: `/widgets/ping-plotter/plotters/${id}/hosts`
        }).then((response) => {
            console.log(response.data);
            setHosts(response.data);
        }).catch((error) => {
            toast.error('Failed to get ping plotter hosts');
            console.error(error);
        })
    }

    function handleDeleteHost(hostId) {
        requestor.delete(`/widgets/ping-plotter/plotters/${id}/hosts/${hostId}`)
            .then(() => {
                setHosts(hosts.filter(host => host.id !== hostId));
                toast.success('Host deleted successfully');
            })
            .catch((error) => {
                toast.error('Failed to delete host');
                console.error(error);
            });
    }

    function handleEditHost(host) {
        setEditHostId(host.id);
        setEditHostValue(host.host);
    }

    function handleCancelEdit() {
        setEditHostId(null);
        setEditHostValue('');
    }

    function handleSaveEdit(hostId) {
        requestor.put(`/widgets/ping-plotter/plotters/${id}/hosts/${hostId}`, { host: editHostValue })
            .then(() => {
                setHosts(hosts.map(host => host.id === hostId ? { ...host, host: editHostValue } : host));
                toast.success('Host updated successfully');
                setEditHostId(null);
                setEditHostValue('');
            })
            .catch((error) => {
                toast.error('Failed to update host');
                console.error(error);
            });
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableBody>
                    {hosts.map((host) => (
                        <TableRow key={host.id}>
                            <TableCell width={'1em'}>
                                {editHostId === host.id ? (
                                    <IconButton 
                                        onClick={() => handleSaveEdit(host.id)} 
                                        color='success'
                                    >
                                        <Check />
                                    </IconButton>
                                ) : (
                                    <IconButton 
                                        onClick={() => handleEditHost(host)}
                                        color='info'    
                                    >
                                        <Edit />
                                    </IconButton>
                                )}
                            </TableCell>
                            <TableCell width={'1em'}>
                                {editHostId === host.id ? (
                                    <IconButton 
                                        onClick={handleCancelEdit} 
                                        color="error"
                                    >
                                        <Close />
                                    </IconButton>
                                ) : (
                                    <HoldIconButton 
                                        color={InitialDeleteIconColor} 
                                        hoverColor={Theme.palette.error.main} 
                                        onComplete={() => handleDeleteHost(host.id)}
                                    >
                                        <Delete />
                                    </HoldIconButton>
                                )}
                            </TableCell>
                            <TableCell>
                                {editHostId === host.id ? (
                                    <TextField
                                        value={editHostValue}
                                        onChange={(e) => setEditHostValue(e.target.value)}
                                    />
                                ) : (
                                    host.host
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}