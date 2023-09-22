'use client'

import React, { useState, useEffect, useRef } from 'react'

import dayjs from 'dayjs'
import {
  createChart,
  IChartApi,
  ChartOptions,
  DeepPartial,
  CrosshairMode,
  isBusinessDay,
  BusinessDay,
  UTCTimestamp,
  ISeriesApi,
  LineStyle,
} from 'lightweight-charts'
import { usePrevious } from 'react-use'
import { useMenu } from '../hooks/MenuContext'
import axios from 'axios'
import { useQuery } from 'react-query'

export enum CHART_PERIODS {
  '15m' = '15m',
  '1H' = '1H',
  '4H' = '4H',
  '1D' = '1D',
  '1W' = '1W',
}

declare global {
  interface Window {
    interval: any
  }
}

const CandleOption: DeepPartial<ChartOptions> = {
  autoSize: true,
  crosshair: {
    mode: CrosshairMode.Normal,
    // Vertical crosshair line (showing Date in Label)
    vertLine: {
      // @ts-ignore
      width: 20,
      color: '#C3BCDB44',
      style: LineStyle.Solid,
      labelBackgroundColor: '#9B7DFF',
    },

    // Horizontal crosshair line (showing Price in Label)
    horzLine: {
      color: '#9B7DFF',
      labelBackgroundColor: '#9B7DFF',
    },
  },
  localization: {
    timeFormatter: (time: BusinessDay | UTCTimestamp) => {
      if (isBusinessDay(time)) {
        return ''
      }

      return dayjs(time * 1000).format('DD MMM YY hh:mm a')
    },
  },
  rightPriceScale: {
    borderVisible: false,
  },
  timeScale: {
    barSpacing: 20,
    timeVisible: true,
    rightOffset: 15,
    borderVisible: false,
  },
}

type Bar = {
  date: string
  open: number
  high: number
  low: number
  close: number
  time: number
}

const getBars = async (ticker: string, from: number, to: number) => {
  const urlParameters: { [key: string]: string } = {
    from: dayjs(from).format('YYYY-MM-DD'),
    to: dayjs(to).format('YYYY-MM-DD'),
  }

  const query = Object.keys(urlParameters)
    .map((name) => `${name}=${encodeURIComponent(urlParameters[name])}`)
    .join('&')

  const { data } = await axios.get(
    `https://financialmodelingprep.com/api/v3/historical-chart/5min/${ticker}?apikey=d4148d98b1d826e0738004faf147f784&${query}`,
  )

  data?.forEach((item: Bar) => {
    item.time = new Date(item.date).valueOf() / 1_000
  })

  return data
    ?.filter(
      (item: Bar) =>
        item.time * 1000 >= from && item.time * 1000 < to + 1000 * 60 * 60 * 24,
    )
    ?.reverse()
}

const useBars = (ticker: string, from: number, to: number) => {
  return useQuery(['bars', ticker, from, to], () => getBars(ticker, from, to))
}

const TradingViewChart = () => {
  const { playing, togglePlaying, startDate, symbolInfo } = useMenu()
  const { data: prevData } = useBars(
    symbolInfo.symbol,
    dayjs(startDate).subtract(7, 'day').valueOf(),
    dayjs(startDate).subtract(1, 'day').valueOf(),
  )

  const { data } = useBars(
    symbolInfo.symbol,
    dayjs(startDate).valueOf(),
    dayjs(startDate).add(7, 'day').valueOf(),
  )

  console.log(
    playing,
    startDate,
    dayjs(startDate).format('YYYY-MM-DD'),
    symbolInfo,
    prevData,
    data,
  )
  // toggle when space key pressed
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        togglePlaying()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [togglePlaying])

  // reference for timer id
  const timerId = useRef<NodeJS.Timeout | null>(null)

  // reference for DOM element to create with chart
  const ref = useRef<HTMLDivElement>(null)

  // pointer to the chart object
  const [chartCreated, setChartCreated] = useState<IChartApi | null>(null)
  const [candleSeries, setCandleSeries] =
    useState<ISeriesApi<'Candlestick'> | null>(null)

  const startDatePrev = usePrevious(startDate)
  const symbolInfoPrev = usePrevious(symbolInfo)
  React.useEffect(() => {
    if (
      (startDate !== startDatePrev || symbolInfo !== symbolInfoPrev) &&
      chartCreated
    ) {
      // remove the tooltip element
      chartCreated.resize(0, 0)
      chartCreated.remove()
      setChartCreated(null)
    }
  }, [chartCreated, startDate, startDatePrev, symbolInfo, symbolInfoPrev])

  // if no chart created yet, create one with options and add to DOM manually
  useEffect(() => {
    if (!chartCreated && prevData && ref.current) {
      let chart = createChart(ref.current, CandleOption)

      let candleSeries_ = chart.addCandlestickSeries()

      setChartCreated(chart)
      setCandleSeries(candleSeries_)
      candleSeries_.setData(prevData)
    }
  }, [chartCreated, prevData])

  // indexer reference for data
  const dataIndex = useRef(0)

  useEffect(() => {
    if (playing && candleSeries && data) {
      window.interval = setInterval(() => {
        if (dataIndex.current === data.length) {
          clearInterval(timerId.current!)
        } else {
          candleSeries.update(data[dataIndex.current++])
        }
      }, 200)
    }

    return () => {
      if (window.interval) window.clearInterval(window.interval)
    }
  }, [timerId, playing, candleSeries, data])

  return (
    <div className="w-full border-4 border-solid border-slate-300">
      <div
        style={{
          width: '100%',
          height: 'calc(100vh - 100px)',
          minHeight: '400px',
        }}
        ref={ref}
        id={'test-id'}
      />
    </div>
  )
}

export default TradingViewChart
