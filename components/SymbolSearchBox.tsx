'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'

import forexList from './forex.json'
import indexList from './indices.json'
import { TSymbol } from '@/hooks/MenuContext'

const allSymbols: TSymbol[] = [...forexList, ...indexList]

const useSymbolSearch = (str: string) => {
  return (
    allSymbols.filter(
      (item) =>
        item.symbol.toLocaleLowerCase().includes(str.toLocaleLowerCase()) ||
        item.name.toLocaleLowerCase().includes(str.toLocaleLowerCase()),
    ) || []
  )
}

export function SymbolSearchBox({
  selectedSymbol,
  onSelect,
}: {
  selectedSymbol: TSymbol
  onSelect: Function
}) {
  const [symbol, setSymbol] = useState('')

  const searchedList = useSymbolSearch(symbol)

  useEffect(() => {
    setSymbol(selectedSymbol.symbol)
  }, [selectedSymbol])

  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={(x) => setOpen(x)}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-20">
          {selectedSymbol.symbol}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Search Symbol</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            className="w-full"
            placeholder="Search"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
        </div>

        <Table>
          <TableHeader className="">
            <TableRow className="grid grid-cols-4">
              <TableHead className="">Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Exchange</TableHead>
            </TableRow>
          </TableHeader>

          <ScrollArea className="h-80 overflow-auto w-full">
            <TableBody>
              {searchedList.map((item) => (
                <TableRow
                  className="grid grid-cols-4"
                  key={item.symbol}
                  onClick={() => {
                    setOpen(false)
                    onSelect(item)
                  }}
                >
                  <TableCell className="font-medium">{item.symbol}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.currency}</TableCell>
                  <TableCell className="text-right">
                    {item.stockExchange}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </ScrollArea>
        </Table>
        {/* </div> */}
      </DialogContent>
    </Dialog>
  )
}
