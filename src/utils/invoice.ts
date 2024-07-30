import { AuthriteClient } from 'authrite-js'

interface InvoiceResult {
  message: string
  identityKey: string
  amount: number
  orderID: string
  publicURL: string
  status: string
  code?: string
  description?: string
  coolcertURL?: string
}

interface Config {
  byteshopURL: string
}

/**
 * Creates an invoice for a NanoStore file hosting contract.
 *
 * @param {Object} obj All parameters are given in an object.
 * @param {Object} obj.config Config object containing the byteshop URL.
 * @param {Number} obj.numberOfBytes The number of bytes requested (> 10).
 * @param {Boolean} obj.cool Indicates whether Cool Bytes are requested.
 *
 * @returns {Promise<InvoiceResult>} The invoice object, containing details such as `message`, `identityKey`, `amount`, `orderID`, `publicURL`, `status`, and optionally `code`, `description`, and `coolcertURL`.
 */
export default async function createInvoice({
  config,
  numberOfBytes,
  cool
}: {
  config: Config
  numberOfBytes: number
  cool: boolean
}): Promise<InvoiceResult> {
  // Create a new Authrite client with the provided byteshop URL
  const client = new AuthriteClient(config.byteshopURL)
  
  // Send a request to the /invoice endpoint to create an invoice
  const invoice = await client.createSignedRequest('/invoice', { numberOfBytes, cool })

  // Handle error responses by throwing an appropriate error
  if (invoice.status === 'error') {
    const e = new Error(invoice.description) as any
    e.code = invoice.code
    if (e.code === 'ERR_NOT_COOL_ENOUGH') {
      e.coolcertURL = invoice.coolcertURL
    }
    throw e
  }

  // Return the invoice details
  return {
    message: invoice.message,
    identityKey: invoice.identityKey,
    amount: invoice.amount,
    orderID: invoice.orderID,
    publicURL: invoice.publicURL,
    status: invoice.status,
    code: invoice.code,
    description: invoice.description,
    coolcertURL: invoice.coolcertURL
  }
}
