import { derivePublicKey, createAction } from '@babbage/sdk-ts'
import { AuthriteClient, CreateSignedRequestResult } from 'authrite-js'
import bsv from 'babbage-bsv'

// Custom error class
class CustomError extends Error {
	code: string

	constructor(message: string, code: string) {
		super(message)
		this.code = code
	}
}

// Interfaces for types
interface PayParams {
	config: {
		byteshopURL: string
	}
	description: string
	orderID: string
	recipientPublicKey: string
	amount: number
}

interface PayResult {
	status: string
	description: string
	code?: string
	bytes?: string
	note?: string
}

export default async function pay({
	config,
	description,
	orderID,
	recipientPublicKey,
	amount
}: PayParams): Promise<PayResult> {
	const derivationPrefix = require('crypto').randomBytes(10).toString('base64')
	const derivationSuffix = require('crypto').randomBytes(10).toString('base64')

	const derivedPublicKey = await derivePublicKey({
		protocolID: [2, '3241645161d8'],
		keyID: `${derivationPrefix} ${derivationSuffix}`,
		counterparty: recipientPublicKey
	})

	const script = new bsv.Script(
		bsv.Script.fromAddress(bsv.Address.fromPublicKey(bsv.PublicKey.fromString(derivedPublicKey)))
	).toHex()

	const payment = await createAction({
		description,
		outputs: [{
			script,
			satoshis: amount
		}]
	})

	if (payment.status === 'error') {
		throw new CustomError(payment.description || 'Error', payment.code || 'UNKNOWN_ERROR')
	}

	const client = new AuthriteClient(config.byteshopURL)
	const payResponse: CreateSignedRequestResult = await client.createSignedRequest('/pay', {
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
	})

	if (payResponse.status === 'error') {
		throw new CustomError(payResponse.description || 'Error', payResponse.code || 'UNKNOWN_ERROR')
	}

	const result: PayResult = {
		status: payResponse.status,
		description: payResponse.description || '',
		code: payResponse.code,
		bytes: payResponse.bytes,
		note: payResponse.note
	}

	return result
}
