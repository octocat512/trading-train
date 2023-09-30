import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'

enum TimeFrame {
  '1m',
  '5m',
  '15m',
  '30m',
  '1h',
  '4h',
  '1d',
  '1w',
}

const minutes = [1, 5, 15, 30]

export function TimeFramePicker({
  value,
  onSelect,
}: {
  value: string
  onSelect: (s: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{value}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel className="font-normal">MINUTES</DropdownMenuLabel>
        <DropdownMenuGroup>
          {minutes.map((x) => (
            <DropdownMenuItem
              className={value === `${x}m` ? 'bg-slate-200' : ''}
              key={x + 'minutes'}
              onClick={() => {
                onSelect(`${x}m`)
              }}
            >
              <strong>{x === 1 ? '1 minute' : `${x} minutes`}</strong>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="font-normal">HOURS</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              onSelect(`1h`)
            }}
          >
            <strong>1 hour</strong>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onSelect(`4h`)
            }}
          >
            <strong>4 hours</strong>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="font-normal">DAYS</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              onSelect(`1d`)
            }}
          >
            <strong>1 day</strong>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onSelect(`1w`)
            }}
          >
            <strong>1 week</strong>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onSelect(`1M`)
            }}
          >
            <strong>1 month</strong>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
