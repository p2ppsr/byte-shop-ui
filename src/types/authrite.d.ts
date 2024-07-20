declare module 'authrite' {
  export class AuthriteClient {
    constructor(url: string)
    createSignedRequest(endpoint: string, payload: any): Promise<any>
  }
}
