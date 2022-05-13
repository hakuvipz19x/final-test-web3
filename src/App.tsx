import React, { useState, useEffect, FC } from 'react'
import { Box, Button, styled } from '@mui/material';
import './App.scss';
import { ethers } from 'ethers'
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import ERC20_MC from './ERC20_MC.json'
import ERC20_WETH from './ERC20_WETH.json'
import ERC20_DD2 from './ERC20_DD2.json'
import {
  Multicall,
  ContractCallResults,
  ContractCallContext,
} from 'ethereum-multicall';

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
const MC_CONTRACT_ADDRESS = '0x9da687e88b0A807e57f1913bCD31D56c49C872c2';
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
  totalStake: '',
  hasApproved: false
}

const App: FC = () => {
  const ethereumMulticall = require('ethereum-multicall')

  const { account, chainId, connector, activate, library, deactivate } = useWeb3React();
  const [user, setUser] = useState<IUser>(initUser)
  const [provider, setProvider] = useState<any>()
  const [signer, setSigner] = useState<any>()
  const [allContract, setAllContract] = useState<IContract>()
  // console.log(allContract)
  const connectInjectedConnector = (): void => {
    activate(injected);
    console.log(account)
    localStorage.setItem('connect', 'injected')
  }

  const connectWalletConnectConnector = (): void => {
    activate(walletConnectConnector, undefined, true).catch((e) => console.log(e))
    localStorage.setItem('connect', 'walletConnect')
  }

  const disconnectConnector = async () => {
    localStorage.clear()
    deactivate()
    setUser(initUser)
  }

  const approve = async (wethContract: any, mcContract: any, user: IUser) => {
    console.log(mcContract.address)
    const approve = await wethContract.approve(mcContract.address, ethers.utils.parseEther(user.balance))
    await approve.wait(1);

    if (account) {
      getUserInfo(account)
    }

    console.log('APPROVE SUCCESS')
  }

  const deposit = async (contract: any, amount: string) => {
    const deposit = await contract.deposit(ethers.BigNumber.from(amount).toBigInt())
      .catch((err: string) => { console.log(err) })

    if (deposit && account) {
      await deposit.wait(1)
      getUserInfo(account)
      console.log('DEPOSIT SUCCESS')
    }
  }

  const withdraw = async (contract: any, amount: string) => {
    const withdraw = await contract.withdraw(ethers.BigNumber.from(amount).toBigInt())
      .catch((err: string) => console.log(err))

    if (withdraw && account) {
      await withdraw.wait(1)
      getUserInfo(account)
      console.log('WITHDRAW SUCCESS')
    }
  }

  const harvest = async (contract: any) => {
    const harvest = await contract.withdraw('0')
      .catch((err: string) => console.log(err))

    if (harvest && account) {
      await harvest.wait(1)
      getUserInfo(account)
      console.log('HARVEST SUCCESS')
    }

  }
  
  const getProvider = async () => {
    const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL)
    setProvider(provider)

    return provider
  }

  const getSigner = () => {
    const signer = library.getSigner()

    setSigner(signer)
    return signer
  }

  const getAllContract = (signer: any) => {
    const mcContract = new ethers.Contract(MC_CONTRACT_ADDRESS, ERC20_MC, signer)
    const wethContract = new ethers.Contract(WETH_CONTRACT_ADDRESS, ERC20_WETH, signer)
    const dd2Contract = new ethers.Contract(DD2_CONTRACT_ADDRESS, ERC20_DD2, signer)

    const allContract: IContract = {
      mcContract,
      wethContract,
      dd2Contract
    }

    setAllContract(allContract)
    return allContract
  }

  const getUserInfo = async (account: string) => {
    const provider = await getProvider()
    const signer = getSigner()
    const allContract = getAllContract(signer)

    const multicall = new Multicall({ ethersProvider: provider, tryAggregate: true })
    const contractCallContext: ContractCallContext[] = [
      {
        reference: account + 'get balance',
        contractAddress: WETH_CONTRACT_ADDRESS,
        abi: ERC20_WETH,
        calls: [{ reference: 'get balance', methodName: 'balanceOf', methodParameters: [account] }]
      },
      {
        reference: account + 'get user info',
        contractAddress: MC_CONTRACT_ADDRESS,
        abi: ERC20_MC,
        calls: [{ reference: 'get user info', methodName: 'userInfo', methodParameters: [account] }]
      },
      {
        reference: account + 'get earned token',
        contractAddress: MC_CONTRACT_ADDRESS,
        abi: ERC20_MC,
        calls: [{ reference: 'get earned token', methodName: 'pendingDD2', methodParameters: [account] }]
      },
      {
        reference: account + 'get total stake',
        contractAddress: WETH_CONTRACT_ADDRESS,
        abi: ERC20_WETH,
        calls: [{ reference: 'get total stake', methodName: 'balanceOf', methodParameters: [MC_CONTRACT_ADDRESS] }]
      },
      {
        reference: account + 'get allowance',
        contractAddress: WETH_CONTRACT_ADDRESS,
        abi: ERC20_WETH,
        calls: [{ reference: 'get allowance', methodName: 'allowance', methodParameters: [account, MC_CONTRACT_ADDRESS] }]
      }
    ]

    const multicallResults: ContractCallResults = await multicall.call(contractCallContext)
    // console.log(multicallResults.results)
    const results = []

    for (let [key, value] of Object.entries(multicallResults.results)) {
      // console.log(key, value)
      const result = value.callsReturnContext[0].returnValues[0].hex

      // console.log(ethers.utils.formatEther(results[0].hex))
      results.push(ethers.utils.formatEther(result))
    }

    const [balance, stake, earned, totalStake, allowance] = results.map((value, index) => {
      console.log(value)
      return String(Math.floor(Number(value) * 1000) / 1000)
    })

    // console.log(balance, stake, earned, totalStake)

    const newUser: IUser = {
      address: account,
      balance,
      stake,
      earned,
      totalStake,
      hasApproved: Number(allowance) > 0
    }

    setUser(newUser)
  }

  useEffect(() => {
    if (account) {
      // do st
      console.log(account)
      getUserInfo(account)
    }
    else {

    }
  }, [account])

  useEffect(() => {
    const connect = localStorage.getItem("connect");
    const walletConnect = localStorage.getItem("walletconnect");
    console.log(connect);

    if (connect === 'injected') {
      connectInjectedConnector();
    }
    else if (connect === 'walletConnect' && walletConnect) {
      connectWalletConnectConnector();
    }
  }, [])

  const connectedProps = {
    user,
    allContract,
    approve,
    deposit,
    withdraw,
    harvest
  }

  return (
    <div className="App">
      {
        account ?
          <>
            {/* {account} */}
            <ConnectedComponent
              {...connectedProps}
            />
            <Box mt={10}>
              <Button variant="contained" size="large" onClick={disconnectConnector} className="btn">disconnect</Button>
            </Box>
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
