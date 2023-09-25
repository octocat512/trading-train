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
  OhlcData,
} from 'lightweight-charts'
import { usePrevious } from 'react-use'
import { useMenu } from '../hooks/MenuContext'
import axios from 'axios'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Button } from './ui/button'

// Event Bus implementation
class EventBus {
  private events: { [key: string]: Function[] } = {}

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  off(event: string, callback: Function) {
    if (this.events[event]) {
      const index = this.events[event].indexOf(callback)
      if (index !== -1) {
        this.events[event].splice(index, 1)
      }
    }
  }

  emit(event: string, data: any) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(data))
    }
  }
}

export const eventBus = new EventBus()

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

type Bar = OhlcData & {
  date: string
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
    item.time = (new Date(item.date).valueOf() / 1_000) as UTCTimestamp
  })

  return data
    ?.filter(
      (item: Bar) =>
        (item.time as number) * 1000 >= from &&
        (item.time as number) * 1000 < to + 1000 * 60 * 60 * 24,
    )
    ?.reverse()
}

const useBars = (ticker: string, from: number, to: number) => {
  return useQuery<Bar[]>(['bars', ticker, from, to], () =>
    getBars(ticker, from, to),
  )
}

const useInfiniteBars = (ticker: string, from: number) => {
  const { data, ...rest } = useInfiniteQuery<Bar[]>({
    queryKey: ['infinite-bars', ticker, from],
    queryFn: async ({ pageParam = 1 }) => {
      return await getBars(
        ticker,
        from + (pageParam - 1) * 1000 * 60 * 60 * 24 * 7,
        from +
          (pageParam - 1) * 1000 * 60 * 60 * 24 * 7 +
          1000 * 60 * 60 * 24 * 6,
      )
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length === 0) return undefined
      return pages.length + 1
    },
    getPreviousPageParam: (firstPage, allPages) => {
      return ''
    },
  })

  return {
    data: data?.pages.flat(),
    ...rest,
  }
}

const TradingViewChart = () => {
  const { playing, togglePlaying, startDate, symbolInfo, bps, dataIndex } =
    useMenu()
  const { data: prevData } = useBars(
    symbolInfo.symbol,
    dayjs(startDate).subtract(7, 'day').valueOf(),
    dayjs(startDate).subtract(1, 'day').valueOf(),
  )

  const barsQuery = useInfiniteBars(
    symbolInfo.symbol,
    dayjs(startDate).valueOf(),
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

  const { data } = barsQuery
  useEffect(() => {
    if (playing && candleSeries && barsQuery.data) {
      window.interval = window.setInterval(() => {
        if (dataIndex.current === barsQuery.data!.length) {
          if (barsQuery.hasNextPage && !barsQuery.isFetching) {
            barsQuery.fetchNextPage()
          }
          if (!barsQuery.hasNextPage && !barsQuery.isFetching) {
            window.alert('No more data to load')
            togglePlaying()
          }
          window.clearInterval(window.interval)
        } else {
          candleSeries.update(barsQuery.data![dataIndex.current++])
        }
      }, (1 / bps) * 1000)
    }

    return () => {
      if (window.interval) window.clearInterval(window.interval)
    }
  }, [timerId, playing, candleSeries, barsQuery, bps, togglePlaying, dataIndex])

  useEffect(() => {
    const backBarHandler = () => {
      if (dataIndex.current > 0) {
        candleSeries?.setData(
          prevData?.concat(data?.slice(0, dataIndex.current - 1) || []) || [],
        )
        dataIndex.current--
      } else {
        window.alert("You can't go back anymore")
      }
    }

    const forwardBarHandler = () => {
      if (data) {
        if (dataIndex.current === barsQuery.data!.length) {
          if (barsQuery.hasNextPage && !barsQuery.isFetching) {
            barsQuery.fetchNextPage()
          }
          if (!barsQuery.hasNextPage && !barsQuery.isFetching) {
            window.alert('No more data to load')
            // togglePlaying()
          }
        } else {
          candleSeries?.update(barsQuery.data![dataIndex.current++])
        }
      }
    }

    eventBus.on('backBar', backBarHandler)
    eventBus.on('forwardBar', forwardBarHandler)

    return () => {
      eventBus.off('backBar', backBarHandler)
      eventBus.off('forwardBar', forwardBarHandler)
    }
  }, [candleSeries, prevData, data, dataIndex, barsQuery])

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
