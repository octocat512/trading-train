'use client'

import React, { useEffect, useState } from 'react'
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid'
import { useMenu } from '../hooks/MenuContext'
import { Button } from '@/components/ui/button'
import { SymbolSearchBox } from './SymbolSearchBox'
import { DatePicker } from './DatePicker'
import { Slider } from './ui/slider'
import BarBackIcon from '@/icons/BarBack'
import BarForwardIcon from '@/icons/BarForward'
import { eventBus } from './TradingViewChart'
import { TimeFramePicker } from './TimeFramePicker'

export default function Toolbar() {
  const {
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
  } = useMenu()

  return (
    <div className="relative z-10 px-2 py-2 flex items-center space-x-2">
      <SymbolSearchBox selectedSymbol={symbolInfo} onSelect={setSymbolInfo} />

      <TimeFramePicker value={interval} onSelect={setInterval} />

      <Button
        autoFocus={true}
        className="px-2"
        variant="outline"
        onClick={togglePlaying}
      >
        {!playing ? <PlayIcon width={20} /> : <PauseIcon width={20} />}
      </Button>

      <DatePicker date={startDate} onSelect={(d) => setStartDate(d)} />

      <Slider
        className="w-32"
        max={10}
        min={1}
        step={1}
        value={[bps]}
        onValueChange={(x: number[]) => setBps(x[0])}
      />

      <Button
        className=""
        variant="outline"
        onClick={() => {
          eventBus.emit('backBar', { message: 'hello' })
        }}
      >
        <BarBackIcon className="mr-2" />
        Bar Back
      </Button>

      <Button
        className=""
        variant="outline"
        onClick={() => {
          eventBus.emit('forwardBar', { message: 'hello' })
        }}
      >
        <BarForwardIcon className="mr-2" />
        Bar Forward
      </Button>
    </div>
  )
}
