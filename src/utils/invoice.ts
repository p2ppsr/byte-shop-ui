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
 * @param {Object} obj.config config object, see config section.
 * @param {Number} obj.numberOfBytes Request this number of bytes > 10.
 * @param {Boolean} obj.cool Whether you request Cool Bytes
 *
 * @returns {Promise<InvoiceResult>} The invoice object, containing `message` giving details, `identityKey` receipient's private key, `amount` (satoshis), `ORDER_ID`, for referencing this contract payment and passed to the `upload` function. The object also contains `publicURL`, which is the HTTP URL where the file will become available for the duration of the contract once uploaded and the `status`.
 */
export default async ({ config, numberOfBytes, cool }: { config: Config, numberOfBytes: number, cool: boolean }): Promise<InvoiceResult> => {
  // Send a request to get the invoice
  const client = new AuthriteClient(config.byteshopURL)
  const invoice = await client.createSignedRequest('/invoice', { numberOfBytes, cool })

  // Ensure the invoice object matches the InvoiceResult interface
  if (invoice.status === 'error') {
    const e = new Error(invoice.description) as any
    e.code = invoice.code
    if (e.code === 'ERR_NOT_COOL_ENOUGH') {
      e.coolcertURL = invoice.coolcertURL
    }
    throw e
  }

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
