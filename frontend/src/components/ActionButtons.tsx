import { Button, CircularProgress, Grid } from "@material-ui/core";
import { RouteComponentProps } from "@reach/router";
import React, { Fragment, useState } from "react";
import { SuccessButton } from "./SuccessButton";

interface ActionButtonsProps {
    confession: any
    acceptFn: (confession: any, event: any) => Promise<any>
    declineFn?: () => void
}

const getRedButtonProps = (confession: any) => {
    switch (confession.status) {
        case -1:
            return {
                text: 'Undecline'
            }
        case 0:
            return {
                text: 'Decline'
            }
        case 1:
            return {
                text: 'Remove'
            }
    }
}

export function ActionButtons(props: RouteComponentProps & ActionButtonsProps) {
    const [isSending, setSending] = useState(false)

    const { acceptFn, declineFn, confession } = props

    const actionWrapper = (actionFn: (...args: any) => Promise<any>) => (confession: object, event: any) => {
        setSending(true)
        actionFn(confession, event)
            .then().finally(() => {
                setSending(false)
            })
    }

    const button = getRedButtonProps(confession)
    return (
        <Fragment>
            <Grid container direction="column">
                <SuccessButton disabled={isSending || confession.status === 1} variant="contained" onClick={e => actionWrapper(acceptFn)(confession, e)}>
                    {isSending ? <CircularProgress size={24} /> : 'Accept'}
                </SuccessButton>
                <Button disabled={isSending} variant="contained" color="secondary">
                    {isSending ? <CircularProgress size={24} /> : button?.text}
                </Button>
            </Grid>
        </Fragment>
    )
}