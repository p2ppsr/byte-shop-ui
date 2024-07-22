declare module 'use-async-effect' {
    import { EffectCallback, DependencyList } from 'react'
  
    export default function useAsyncEffect(
      effect: () => Promise<void | ReturnType<EffectCallback>>,
      deps?: DependencyList
    ): void
  }
  