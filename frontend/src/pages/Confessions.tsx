import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "@reach/router";
import HTTPClient from "../service/HTTPClient";
import { Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Button, Container } from "@material-ui/core";
import { SuccessButton } from "../components/SuccessButton";
import StyledTableRow from "../components/StyledTableRow";

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
                            <StyledTableRow key={confession._id} status={confession.status} hover>
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
                                    <SuccessButton variant="contained">
                                        Accept
                                </SuccessButton>
                                    <Button variant="contained" color="secondary">
                                        Decline
                                </Button>
                                </TableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    )
}