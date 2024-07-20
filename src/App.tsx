import React, { useState } from 'react'
import {
  Select,
  MenuItem,
  Button,
  Typography,
  Checkbox,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  TextField,
  Container,
  Box,
  Paper
} from '@mui/material'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Buy from '@mui/icons-material/GetApp'
import { SERVER_URL_OPTIONS, COOLCERT_URL } from './utils/constants'
import { invoice, pay } from './utils'

interface Results {
  bytes: string
  note: string
}

const isStaging = window.location.host.indexOf('staging') !== -1

const ByteShop: React.FC = () => {
  // State variables
  const [serverURL, setServerURL] = useState(
    window.location.host.startsWith('localhost')
      ? 'http://localhost:3002'
      : isStaging
      ? 'https://staging-byte-shop.babbage.systems'
      : 'https://byte-shop.babbage.systems'
  )
  const [numberOfBytes, setNumberOfBytes] = useState(14)
  const [cool, setCool] = useState(false)
  const [coolcertURL, setCoolcertURL] = useState(COOLCERT_URL)
  const [coolcertModalOpen, setCoolcertModalOpen] = useState(false)
  const [results, setResults] = useState<Results | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Handle the form submission
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

  // Get the label for the selected server URL
  const getSelectedLabel = (value: string) => {
    const selectedOption = SERVER_URL_OPTIONS.find(option => option.value === value)
    return selectedOption ? `${selectedOption.label} (${selectedOption.value})` : value
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} style={{ padding: '2rem', marginTop: '2rem' }}>
        <ToastContainer />
        <Typography align='center' variant='h4' paragraph>
          The Byte Shop
        </Typography>
        <form onSubmit={handleBuy}>
          <Box mb={3}>
            <Typography variant='h5'>Server URL</Typography>
            <Typography paragraph>
              Enter the URL of the Byteshop server to interact with
            </Typography>
            <FormControl fullWidth variant='outlined'>
              <InputLabel id='server-url-label'>Server URL</InputLabel>
              <Select
                labelId='server-url-label'
                value={serverURL}
                onChange={(e: { target: { value: string } }) => setServerURL(e.target.value as string)}
                label='Server URL'
                renderValue={(value: string) => getSelectedLabel(value)}
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
            <Typography paragraph>Number of bytes (10 or more)</Typography>
            <TextField
              fullWidth
              variant='outlined'
              label='Number of bytes'
              value={numberOfBytes}
              onChange={(e: { target: { value: any } }) => setNumberOfBytes(Number(e.target.value))}
            />
          </Box>
          <Box mb={3}>
            <Typography paragraph>
              <Checkbox value={cool} onChange={() => setCool((c) => !c)} /> Request
              Cool Bytes
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
                <Typography variant='h4'>Success!</Typography>
                <Typography>
                  <b>Your bytes:</b> {results.bytes}
                </Typography>
                <Typography>
                  <b>Note:</b> {results.note}
                </Typography>
              </Box>
            )}
          </center>
        </form>
      </Paper>
      <Box mt={3} textAlign="center">
        <Typography>
          View the <a href='https://github.com/p2ppsr/byte-shop-ui'>GitHub Repo</a> for this site
        </Typography>
        <Typography>
          Made with <a href='https://projectbabbage.com'>www.ProjectBabbage.com</a> tools :)
        </Typography>
      </Box>
      <Dialog
        open={coolcertModalOpen}
        onClose={() => setCoolcertModalOpen(false)}
      >
        <DialogTitle>Cool Person Certificate Required</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Before buying Cool Bytes, you need a Cool Person Certificate from
            the CoolCert CA. Please visit the following URL to obtain one:
          </DialogContentText>
          <DialogContentText>
            <a href={coolcertURL} target='_blank' rel='noopener noreferrer'>
              {coolcertURL}
            </a>
          </DialogContentText>
          <DialogContentText>
            When you are finished, return to this page and try again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCoolcertModalOpen(false)}>
            Close & Try Again
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ByteShop
