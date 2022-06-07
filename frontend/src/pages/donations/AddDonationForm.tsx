import { Button, FormGroup, TextField } from "@mui/material";
import { ChangeEventHandler, FormEventHandler, useContext, useState } from "react";
import { APIContext } from "../../App";

export default function AddDonationForm(): JSX.Element {
  const { httpClient } = useContext(APIContext);
  const [isSending, setIsSending] = useState<boolean>(false);
    const [inputs, setInputs] = useState({
        amount: 0,
        from: '',
        message: '',
    });

    const handleSubmit: FormEventHandler = async (event) => {
        event.preventDefault()
        setIsSending(true)

        await httpClient.post('donations', inputs)
        setIsSending(false)
    }

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        const { id, value } = event.target;

        setInputs((input) => ({ ...input, [id]: value }))
    }

    return (
        <form autoComplete="off" onSubmit={handleSubmit}>
            <FormGroup row>
                <TextField id="amount" label="Amount" type="number" value={inputs.amount} onChange={handleChange}>Amount</TextField>
                <TextField id="from" label="From" value={inputs.from} onChange={handleChange}>From</TextField>
                <TextField id="message" label="Message" value={inputs.message} onChange={handleChange}>Message</TextField>
                <Button disabled={isSending} type="submit" color="primary" variant="contained">Submit</Button>
            </FormGroup>
        </form>
    );
}
