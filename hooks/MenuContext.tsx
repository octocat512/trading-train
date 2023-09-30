'use client'

import dayjs from 'dayjs'
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from 'react'

export type TSymbol = {
  symbol: string
  name: string
  currency: string
  stockExchange: string
  exchangeShortName: string
}

// Step 1: Create a new context
const MenuContext = createContext<{
  playing: boolean
  togglePlaying: () => void
  symbolInfo: TSymbol
  setSymbolInfo: (symbol: TSymbol) => void
  startDate: Date | undefined
  setStartDate: (date: Date | undefined) => void
  bps: number
  setBps: (bps: number) => void
  dataIndex: React.MutableRefObject<number>
  interval: string
  setInterval: (i: string) => void
}>({
  playing: false,
  togglePlaying: () => {},
  symbolInfo: {
    symbol: 'ARSMXN',
    name: 'ARS/MXN',
    currency: 'MXN',
    stockExchange: 'CCY',
    exchangeShortName: 'FOREX',
  },
  setSymbolInfo: () => {},
  startDate: dayjs('2023-09-01').startOf('day').toDate(),
  setStartDate: () => {},
  bps: 5,
  setBps: () => {},
  dataIndex: { current: 0 },
  interval: '5m',
  setInterval: () => {},
})

// Step 3: Create a function to Menu the state variable
export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [playing, setPlaying] = useState(false)

  const togglePlaying = () => {
    setPlaying((prevState) => !prevState)
  }

  const [symbolInfo, setSymbolInfo] = useState({
    symbol: 'ARSMXN',
    name: 'ARS/MXN',
    currency: 'MXN',
    stockExchange: 'CCY',
    exchangeShortName: 'FOREX',
  })

  const [startDate, setStartDate] = useState<Date | undefined>(
    dayjs().startOf('day').toDate(),
  )

  // bars per second
  const [bps, setBps] = useState(5)

  const dataIndex = useRef(0)

  useEffect(() => {
    setPlaying(false)
    dataIndex.current = 0
  }, [startDate, symbolInfo])

  const [interval, setInterval] = useState('5m')
  // Step 2: Define a context provider component
  return (
    <MenuContext.Provider
      value={{
        playing,
        togglePlaying,
        symbolInfo,
        setSymbolInfo,
        startDate,
        setStartDate,
        bps,
        setBps,
        dataIndex,
        interval,
        setInterval,
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}

// Step 4: Create a custom hook to access the context values
export function useMenu() {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider')
  }
  return context
}
