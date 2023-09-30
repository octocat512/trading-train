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
  Time,
} from 'lightweight-charts'
import { usePrevious } from 'react-use'
import { useMenu } from '../hooks/MenuContext'
import axios from 'axios'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

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
  handleScale: false,
}

type Bar = OhlcData & {
  date: string
}

const intervalToQuery: { [key: string]: string } = {
  '1m': '1min',
  '5m': '5min',
  '15m': '15min',
  '30m': '30min',
  '1h': '1hour',
  '4h': '4hour',
  '1d': '1day',
  '1w': '1week',
  '1M': '1month',
}

const BARS_COUNT_PER_LOAD = 1000
const calculateDaysByInterval = (interval: string) => {
  switch (interval) {
    case '1m':
      return 1 / 24 / 60
    case '5m':
      return 5 / 24 / 60
    case '15m':
      return 15 / 24 / 60
    case '30m':
      return 30 / 24 / 60
    case '1h':
      return 1 / 24
    case '4h':
      return 4 / 24
    case '1d':
      return 1
    case '1w':
      return 1
    case '1M':
      return 1
    default:
      return 1
  }
}

const getBars = async (
  ticker: string,
  interval: string,
  from: number,
  to: number,
) => {
  const urlParameters: { [key: string]: string } = {
    from: dayjs(from).format('YYYY-MM-DD'),
    to: dayjs(to).format('YYYY-MM-DD'),
  }

  const query = Object.keys(urlParameters)
    .map((name) => `${name}=${encodeURIComponent(urlParameters[name])}`)
    .join('&')

  let data

  if (interval === '1M') {
    const { data: t } = await axios.get(
      `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?apikey=d4148d98b1d826e0738004faf147f784&${query}`,
    )
    data = t.historical

    let monthlyBars: Bar[] = []
    let currentWeek: Bar = {
      time: 0 as Time,
      open: 0,
      high: 0,
      low: 0,
      close: 0,
      date: '',
    }

    const getFirstDayOfMonth = (date: string) => {
      return dayjs.utc(date).startOf('month').valueOf()
    }

    data?.reverse().forEach((dailyBar: Bar) => {
      let x = getFirstDayOfMonth(dailyBar.date)

      if (currentWeek.date === '') {
        // Initialize the current week
        currentWeek.open = dailyBar.open
        currentWeek.high = dailyBar.high
        currentWeek.low = dailyBar.low
        currentWeek.close = dailyBar.close
        currentWeek.date = dailyBar.date
      } else if (getFirstDayOfMonth(currentWeek.date) === x) {
        // Update the current week
        currentWeek.high = Math.max(currentWeek.high, dailyBar.high)
        currentWeek.low = Math.min(currentWeek.low, dailyBar.low)
        currentWeek.close = dailyBar.close
      } else {
        // Add the current week to the weekly bars array
        monthlyBars.push(currentWeek)

        // Initialize the new current week
        currentWeek = {
          time: 0 as Time,
          open: 0,
          high: 0,
          low: 0,
          close: 0,
          date: '',
        }
      }
    })

    data = monthlyBars
  } else if (interval === '1w') {
    const { data: t } = await axios.get(
      `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?apikey=d4148d98b1d826e0738004faf147f784&${query}`,
    )
    data = t.historical

    let weeklyBars: Bar[] = []
    let currentWeek: Bar = {
      time: 0 as Time,
      open: 0,
      high: 0,
      low: 0,
      close: 0,
      date: '',
    }

    const getWeek = (date: string) => {
      return Math.floor(dayjs(date).valueOf() / (1_000 * 60 * 60 * 24 * 7))
    }

    data?.reverse().forEach((dailyBar: Bar) => {
      let x = getWeek(dailyBar.date)

      if (currentWeek.date === '') {
        // Initialize the current week
        currentWeek.open = dailyBar.open
        currentWeek.high = dailyBar.high
        currentWeek.low = dailyBar.low
        currentWeek.close = dailyBar.close
        currentWeek.date = dailyBar.date
      } else if (getWeek(currentWeek.date) === x) {
        // Update the current week
        currentWeek.high = Math.max(currentWeek.high, dailyBar.high)
        currentWeek.low = Math.min(currentWeek.low, dailyBar.low)
        currentWeek.close = dailyBar.close
      } else {
        // Add the current week to the weekly bars array
        weeklyBars.push(currentWeek)

        // Initialize the new current week
        currentWeek = {
          time: 0 as Time,
          open: 0,
          high: 0,
          low: 0,
          close: 0,
          date: '',
        }
      }
    })

    data = weeklyBars
  } else if (interval === '1d') {
    const { data: t } = await axios.get(
      `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?apikey=d4148d98b1d826e0738004faf147f784&${query}`,
    )
    data = t.historical
    data = data?.reverse()
  } else {
    const { data: t } = await axios.get(
      `https://financialmodelingprep.com/api/v3/historical-chart/${intervalToQuery[interval]}/${ticker}?apikey=d4148d98b1d826e0738004faf147f784&${query}`,
    )
    data = t
    data = data?.reverse()
  }

  data?.forEach((item: Bar) => {
    item.time = (new Date(item.date).valueOf() / 1_000) as UTCTimestamp
  })

  return data?.filter(
    (item: Bar) =>
      (item.time as number) * 1000 >= from &&
      (item.time as number) * 1000 < to + 1000 * 60 * 60 * 24,
  )
}

const usePrevBars = (ticker: string, interval: string, to: number) => {
  const intervalDays =
    2 * Math.ceil(BARS_COUNT_PER_LOAD * calculateDaysByInterval(interval))

  return useQuery<Bar[]>(['bars', ticker, interval, to], () =>
    getBars(ticker, interval, to - 1000 * 60 * 60 * 24 * intervalDays, to),
  )
}

const useInfiniteBars = (ticker: string, interval: string, from: number) => {
  const intervalDays =
    2 * Math.ceil(BARS_COUNT_PER_LOAD * calculateDaysByInterval(interval))

  const { data, ...rest } = useInfiniteQuery<{
    bars: Bar[]
    from: number
    to: number
  }>({
    queryKey: ['infinite-bars', ticker, interval, from],
    queryFn: async ({ pageParam = 1 }) => {
      const f = from + (pageParam - 1) * 1000 * 60 * 60 * 24 * intervalDays
      const t =
        from +
        (pageParam - 1) * 1000 * 60 * 60 * 24 * intervalDays +
        1000 * 60 * 60 * 24 * (intervalDays - 1)

      const bars = await getBars(ticker, interval, f, t)
      return {
        bars: bars,
        from: f,
        to: t,
      }
    },
    getNextPageParam: (lastPage, pages) => {
      const current = dayjs().valueOf()
      if (current >= lastPage.from && current <= lastPage.to) return undefined
      return pages.length + 1
    },
    getPreviousPageParam: (firstPage, allPages) => {
      return ''
    },
  })

  return {
    data: data?.pages.map((p) => p.bars).flat(),
    ...rest,
  }
}

const TradingViewChart = () => {
  const {
    playing,
    togglePlaying,
    startDate,
    symbolInfo,
    bps,
    dataIndex,
    interval,
  } = useMenu()
  const { data: prevData } = usePrevBars(
    symbolInfo.symbol,
    interval,
    dayjs(startDate).subtract(1, 'day').valueOf(),
  )

  const barsQuery = useInfiniteBars(
    symbolInfo.symbol,
    interval,
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
  const intervalPrev = usePrevious(interval)

  React.useEffect(() => {
    if (
      (startDate !== startDatePrev ||
        symbolInfo !== symbolInfoPrev ||
        interval !== intervalPrev) &&
      chartCreated
    ) {
      // remove the tooltip element
      chartCreated.resize(0, 0)
      chartCreated.remove()
      setChartCreated(null)
    }
  }, [
    chartCreated,
    startDate,
    startDatePrev,
    symbolInfo,
    symbolInfoPrev,
    interval,
    intervalPrev,
  ])

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
