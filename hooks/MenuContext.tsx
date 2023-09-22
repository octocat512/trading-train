'use client'

import dayjs from 'dayjs'
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
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
}>({
  playing: false,
  togglePlaying: () => {},
  symbolInfo: {
    symbol: 'XU100.IS',
    name: 'BIST 100',
    currency: 'TRY',
    stockExchange: 'Istanbul',
    exchangeShortName: 'INDEX',
  },
  setSymbolInfo: () => {},
  startDate: new Date(),
  setStartDate: () => {},
})

// Step 3: Create a function to Menu the state variable
export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [playing, setPlaying] = useState(false)

  const togglePlaying = () => {
    setPlaying((prevState) => !prevState)
  }

  const [symbolInfo, setSymbolInfo] = useState({
    symbol: 'XU100.IS',
    name: 'BIST 100',
    currency: 'TRY',
    stockExchange: 'Istanbul',
    exchangeShortName: 'INDEX',
  })

  const [startDate, setStartDate] = useState<Date | undefined>(
    dayjs().startOf('day').toDate(),
  )

  useEffect(() => {
    setPlaying(false)
  }, [startDate, symbolInfo])
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
