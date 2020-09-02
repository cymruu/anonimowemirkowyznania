import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "@reach/router";
import HTTPClient from "../service/HTTPClient";
import { Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, makeStyles, Button, Container } from "@material-ui/core";

export function Confessions(props: RouteComponentProps) {
    const [confessions, setConfessions] = useState([])

    useEffect(() => {
        const getConfessions = async () => {
            const res = await HTTPClient.get('/confessions')
            const confessions = await res.json()
            setConfessions(confessions)
        }
        getConfessions()
    }, [])

    return (
        <Container>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Text</TableCell>
                            <TableCell>Embed</TableCell>
                            <TableCell>Auth</TableCell>
                            <TableCell>Entry</TableCell>
                            <TableCell>Added by</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {confessions.map((confession: any) => (
                            <TableRow key={confession._id} hover>
                                <TableCell>
                                    {confession._id}
                                </TableCell>
                                <TableCell>
                                    {confession.text}
                                </TableCell>
                                <TableCell>
                                    {confession.embed}
                                </TableCell>
                                <TableCell>
                                    {confession.auth}
                                </TableCell>
                                <TableCell>
                                    {confession.entryID}
                                </TableCell>
                                <TableCell>
                                    {confession.addedBy}
                                </TableCell>
                                <TableCell>
                                    <Button variant="contained">
                                        Accept
                                </Button>
                                <Button variant="contained" color="secondary">
                                        Decline
                                </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    )
}