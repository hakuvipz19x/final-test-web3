export interface IUser {
    address: string | null | undefined,
    balance: string,
    stake: string,
    earned: string,
    totalStake: string,
    hasApproved: boolean
}

export interface IContract {
    mcContract: any,
    wethContract: any, 
    dd2Contract: any
}