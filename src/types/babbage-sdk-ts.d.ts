declare module '@babbage/sdk-ts' {
  export function getCertificates(options: any): Promise<any[]>
  export function createCertificate(options: any): Promise<any>
  export function derivePublicKey(options: {
    protocolID: [number, string],
    keyID: string,
    counterparty: string
  }): Promise<string>

  export function createAction(options: {
    description: string,
    outputs: Array<{
      script: string,
      satoshis: number
    }>
  }): Promise<{
    status: string,
    description?: string,
    code?: string,
    [key: string]: any
  }>
}

  