import React, { useState, useEffect } from "react";
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
    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {
        async function loginUser() {
            const response = await fetch('api/login', { method: 'post', body: JSON.stringify({ login, password }) })
            const json = await response.json()
            console.log(json);
        }
        loginUser()
    }, [login, password])

    const handleSubmit = (event: any) => {
        event.preventDefault();
    }
    return (
        <Container maxWidth="xs">
            <form noValidate autoComplete="off" className={classes.form} onSubmit={handleSubmit}>
                <div>
                    <TextField label="Username" variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="login"
                        value={login}
                        onChange={e => setLogin(e.target.value)}
                    />
                </div>
                <div>
                    <TextField label="Password" variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="login"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
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