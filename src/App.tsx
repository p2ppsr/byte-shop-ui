import React, { useState } from 'react'
import {
  Select,
  MenuItem,
  Button,
  Typography,
  Checkbox,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
  FormControl,
  InputLabel,
  TextField,
  Container,
  Box
} from '@mui/material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useAsyncEffect from 'use-async-effect'
import Buy from '@mui/icons-material/GetApp'
import checkForMetaNetClient from './utils/checkForMetaNetClient'
import NoMncModal from './components/NoMNCModal/NoMNCModal'
import { SERVER_URL_OPTIONS, COOLCERT_URL } from './utils/constants'
import { invoice, pay } from './utils'
import './App.scss'
import { getNetwork } from '@babbage/sdk-ts'

// Define the NetworkInfo type
type NetworkInfo = 'mainnet' | 'testnet' | 'regtest'

interface Results {
  bytes: string
  note: string
}

const ByteShop: React.FC = () => {
  const [serverURL, setServerURL] = useState(
    window.location.host.startsWith('localhost')
      ? 'http://localhost:3002'
      : 'https://byte-shop.babbage.systems'
  )
  const [numberOfBytes, setNumberOfBytes] = useState(14)
  const [cool, setCool] = useState(false)
  const [coolcertURL, setCoolcertURL] = useState(COOLCERT_URL)
  const [coolcertModalOpen, setCoolcertModalOpen] = useState(false)
  const [results, setResults] = useState<Results | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isMncMissing, setIsMncMissing] = useState<boolean>(false)

  // Run a 1s interval for checking if MNC is running and update the server URL
  useAsyncEffect(async () => {
    const intervalId = setInterval(async () => {
      const hasMNC = await checkForMetaNetClient()
      if (!hasMNC) {
        setIsMncMissing(true) // Open modal if MNC is not found
      } else {
        setIsMncMissing(false) // Ensure modal is closed if MNC is found
        try {
          const networkInfo = await getNetwork()
          const networkName = networkInfo.toString()

          setServerURL(
            networkName === 'testnet'
              ? 'https://staging-byte-shop.babbage.systems'
              : 'https://byte-shop.babbage.systems'
          )
        } catch (error) {
          console.error('Error fetching network info:', error)
        }
      }
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!numberOfBytes) {
        const e = new Error('Specify the number of bytes > 10!') as any
        e.code = 'ERR_MISSING_NUMBER_OF_BYTES'
        throw e
      }
      const invoiceResult = await invoice({
        numberOfBytes,
        cool,
        config: {
          byteshopURL: serverURL
        }
      })
      const payResult = await pay({
        config: {
          byteshopURL: serverURL
        },
        description: 'Buy with Byteshop UI',
        orderID: invoiceResult.orderID || '',
        recipientPublicKey: invoiceResult.identityKey || '',
        amount: invoiceResult.amount || 0
      })
      setResults({
        bytes: payResult.bytes || '',
        note: payResult.note || ''
      })
    } catch (e: any) {
      if (e.code === 'ERR_NOT_COOL_ENOUGH') {
        setCoolcertURL(e.coolcertURL || COOLCERT_URL)
        setCoolcertModalOpen(true)
      } else {
        console.error(e)
        if (e.response && e.response.data && e.response.data.description) {
          toast.error(e.response.data.description)
        } else {
          toast.error(e.message)
        }
      }
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const getSelectedLabel = (value: string) => {
    const selectedOption = SERVER_URL_OPTIONS.find(option => option.value === value)
    return selectedOption ? `${selectedOption.label} (${selectedOption.value})` : value
  }

  return (
    <Container maxWidth="md" className="container">
      <NoMncModal open={isMncMissing} onClose={() => setIsMncMissing(false)} />
        <ToastContainer />
        <Typography align='center' variant='h4' paragraph className="typography">
          The Byte Shop
        </Typography>
        <form onSubmit={handleBuy}>
          <Box mb={3}>
            <Typography variant='h5' className="typography">Server URL</Typography>
            <Typography paragraph className="typography">
              Select your Byteshop server to interact with
            </Typography>
            <FormControl fullWidth variant='outlined'>
              <InputLabel id='server-url-label' className="typography">Server URL</InputLabel>
              <Select
                labelId='server-url-label'
                value={serverURL}
                onChange={(e: { target: { value: string } }) => setServerURL(e.target.value as string)}
                label='Server URL'
                renderValue={(value: string) => getSelectedLabel(value)}
                disabled // Disable the select component
              >
                {SERVER_URL_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label} ({option.value})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box mb={3}>
            <Typography paragraph className="typography">Number of bytes (10 or more)</Typography>
            <TextField
              fullWidth
              variant='outlined'
              label='Number of bytes'
              value={numberOfBytes}
              onChange={(e: { target: { value: any } }) => setNumberOfBytes(Number(e.target.value))}
              InputLabelProps={{ className: 'typography' }}
            />
          </Box>
          <Box mb={3}>
            <Typography paragraph className="typography">
              <Checkbox value={cool} onChange={() => setCool((c) => !c)} /> Request Cool Bytes
            </Typography>
          </Box>
          <center>
            <Button
              variant='contained'
              color='primary'
              size='large'
              type='submit'
              disabled={loading}
              startIcon={<Buy />}
              className="button"
            >
              Buy
            </Button>
            <br />
            <br />
            {loading && (
              <LinearProgress
                variant={uploadProgress === 0 ? 'indeterminate' : 'determinate'}
                value={uploadProgress === 0 ? undefined : uploadProgress}
              />
            )}
            {results && (
              <Box mt={3}>
                <Typography variant='h4' className="typography">Success!</Typography>
                <Typography className="typography">
                  <b>Your bytes:</b> {results.bytes}
                </Typography>
                <Typography className="typography">
                  <b>Note:</b> {results.note}
                </Typography>
              </Box>
            )}
          </center>
        </form>
      <Box mt={3} textAlign="center">
        <Typography className="typography">
          View the <a href='https://github.com/p2ppsr/byte-shop-ui'>GitHub Repo</a> for this site
        </Typography>
        <Typography className="typography">
          Made with <a href='https://projectbabbage.com'>www.ProjectBabbage.com</a> tools :)
        </Typography>
      </Box>
      <Dialog
        open={coolcertModalOpen}
        className="dialog"
      >
        <DialogTitle className="dialog">Cool Person Certificate Required</DialogTitle>
        <DialogContent className="dialog">
          <DialogContentText className="dialog">
            Before buying Cool Bytes, you need a Cool Person Certificate from the CoolCert CA. Please visit the following URL to obtain one:
          </DialogContentText>
          <DialogContentText className="dialog">
            <a href={coolcertURL} target='_blank' rel='noopener noreferrer' className="typography">
              {coolcertURL}
            </a>
          </DialogContentText>
          <DialogContentText className="dialog">
            When you are finished, return to this page and try again.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="dialog">
          <Button onClick={() => setCoolcertModalOpen(false)} className="button">
            Close & Try Again
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ByteShop
