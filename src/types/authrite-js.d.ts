declare module 'authrite-js' {
	interface CreateSignedRequestOptions {
		[key: string]: any
	}

	interface CreateSignedRequestResult {
		status: string
		description?: string
		code?: string
		[key: string]: any
	}

	export interface InvoiceResult extends CreateSignedRequestResult {
		message: string
		identityKey: string
		amount: number
		orderID: string
		publicURL: string
	}

	export class AuthriteClient {
		constructor(url: string)
		createSignedRequest(endpoint: string, options: CreateSignedRequestOptions): Promise<CreateSignedRequestResult>
	}
}

