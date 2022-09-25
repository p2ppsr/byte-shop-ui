import createSignedRequest from './createSignedRequest'

/**
 * Creates an invoice for a NanoStore file hosting contract.
 *
 * @param {Object} obj All parameters are given in an object.
 * @param {Object} obj.config config object, see config section.
 * @param {Number} obj.numberOfBytes Request this number of bytes > 10.
 * @param {Boolean} obj.cool Whether you request Cool Bytes
  *
 * @returns {Promise<Object>} The invoice object, containing `message` giving details, `identityKey` receipient's private key, `amount` (satoshis), `ORDER_ID`, for referencing this contract payment and passed to the `upload` function. The object also contains `publicURL`, which is the HTTP URL where the file will become available for the duration of the contract once uploaded and the `status`.
 */
export default async ({ config, numberOfBytes, cool } = {}) => {
  // Send a request to get the invoice
  // console.log('invoice:numberOfBytes:', numberOfBytes)
  const invoice = await createSignedRequest({
    config,
    path: '/invoice',
    body: {
      numberOfBytes,
      cool
    }
  })
  // console.log('invoice:', invoice)
  if (invoice.status === 'error') {
    const e = new Error(invoice.description)
    e.code = invoice.code
    if (e.code === 'ERR_NOT_COOL_ENOUGH') {
      e.coolcertURL = invoice.coolcertURL
    }
    throw e
  }
  return invoice
}
