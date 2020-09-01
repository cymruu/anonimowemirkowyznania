import React from "react";
import { RouteComponentProps } from "@reach/router";
import { TextField, Container, makeStyles, Button } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    form: {
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

export function Login(props: RouteComponentProps) {
    const classes = useStyles()

    return (
        <Container maxWidth="xs">
            <form noValidate autoComplete="off" className={classes.form}>
                <div>
                    <TextField label="Username" variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="login"
                    />
                </div>
                <div>
                <TextField label="Password" variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="login"
                        type="password"
                    />
                </div>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                >
                    Login
                    </Button>
            </form>
        </Container>
    )
}