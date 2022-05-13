import { FC, useEffect, useState } from 'react'
import { IUser, IContract } from '../../Interfaces'
import { Box, Button, TextField } from '@mui/material';
import { ethers } from 'ethers'
import Modal from './Modal'
import './ConnectedComponent.scss'
interface Props {
    user: IUser,
    allContract: IContract | undefined
    approve: (wethContract: any, mcContract: any, user: IUser) => void,
    deposit: (mcContract: any, input: string) => void,
    withdraw: (mcContract: any, input: string) => void
    harvest: (mcContract: any) => void
}

const ConnectedComponent: FC<Props> = ({ user, allContract, approve, deposit, withdraw, harvest}: Props) => {
    // console.log(user)
    const [depositInput, setDepositInput] = useState('')
    const [withdrawInput, setWithdrawInput] = useState('')
    const [depositState, setDepositState] = useState(false)
    const [withdrawState, setWithdrawState] = useState(false)
    const [hasApproved, setHasApproved] = useState(false)
    // console.log(user)
    // console.log(hasApproved)

    useEffect(() => {
        if (user.hasApproved) setHasApproved(true)
    }, [user])
    
    const handleState = (event: any, type: string): void => {
        switch (type) {
            case 'deposit': {
                setDepositState(prevState => !prevState)
                break;
            }
            case 'withdraw': {
                setWithdrawState(prevState => !prevState)
                break;
            }
        }
    }

    const handleSubmit = async (event: any, type: string) => {
        try {
            switch (type) {
                case 'approve': {
                    await approve(allContract?.wethContract, allContract?.mcContract, user)
                    // console.log(await getAllowance(allContract?.wethContract, allContract?.mcContract, user))
                    break;
                }
                case 'deposit': {
                    deposit(allContract?.mcContract, depositInput)
                    break;
                }
                case 'withdraw': {
                    withdraw(allContract?.mcContract, withdrawInput)
                    break;
                }
                case 'harvest': {
                    harvest(allContract?.mcContract)
                    break;
                }
                default: throw new Error('Unknown type')
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    const onChange = (event: any, type: string) => {
        switch (type) {
            case 'deposit': {
                setDepositInput(event.target.value)
                break;
            }
            case 'withdraw': {
                setWithdrawInput(event.target.value)
                break;
            }
            default: throw new Error('Unknown type')
        }
    }

    const DepositProps = {
        user,
        handleState,
        handleSubmit,
        onChange,
        type: 'deposit'
    }

    const WithdrawProps = {
        user,
        handleState,
        handleSubmit,
        onChange,
        type: 'withdraw'
    }

    return (
        <Box
            width={"70%"}
            maxWidth={600}
            display="inline-block"
            marginLeft="auto"
            border="1px solid #333"
            padding="16px 32px"
            fontWeight="bold"
        >
            <Box
                display="flex"
                justifyContent="space-between"
            >
                <Box
                    textOverflow="ellipsis"
                    overflow="hidden"
                    width="150px"
                    whiteSpace="nowrap"
                >
                    Wallet adress: {user && user.address}
                </Box>
                <div className="user-balance">Balance: {user && user.balance} WETH</div>
            </Box>
            <Box
                display="flex"
                justifyContent="space-between"
                marginTop={4}
            >
                <Box>
                    Token earned: {user && user.earned} DD2
                </Box>
                <Box
                    marginRight={3}
                >
                    <Button variant="contained" size="small" onClick={(e) => handleSubmit(e, 'harvest')}>Harvest</Button>
                </Box>
            </Box>

            {/* <label htmlFor="checkbox-test">check 1</label> */}
            {
                hasApproved ?
                    <Box
                        margin='30px auto'
                        display="flex"
                        justifyContent='center'
                    >
                        <Box margin="0 10px" width={'40%'}>
                            <Button variant="contained" style={{ width: "100%" }} onClick={(e) => handleState(e, 'deposit')}>
                                deposit
                            </Button>
                        </Box>
                        <Box width={'40%'}>
                            <Button variant="contained" style={{ width: "100%" }} onClick={(e) => handleState(e, 'withdraw')}>
                                withdraw
                            </Button>
                        </Box>
                    </Box>
                    :
                    <Box width='50%'
                        margin='30px auto'
                    >
                        <Button variant="contained" style={{ width: "100%" }} onClick={(e) => handleSubmit(e, 'approve')}>
                            Approve
                        </Button>
                    </Box>
            }
            <Box
                textAlign="left"
            >
                Your stake: {user && user.stake} WETH
            </Box>
            <Box
                textAlign="left"
                marginTop={5}
                marginBottom={3}
            >
                All stake: {user && user.totalStake} WETH
            </Box>
            {/* {approveState && <Modal {...ApproveProps} />} */}
            {depositState && <Modal {...DepositProps} />}
            {withdrawState && <Modal {...WithdrawProps} />}
        </Box>
        // <div className="user">
        //     <div className="user-info">
        //         <div className="user-address">wallet adress: {user && user.address}</div>
        //         <div className="user-balance">balance: {user && user.balance}</div>
        //         <div className="user-stake">your stake: {user && user.stake}</div>
        //         <div className="user-earned">Token earned: {user && user.earned}</div>
        //         <div className="user-all-stake">All stake: {user && user.allStake}</div>
        //     </div>
        //     <div className="user-action">
        //         <div className="user-approve">
        //             <input type="text" className="approve-input" name="approve" onChange={(e) => onChange(e, 'approve')} value={approveInput} />
        //             <button className="approve-button" onClick={(e) => handleSubmit(e, 'approve')}>approve</button>
        //         </div>
        //         <div className="user-deposit">
        //             <input type="text" className="deposit-input" name="deposit" onChange={(e) => onChange(e, 'deposit')} value={depositInput} />
        //             <button className="deposit-button" onClick={(e) => handleSubmit(e, 'deposit')}>deposit</button>
        //         </div>
        //         <div className="user-withdraw">
        //             <input type="text" className="withdraw-input" name="withdraw" onChange={(e) => onChange(e, 'withdraw')} value={withdrawInput} />
        //             <button className="withdraw-button" onClick={(e) => handleSubmit(e, 'withdraw')}>withdraw</button>
        //         </div>
        //         <div className="user-harvest">
        //             <button className="harvest-button" onClick={(e) => handleSubmit(e, 'harvest')}>harvest</button>
        //         </div>
        //     </div>
        // </div >
        // <button onClick={getUserInfo}>Get user info</button>
    )
}

export default ConnectedComponent