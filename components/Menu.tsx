'use client'

import React, { useState } from 'react'
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid'
import { useMenu } from '../hooks/MenuContext'
import { Button } from '@/components/ui/button'
import { SymbolSearchBox } from './SymbolSearchBox'
import { DatePicker } from './DatePicker'

export default function Menu() {
  const {
    playing,
    togglePlaying,
    symbolInfo,
    setSymbolInfo,
    startDate,
    setStartDate,
  } = useMenu()

  return (
    <div className="relative z-10 px-2 py-2 flex items-center space-x-2">
      <SymbolSearchBox selectedSymbol={symbolInfo} onSelect={setSymbolInfo} />

      <Button className="px-2" variant="outline" onClick={togglePlaying}>
        {!playing ? <PlayIcon width={20} /> : <PauseIcon width={20} />}
      </Button>

      <DatePicker date={startDate} onSelect={(d) => setStartDate(d)} />
    </div>
  )
}
