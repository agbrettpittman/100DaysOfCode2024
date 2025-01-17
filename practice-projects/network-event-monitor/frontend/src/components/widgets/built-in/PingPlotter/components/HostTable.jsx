import React, { useEffect, useState, useContext, useRef } from 'react';
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
    if (status === true) color = theme.palette.success.light
    if (status === false) color = theme.palette.error.light
    return color
}

const StatusIndicator = styled.div`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${getStatusColor};
`;

export default function HostTable({displayDetails = false}) {
    const [hosts, setHosts] = useState({});
    const [editHostId, setEditHostId] = useState(null);
    const [editHostValue, setEditHostValue] = useState('');
    const [highlightedHosts, setHighlightedHosts] = useState({})
    const { id, HostsAdded, messages } = useContext(PingPlotterContext);
    const Theme = useTheme();
    const InitialDeleteIconColor = transparentize(0.5, Theme.palette.error.main);
    const RowHighlightResetTimers = useRef({});

    useEffect(() => {
        fetchHosts();
    }, [id, HostsAdded]);

    useEffect(() => {
        const message = messages[messages.length - 1];
        const data = message?.data;
        if (!data || data.type !== 'summary') return;
        setHosts(prevValue => {
            let newValue = { ...prevValue };
            const Summary = message.data.summary;
            for (let [hostId, summaryEntry] of Object.entries(Summary)) {
                const ParsedSummary = parseSummaryData(summaryEntry);
                newValue = {
                    ...newValue,
                    [hostId]: {
                        ...newValue[hostId],
                        ...ParsedSummary,
                        changed: newValue[hostId]?.lastUpdate !== ParsedSummary.lastUpdate
                    }
                };
            }
           
            return newValue;
        });
    }, [messages]);

    useEffect(() => {
        for (let hostId in hosts) {
            if (!hosts[hostId].changed) continue;
            setHighlightedHosts(prevValue => {
                const newValue = { ...prevValue, [hostId]: hosts[hostId].status };
                return newValue;
            })
            if (RowHighlightResetTimers.current[hostId]) {
                clearTimeout(RowHighlightResetTimers.current[hostId])
            }
            RowHighlightResetTimers.current[hostId] = setTimeout(() => {
                setHighlightedHosts(prevValue => {
                    const newValue = { ...prevValue };
                    delete newValue[hostId];
                    return newValue;
                })
            }, 1000)
        }
    }, [hosts]);


    async function fetchHosts() {
        if (!id) return;
        requestor.get(`/widgets/built-in/ping-plotter/plotters/${id}/hosts`, {
            id: `/widgets/built-in/ping-plotter/plotters/${id}/hosts`
        }).then((response) => {
            const hostsData = response.data.reduce((hostObject, host) => {
                const ParsedSummary = parseSummaryData(host);
                hostObject[host.id] = {
                    ...host,
                    ...ParsedSummary
                }
                return hostObject;
            }, {});
            setHosts(hostsData);
        }).catch((error) => {
            toast.error('Failed to get ping plotter hosts');
            console.error(error);
        })
    }

    function parseSummaryData(summaryData) {
        return {
            status: Boolean(summaryData.latestSuccess),
            latency: summaryData.latestLatency,
            lastUpdate: summaryData.latestSendTime,
            failures: summaryData.failures,
            successes: summaryData.successes,
            latencyAvg: summaryData.latencyAvg,
        };
    }

    function parseLatestSendTime(latestSendTime) {
        if (!latestSendTime) return '';
        try {
            const LatestSendTime = moment(latestSendTime);
            let formattedSendTime = LatestSendTime.format('h:mm A')
            if (!LatestSendTime.isSame(moment(), 'day')) {
                formattedSendTime = LatestSendTime.format('M/D/YY h:mm A')
            }
            return `(${formattedSendTime})`
        } catch (error) {
            console.error(error);
            return '';
        }
    }

    function handleDeleteHost(hostId) {
        requestor.delete(`/widgets/built-in/ping-plotter/plotters/${id}/hosts/${hostId}`)
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
        requestor.put(`/widgets/built-in/ping-plotter/plotters/${id}/hosts/${hostId}`, { host: editHostValue })
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
                console.error(error);
                try {
                    const errorResponse = error.response
                    if (errorResponse.status === 409) {
                        toast.error('Host already exists');
                        return;
                    } else {
                        throw new Error('No error matched');
                    }
                } catch (error) {
                    console.error(error);
                    toast.error('Failed to update host');
                }
            });
    }

    function getHostColumnSpan(id) {
        if (editHostId !== id) return 1;
        if (!displayDetails) return 2;
        return 5;
    }

    function getHostRowColor(id) {
        let newColor = Theme.palette.background.paper;
        if (highlightedHosts[id] === true) newColor = Theme.palette.success.light
        else if (highlightedHosts[id] === false) newColor = Theme.palette.error.light
        // reduce the opacity of the color
        return transparentize(0.9, newColor);
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                {displayDetails && (
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell>Host</TableCell>
                            <TableCell align="center">Average Latency</TableCell>
                            <TableCell align="center">Successes</TableCell>
                            <TableCell align="center">Failures</TableCell>
                            <TableCell align="right">Status</TableCell>
                        </TableRow>
                    </TableHead>
                )}
                <TableBody>
                    {Object.values(hosts).map((host) => (
                        <TableRow key={host.id} style={{ backgroundColor: getHostRowColor(host.id) }}>
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
                            <TableCell colSpan={getHostColumnSpan(host.id)}>
                                {editHostId === host.id ? (
                                    <TextField
                                        value={editHostValue}
                                        onChange={(e) => setEditHostValue(e.target.value)}
                                        fullWidth
                                    />
                                ) : (
                                    host.host
                                )}
                            </TableCell>
                            {editHostId !== host.id && (
                                <>
                                    {displayDetails && (
                                        <>
                                            <TableCell align="center">
                                                {host.latencyAvg}
                                            </TableCell>
                                            <TableCell align="center">
                                                {host.successes}
                                            </TableCell>
                                            <TableCell align="center">
                                                {host.failures}
                                            </TableCell>
                                        </>
                                    )}
                                    <TableCell width={'auto'}>
                                        <Box display='flex' alignItems='center' widgth='8em' justifyContent={'end'} gap={1}>
                                            {(host.latency) ? `${host.latency} ` : ''}
                                            {parseLatestSendTime(host.lastUpdate)}
                                            <StatusIndicator status={host.status} />
                                        </Box>
                                    </TableCell>
                                </>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}