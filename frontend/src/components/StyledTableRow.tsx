import { Button, withStyles, TableRow, TableRowTypeMap } from "@material-ui/core"
import React, { ReactPropTypes, PropsWithChildren } from "react"

const statusToClass = (status: number) => {
    switch (status) {
        case -1:
            return 'declined'
        case 0:
            return 'pending'
        case 1:
            return 'added'
        default:
            return ''
    }
}

function StyledTableRow(props: any) {
    const { status, classes, children } = props
    return <TableRow className={classes[statusToClass(status)]}>{children}</TableRow>
}

export default withStyles({
    declined: {
        backgroundColor: 'green',
    },
    pending: {
        backgroundColor: 'yellow',
    },
    added: {
        backgroundColor: 'green',
    }
})(StyledTableRow)
