import { getPublicKey, createAction } from '@babbage/sdk-ts';
import { AuthriteClient } from 'authrite-js';
import bsv from 'babbage-bsv';

// Extend the Error type to include a 'code' property
interface ErrorWithCode extends Error {
  code?: string;
}

interface PayParams {
  config: {
    byteshopURL: string;
  };
  description: string;
  orderID: string;
  recipientPublicKey: string;
  amount: number;
}

interface ActionResult {
  description?: string;
  code?: string;
  status?: string;
  bytes?: string;
  note?: string;
}

/**
 * Payment for the NanoStore file hosting contract.
 *
 * @param {Object} obj All parameters are given in an object.
 * @param {Object} obj.config config object, see config section.
 * @param {String} obj.description The description to be used for the payment.
 * @param {String} obj.orderID The hosting invoice reference.
 * @param {String} obj.recipientPublicKey Public key of the host receiving the payment.
 * @param {Number} obj.amount The number of satoshis being paid.
 *
 * @returns {Promise<Object>} The pay object, contains the `bytes` and the `note`.
 */
export default async function pay({
  config,
  description,
  orderID,
  recipientPublicKey,
  amount
}: PayParams): Promise<ActionResult> {
  const derivationPrefix = require('crypto').randomBytes(10).toString('base64');
  const derivationSuffix = require('crypto').randomBytes(10).toString('base64');

  // Derive the public key used for creating the output script
  const derivedPublicKey = await getPublicKey({
    protocolID: [2, '3241645161d8'],
    keyID: `${derivationPrefix} ${derivationSuffix}`,
    counterparty: recipientPublicKey
  })

  // Create an output script that can only be unlocked with the corresponding derived private key
  const script = new bsv.Script(
    bsv.Script.fromAddress(bsv.Address.fromPublicKey(bsv.PublicKey.fromString(derivedPublicKey)))
  ).toHex();

  const payment = await createAction({
    description,
    outputs: [{
      script,
      satoshis: amount
    }]
  }) as ActionResult;

  if (payment.status === 'error') {
    const e: ErrorWithCode = new Error(payment.description);
    e.code = payment.code;
    throw e;
  }

  const client = new AuthriteClient(config.byteshopURL);
  const pay = await client.createSignedRequest('/pay', {
    orderID,
    transaction: {
      ...payment,
      outputs: [{
        vout: 0,
        satoshis: amount,
        derivationPrefix,
        derivationSuffix
      }]
    },
    description
  }) as ActionResult;

  if (pay.status === 'error') {
    const e: ErrorWithCode = new Error(pay.description);
    e.code = pay.code;
    throw e;
  }

  return pay;
}
