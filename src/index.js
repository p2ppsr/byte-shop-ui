import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import BabbagePrompt from '@babbage/react-prompt'

ReactDOM.render(
  <BabbagePrompt
    customPrompt
    appName='ByteShop UI'
    author='Project Babbage'
    authorUrl='https://projectbabbage.com'
    description='Purchase your Bytes here!'
    appIcon='/favicon.ico'
    supportedMetaNet='testnet'
  >
    <App />
  </BabbagePrompt>,
  document.getElementById('root')
)
