// apps/mobile/test/providers/combineProviders.tsx
import { ComponentType, ReactNode } from 'react'

type Provider = ComponentType<{ children: ReactNode }>

export const combineProviders =
  (...providers: Provider[]) =>
  ({ children }: { children: ReactNode }) =>
    providers.reduceRight<ReactNode>((acc, P) => <P>{acc}</P>, children)
