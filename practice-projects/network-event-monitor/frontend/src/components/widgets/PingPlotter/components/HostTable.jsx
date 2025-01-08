import React, { useEffect, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, IconButton, Box } from '@mui/material';
import requestor from '@utilities/requestor';
import { PingPlotterContext } from '..';
import { Delete, Edit, Close, Check } from '@mui/icons-material';
import HoldIconButton from '@components/ui/HoldIconButton';
import { useTheme } from '@mui/material';
import { transparentize } from 'polished';
import styled from 'styled-components';
import moment from 'moment';

function getStatusColor({ status, theme }) {
    let color = theme.palette.grey.A400
    if (status === 'success') color = theme.palette.success.light
    if (status === 'error') color = theme.palette.error.light
    return color
}

const StatusIndicator = styled.div`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${getStatusColor};
`;

export default function HostTable() {
    const [hosts, setHosts] = useState({});
    const [editHostId, setEditHostId] = useState(null);
    const [editHostValue, setEditHostValue] = useState('');
    const { id, HostsAdded, messages } = useContext(PingPlotterContext);
    const Theme = useTheme();
    const InitialDeleteIconColor = transparentize(0.5, Theme.palette.error.main);

    useEffect(() => {
        fetchHosts();
    }, [id, HostsAdded]);

    useEffect(() => {
        setHosts(prevValue => {
            let hostsNeedingUpdate = Object.keys(prevValue);

            for (let i = messages.length - 1; i >= 0; i--) {
                const message = messages[i];
                if (hostsNeedingUpdate.includes(message.data.host_id.toString())) {
                    const Datetime = moment(message.data.receivedTime)
                    let parsedDateTime = Datetime.format('h:mm A')
                    // if the datetime is not today, show the date
                    if (!Datetime.isSame(moment(), 'day')) {
                        parsedDateTime = Datetime.format('M/D/YY h:mm A')
                    }

                    prevValue = {
                        ...prevValue,
                        [message.data.host_id]: {
                            ...prevValue[message.data.host_id],
                            status: message.data.status,
                            latency: message.data.latency,
                            lastUpdate: parsedDateTime
                        }
                    };
                    hostsNeedingUpdate = hostsNeedingUpdate.filter(id => id !== message.data.host_id.toString());
                }
                if (hostsNeedingUpdate.length === 0) break;
            }
            return prevValue;
        });
    }, [messages]);

    async function fetchHosts() {
        if (!id) return;
        requestor.get(`/widgets/ping-plotter/plotters/${id}/hosts`, {
            id: `/widgets/ping-plotter/plotters/${id}/hosts`
        }).then((response) => {
            const hostsData = response.data.reduce((hostObject, host) => {
                hostObject[host.id] = host;
                return hostObject;
            }, {});
            setHosts(hostsData);
        }).catch((error) => {
            toast.error('Failed to get ping plotter hosts');
            console.error(error);
        })
    }

    function handleDeleteHost(hostId) {
        requestor.delete(`/widgets/ping-plotter/plotters/${id}/hosts/${hostId}`)
            .then(() => {
                setHosts(prevHosts => {
                    const newHosts = { ...prevHosts };
                    delete newHosts[hostId];
                    return newHosts;
                });
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
                setHosts(prevHosts => ({
                    ...prevHosts,
                    [hostId]: {
                        ...prevHosts[hostId],
                        host: editHostValue
                    }
                }));
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
                    {Object.values(hosts).map((host) => (
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
                            {editHostId !== host.id && (
                                <TableCell width={'auto'}>
                                    <Box display='flex' alignItems='center' widgth='8em' justifyContent={'end'} gap={1}>
                                        {host.latency}
                                        {host.lastUpdate ? ` (${host.lastUpdate})` : ''}
                                        <StatusIndicator status={host.status} />
                                    </Box>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}