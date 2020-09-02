import { withStyles, TableRow, Theme, fade } from "@material-ui/core"
import React from "react"

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

const tableBgOpacity = 0.3

export default withStyles((theme: Theme) => ({
    declined: {
        backgroundColor: fade(theme.palette.error.light, tableBgOpacity),
    },
    pending: {
        backgroundColor: fade(theme.palette.warning.light, tableBgOpacity),
    },
    added: {
        backgroundColor: fade(theme.palette.success.light, tableBgOpacity),
    },
}))(StyledTableRow)
