'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import TradingViewChart from '@/components/TradingViewChart'
import Menu from '@/components/Menu'
import { MenuProvider } from '@/hooks/MenuContext'
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from 'react-query'

const queryClient = new QueryClient()

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex min-h-screen flex-col">
        <MenuProvider>
          <Menu />
          <TradingViewChart />
        </MenuProvider>
      </main>
    </QueryClientProvider>
  )
}
