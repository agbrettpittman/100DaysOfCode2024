import React, { useEffect, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from '@mui/material';
import requestor from '@utilities/requestor';
import { PingPlotterContext } from '..';

export default function HostTable() {
    const [hosts, setHosts] = useState([]);
    const { id, HostsAdded } = useContext(PingPlotterContext);

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

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Host Name</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {hosts.map((host) => (
                        <TableRow key={host.id}>
                            <TableCell>{host.host}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}