import React, { useState } from 'react'
import {
  TextField,
  Button,
  Typography,
  Checkbox,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@material-ui/core'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import style from './style'
import { makeStyles } from '@material-ui/core/styles'
import { invoice, pay } from './utils'
import Buy from '@material-ui/icons/GetApp'

const isStaging = window.location.host.indexOf('staging') !== -1

const useStyles = makeStyles(style, {
  name: 'ByteShop'
})
export default () => {
  const classes = useStyles()
  const [serverURL, setServerURL] = useState(
    window.location.host.startsWith('localhost')
      ? 'http://localhost:3002'
      : isStaging
        ? 'https://staging-byte-shop.babbage.systems'
        : 'https://byte-shop.babbage.systems'
  )
  const [numberOfBytes, setNumberOfBytes] = useState(14)
  const [cool, setCool] = useState(false)
  const [coolcertURL, setCoolcertURL] = useState(
    'https://coolcert-ui.babbage.systems'
  )
  const [coolcertModalOpen, setCoolcertModalOpen] = useState(false)
  const [results, setResults] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleBuy = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!numberOfBytes) {
        const e = new Error('Specify the number of bytes > 10!')
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
        orderID: invoiceResult.orderID,
        recipientPublicKey: invoiceResult.identityKey,
        amount: invoiceResult.amount
      })
      setResults({
        bytes: payResult.bytes,
        note: payResult.note
      })
    } catch (e) {
      if (e.code === 'ERR_NOT_COOL_ENOUGH') {
        setCoolcertURL(e.coolcertURL)
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

  return (
    <div className={classes.content_wrap}>
      <ToastContainer />
      <Typography align='center' variant='h4' paragraph>
        The Byte Shop
      </Typography>
      <form onSubmit={handleBuy}>
        <br />
        <br />
        <Typography variant='h5'>Server URL</Typography>
        <Typography paragraph>
          Enter the URL of the Byteshop server to interact with
        </Typography>
        <TextField
          fullWidth
          variant='outlined'
          label='Server URL'
          value={serverURL}
          onChange={e => setServerURL(e.target.value)}
        />
        <br />
        <br />
        <br />
        <Typography paragraph>
          Number of bytes (10 or more)
        </Typography>
        <TextField
          fullWidth
          variant='outlined'
          label='Number of bytes'
          value={numberOfBytes}
          onChange={e => setNumberOfBytes(e.target.value)}
        />
        <Typography paragraph>
          <Checkbox
            value={cool}
            onChange={() => setCool(c => !c)}
          /> Request Cool Bytes
        </Typography>
        <center className={classes.broadcast_wrap}>
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
            <div>
              <Typography variant='h4'>Success!</Typography>
              <Typography><b>Your bytes:</b>{' '}{results.bytes}</Typography>
              <Typography><b>Note:</b>{' '}{results.note}</Typography>
            </div>
          )}
        </center>
      </form>
      <br />
      <Typography align='center'>
        View the <a href='https://github.com/p2ppsr/byte-shop-ui'>GitHub Repo</a> for this site
      </Typography>
      <br />
      <Typography align='center'>
        Made with <a href='https://projectbabbage.com'>www.ProjectBabbage.com</a> tools :)
      </Typography>
      {/* Dialog for dealing with CoolCert */}
      <Dialog
        open={coolcertModalOpen}
        onClose={() => setCoolcertModalOpen(false)}
      >
        <DialogTitle>
          Cool Person Certificate Required
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Before buying Cool Bytes, you need a Cool Person Certificate from the CoolCert CA. Please visit the following URL to obtain one:
          </DialogContentText>
          <DialogContentText>
            <a href={coolcertURL} target='_blank' rel='noopener noreferrer'>{coolcertURL}</a>
          </DialogContentText>
          <DialogContentText>
            When you are finished, return to this page and try again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCoolcertModalOpen(false)}
          >
            Close & Try Again
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
