export interface IUser {
    address: string | null | undefined,
    balance: string,
    stake: string,
    earned: string,
    allStake: string
}

export interface IContract {
    contract: any,
    wethContract: any, 
    dd2Contract: any
}