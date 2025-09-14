"use client"

import { useAccount, useDisconnect, useConnect, useChainId } from "wagmi"
import {
  LogOut,
  Copy,
  Check,
  Wallet,
  Network
} from "lucide-react"
import { useState } from "react"
import { injected } from 'wagmi/connectors'

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { NETWORKS } from "@/config/contracts"

export function TopBar() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect } = useConnect()
  const chainId = useChainId()
  const [copied, setCopied] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyToClipboard = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isCorrectNetwork = chainId === NETWORKS.SOMNIA.id

  const handleConnect = async () => {
    try {
      await connect({ connector: injected() })
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex h-16 items-center justify-between px-6 border-b border-purple-100 bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 text-purple-500" />
          <span className="text-sm text-purple-700">Somnia Network • Wallet not connected</span>
        </div>
        <Button
          onClick={handleConnect}
          className="bg-purple-600 hover:bg-purple-700 text-white transition-all px-6 py-2 text-sm font-medium rounded-xl"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-16 items-center justify-between px-6 border-b border-purple-100 bg-white shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 ${isCorrectNetwork ? 'bg-green-500' : 'bg-yellow-500'} rounded-full animate-pulse`}></div>
          <span className="text-sm text-purple-700 font-medium">
            {isCorrectNetwork ? 'Connected to Somnia Network' : 'Wrong Network'}
          </span>
        </div>
        <Separator orientation="vertical" className="h-6 bg-purple-100" />
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-purple-500" />
          <span className="text-sm text-purple-700">
            {isCorrectNetwork ? 'Somnia Network' : 'Please switch to Somnia Network'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-purple-50 rounded-xl px-4 py-2 border border-purple-100 transition-all hover:border-purple-200">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
              {address ? address.slice(2, 4).toUpperCase() : "??"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-purple-900">
            {address ? formatAddress(address) : "Unknown"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-6 w-6 p-0 hover:bg-purple-100 text-purple-700 transition-colors"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => disconnect()}
          className="text-purple-700 hover:bg-purple-50 hover:text-purple-800 rounded-xl"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
