import { Box, Divider, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { APIContext } from "../../App";


export default function IntentTab() {
    const { httpClient } = useContext(APIContext);
    const [intents, setIntents] = useState<any[]>([]);

    useEffect(() => {
        loadIntents()
    }, [httpClient])

    const loadIntents = () => httpClient.swallow(httpClient.get('/intents'))
        .then((response) => {
            setIntents(response.intents)
        });

    return (
        <Box>
            {intents.map((intent, i) => (
                <Box key={i}>
                <Typography><b>id:</b> {intent._id}</Typography>
                <Typography><b>amount:</b> {intent.amount} </Typography>
                <Typography><b>username:</b> {intent.form} </Typography>
                <Typography><b>message:</b> {intent.message} </Typography>
                <Typography><b>createdAt:</b> {intent.createdAt} </Typography>
                <Divider />
            </Box>
            ))
            }
        </Box>
    )
}
