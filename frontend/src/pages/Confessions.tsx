import { Container, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { RouteComponentProps } from "@reach/router";
import React, { useEffect, useState } from "react";
import { ActionButtons } from "../components/ActionButtons";
import StyledTableRow from "../components/StyledTableRow";
import HTTPClient from "../service/HTTPClient";

export function Confessions(props: RouteComponentProps) {
    const [confessions, setConfessions] = useState([])
    const [dataLoaded, setDataLoaded] = useState(false)

    useEffect(() => {
        const getConfessions = async () => {
            return HTTPClient.get('/confessions')
        }
        getConfessions().then(async (res) => {
            const confessions = await res.json()
            setConfessions(confessions)
        }).finally(() => {
            setDataLoaded(true)
        })
    }, [])

    const addEntry = (confession: any, event: Event) => {
        event.preventDefault()
        return HTTPClient.get(`/confessions/confession/${confession._id}/accept`).then(async (res) => {
            const response = await res.json()
            const confessionsCopy: any[] = [...confessions]
            const index = confessionsCopy.findIndex((x) => x._id === confession._id)
            confessionsCopy[index] = { ...confessionsCopy[index], ...response.data.updateObject }
            setConfessions(confessionsCopy as any)
        })
    }

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
                                    <ActionButtons confession={confession} acceptFn={addEntry} />
                                </TableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
                {!dataLoaded && <LinearProgress />}
            </TableContainer>
        </Container>
    )
}