import { Box, Divider, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { APIContext } from "../../App";


export default function DonationsTab() {
    const { httpClient } = useContext(APIContext);
    const [donations, setDonations] = useState<any[]>([]);

    useEffect(() => {
        loadDonations()
    }, [httpClient])

    const loadDonations = () => httpClient.swallow(httpClient.get('/donations'))
        .then((response) => {
            setDonations(response.donations)
        });

    return (
        <Box>
            {donations.map((donation, i) => (
                <Box key={i}>
                    <Typography><b>id:</b> {donation._id}</Typography>
                    <Typography><b>amount:</b> {donation.amount} </Typography>
                    <Typography><b>entryID:</b> {donation.entryID} </Typography>
                    <Typography><b>username:</b> {donation.from} </Typography>
                    <Typography><b>message:</b> {donation.message} </Typography>
                    <Typography><b>createdAt:</b> {donation.createdAt} </Typography>
                    <Divider />
                </Box>
            ))
            }
        </Box>
    )
}
