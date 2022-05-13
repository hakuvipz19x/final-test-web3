import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import reportWebVitals from './reportWebVitals';
import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

function getLibrary(provider, connector) {
  const library = new Web3Provider(provider)
  return library
}

const Web3ReactProviderNetwork = createWeb3ReactRoot('NETWORK')

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  // </React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ReactProviderNetwork getLibrary={getLibrary}>
        <App />
      </Web3ReactProviderNetwork>
    </Web3ReactProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
