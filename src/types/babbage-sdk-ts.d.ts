// src/babbage-sdk-ts.d.ts
declare module '@babbage/sdk-ts' {
	export function getNetwork(): Promise<NetworkInfo>
	export function derivePublicKey(privateKey: string): string
  export function createAction(actionData: ActionData): Promise<ActionResult>

  interface NetworkInfo {
    network: string
    status: string
  }

  interface ActionData {
    // Define the properties of actionData as per your requirements
  }

  interface ActionResult {
    // Define the properties of actionResult as per your requirements
  }
}
