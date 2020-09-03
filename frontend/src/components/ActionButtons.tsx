import { Button, CircularProgress } from "@material-ui/core";
import { RouteComponentProps } from "@reach/router";
import React, { Fragment, useState } from "react";
import { SuccessButton } from "./SuccessButton";

interface ActionButtonsProps {
    confession: object
    acceptFn: (confession: object, event: any) => Promise<any>
    declineFn?: () => void
}

export function ActionButtons(props: RouteComponentProps & ActionButtonsProps) {
    const [isSending, setSending] = useState(false)

    const { acceptFn, declineFn, confession } = props

    const acceptWrapper = (confession: object, event: any) => {
        setSending(true)
        acceptFn(confession, event)
            .then().finally(() => {
                setSending(false)
            })
    }

    return (
        <Fragment>
            <SuccessButton disabled={isSending} variant="contained" onClick={e => acceptWrapper(confession, (e as any))}>
                {isSending ? <CircularProgress size={24} /> : 'Accept'}
            </SuccessButton>
            <Button disabled={isSending} variant="contained" color="secondary">
                Decline
            </Button>
        </Fragment>
    )
}