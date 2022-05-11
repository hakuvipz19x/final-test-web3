import React, { useState, useEffect, FC } from 'react'
import { Box, Button, styled } from '@mui/material';
import './App.scss';
import { ethers } from 'ethers'
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import ERC20 from './ERC20.json'
import ERC20_WETH from './ERC20_WETH.json'
import ERC20_DD2 from './ERC20_DD2.json'

import ConnectedComponent from './Components/ConnectedComponent';
import { IUser, IContract } from './Interfaces'
const INFURA_KEY = 'bb6b6f6f39434b1da5b19f5853dfd502';
const WALLETCONNECT_BRIDGE_URL = "https://bridge.walletconnect.org";

const NETWORk_URLS = {
  1: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  4: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  5: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  42: `https://kovan.infura.io/v3/${INFURA_KEY}`
}

const injected = new InjectedConnector({
  supportedChainIds: [1, 4, 5, 42]
})

const walletConnectConnector = new WalletConnectConnector({
  supportedChainIds: [1, 4, 5, 42],
  rpc: NETWORk_URLS,
  bridge: WALLETCONNECT_BRIDGE_URL,
  qrcode: true
})

const PROVIDER_URL = 'https://rinkeby.infura.io/v3/bb6b6f6f39434b1da5b19f5853dfd502';
const MY_ADDRESS = '0x3BF27CAf1ef5A5Bcfd6C6909bd4F2a85AB8491Ae';
const CONTRACT_ADDRESS = '0x9da687e88b0A807e57f1913bCD31D56c49C872c2';
const WETH_CONTRACT_ADDRESS = '0xc778417e063141139fce010982780140aa0cd5ab';
const DD2_CONTRACT_ADDRESS = '0xb1745657CB84c370DD0Db200a626d06b28cc5872';

// const DarkButton = styled(Button) ({
//   backgroundColor: 
// })
const initUser: IUser = {
  address: '',
  balance: '',
  stake: '',
  earned: '',
  allStake: ''
}

const App: FC = () => {
  const { account, chainId, connector, activate, library } = useWeb3React();

  const [user, setUser] = useState<IUser>(initUser)
  const [provider, setProvider] = useState<any>()
  const [allContract, setAllContract] = useState<IContract>()
  console.log(allContract)
  const connectInjectedConnector = (): void => {
    activate(injected);
  }

  const connectWalletConnectConnector = (): void => {
    activate(walletConnectConnector, undefined, true).catch((e) => console.log(e))
  }

  const getBalance = async (wethContract: any, account: string | null | undefined) => {
    // console.log(wethContract)
    const hexBalance = await wethContract.balanceOf(account)
    const balance = ethers.utils.formatEther(hexBalance)

    const formatBalance = Math.round(Number(balance) * 100) / 100
    return String(formatBalance)
  }

  const getInfo = async (contract: any, account: string | null | undefined) => {
    const stakeInfo = await contract.userInfo(account)

    const stake = ethers.utils.formatEther(stakeInfo[0])
    const earned = ethers.utils.formatEther(stakeInfo[1])

    const formatStake = String(Math.round(Number(stake) * 100) / 100)
    const formatEarned = String(Math.round(Number(earned) * 100) / 100)

    return {formatStake, formatEarned}
  }

  const getAllStake = async (wethContract: any, contract: any) => {
    const hexAllStake = await wethContract.balanceOf(contract.address)
    const allStake = ethers.utils.formatEther(hexAllStake)

    const formatAllStake = Math.round(Number(allStake) * 100) / 100
    return String(formatAllStake)
  }

  const approve = async (wethContract: any, contract: any, amount: string) => {
    let check: boolean = true;
    
    const approve = await wethContract.approve(contract.address, ethers.utils.parseEther(amount))
      .catch((err: string) => {console.log(err); check = false;})
    // approve.wait()
    await getUserInfo(account, provider, allContract)
    console.log('APPROVE SUCCESS')
    return check;
  }

  const deposit = async (contract: any, amount: string) => {
    const deposit = await contract.deposit(amount)
      .catch((err: string) => {console.log(err)})
    // deposit.wait()

    getUserInfo(account, provider, allContract)
    console.log('DEPOSIT SUCCESS')
  }

  const withdraw = async (contract: any, amount: string) => {
    await contract.withdraw(amount)
      .then(() => {
        if (account && allContract) {
          getUserInfo(account, provider, allContract)
          console.log('WITHDRAW SUCCESS')
        }
      })
      .catch((err: string) => console.log(err))
  }

  const harvest = async (contract: any) => {
    await contract.withdraw('0')
      .catch((err: string) => console.log(err))
      .then(async () => {
        if (account && allContract) {
          await getUserInfo(account, provider, allContract)
          console.log('HARVEST SUCCESS')
        }
      })
  }

  const getUserInfo = async (account: string | null | undefined | null | undefined, provider: any, allContract: IContract | undefined) => {
    console.log(allContract)
    const result = await Promise.all([
      await getBalance(allContract?.wethContract, account),
      await getInfo(allContract?.contract, account),
      await getAllStake(allContract?.wethContract, allContract?.contract)
    ])
    const balance = result[0]
    
    const {formatStake, formatEarned} = result[1]

    const allStake = result[2]

    setUser({
      address: account,
      balance, 
      stake: formatStake,
      earned: formatEarned,
      allStake
    })
    
  }


  useEffect(() => {
    if (account) {
      const provider = new ethers.providers.JsonRpcProvider('https://rinkeby.infura.io/v3/bb6b6f6f39434b1da5b19f5853dfd502');

      const signer = library.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ERC20, signer)

      const wethContract = new ethers.Contract(WETH_CONTRACT_ADDRESS, ERC20_WETH, signer)

      const dd2Contract = new ethers.Contract(DD2_CONTRACT_ADDRESS, ERC20_WETH, signer)

      const allContract: IContract = {
        contract: contract,
        wethContract: wethContract,
        dd2Contract: dd2Contract
      }

      getUserInfo(account, provider, allContract)
      setProvider(provider)
      setAllContract(allContract)
    }
  }, [account])

  const ConnectedProps = {
    user: user,
    allContract: allContract,
    approve: approve,
    deposit: deposit,
    withdraw: withdraw,
    harvest: harvest
  }

  return (
    <div className="App">
      {
        account ?
          <>
            <ConnectedComponent
              {...ConnectedProps}
            />
          </>
          :
          <Box className="app-connect"
            display="inline-flex"
            flexDirection="column"
          >
            <Box mt={10}>
              <Button variant="contained" size="large" onClick={connectInjectedConnector} className="btn btn-injected">Connect Metamask</Button>
            </Box>
            <Box mt={10}>
              <Button variant="contained" size="large" onClick={connectWalletConnectConnector} className="btn">Connect walletconnect</Button>
            </Box>
          </Box>
      }
    </div>
  );
}

export default App;
