import React from 'react'
import { Box, Button, TextField } from '@mui/material';
import { IUser } from '../../../Interfaces'

interface Props {
    user: IUser | undefined,
    handleState: (event: any, type: string) => void,
    onChange: (event: any, type: string) => void,
    handleSubmit: (event: any, type: string) => void,
    type: string
}

const Modal: React.FC<Props> = ({user, handleState, onChange, handleSubmit, type}: Props) => {

    const handleClickEvent = async (event: any) => {
        handleSubmit(event, type)
        handleState(event, type)
    }
    console.log(type)
    return (
        <Box
            width={"30%"}
            maxWidth={400}
            display="inline-block"
            border="1px solid #333"
            padding="16px 32px"
            fontWeight="bold"
            position="absolute"
            top={"10%"}
            left={"30%"}
            borderRadius={'24px'}
            bgcolor="#fefbd8"
        >
            <Box textAlign="left">{type}</Box>
            <Box mt="50px">
                <TextField label="Approve" size="small" onChange={(e) => onChange(e, type)}></TextField>
            </Box>
            <Box mt="20px">Your WETH balance: {user && user.balance} WETH</Box>
            <Box
                marginTop={'20px'}
            >
                <Button variant="contained" size="small" onClick={handleClickEvent}>{type}</Button>
            </Box>
        </Box>
    )
}

export default Modal