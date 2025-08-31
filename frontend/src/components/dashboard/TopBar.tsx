"use client"

import { useAccount, useDisconnect } from "wagmi"
import { 
  ChevronDown, 
  LogOut, 
  Copy, 
  Check,
  Wallet,
  Network
} from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export function TopBar() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
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

  if (!isConnected) {
    return (
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">Not connected</span>
        </div>
        <Button variant="outline" size="sm">
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Connected</span>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">Sepolia Testnet</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
              {address ? address.slice(2, 4).toUpperCase() : "??"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-900">
            {address ? formatAddress(address) : "Unknown"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-6 w-6 p-0 hover:bg-gray-200"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3 text-gray-400" />
            )}
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => disconnect()}
          className="text-gray-500 hover:text-gray-700"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
