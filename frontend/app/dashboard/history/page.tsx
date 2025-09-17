"use client"

import React, { useState } from "react"
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Database,
  Loader2,
  ExternalLink
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// import { SnapshotModal } from "@/components/SnapshotModal"
import { useVaultEvents, VaultEvent } from "@/hooks/useVaultEvents"
import { useDeposits, DatabaseDeposit } from "@/hooks/useDeposits"
import { useWithdrawals, DatabaseWithdrawal } from "@/hooks/useWithdrawals"
import { useAccount } from "wagmi"
import { NETWORKS } from "@/config/contracts"

interface Transaction {
  id: string
  type: "deposit" | "withdraw" | "interest"
  amount: string
  token: string
  value: string
  status: "completed" | "pending" | "failed"
  timestamp: number // milliseconds since epoch
  hash: string
  snapshotRootHash?: string
  snapshotData?: {
    txHash: string
    chainUid: number
    amount: number
    token: string
    [key: string]: unknown
  }
}


export default function HistoryPage() {
  const { address } = useAccount()
  const { events: vaultEvents, isLoading: isLoadingEvents, error: eventsError, hasMoreEvents, oldestBlock } = useVaultEvents()
  const { deposits: dbDeposits, isLoading: isLoadingDeposits, error: depositsError, refetch: refetchDeposits } = useDeposits()
  const { withdrawals: dbWithdrawals, isLoading: isLoadingWithdrawals, error: withdrawalsError, refetch: refetchWithdrawals } = useWithdrawals()
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loadingSnapshot, setLoadingSnapshot] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Transform vault events to match the existing Transaction interface
  const vaultTransactions: Transaction[] = vaultEvents.map((event: VaultEvent) => ({
    id: event.id,
    type: event.type === 'redeem' ? 'withdraw' : event.type,
    amount: event.type === 'deposit' ? event.sttAmount : event.rebaseTokenAmount,
    token: event.type === 'deposit' ? 'STT' : 'RBT',
    value: `$${(parseFloat(event.type === 'deposit' ? event.sttAmount : event.rebaseTokenAmount) * 1000).toFixed(2)}`, // Mock USD value
    status: 'completed' as const,
    timestamp: Math.floor(event.timestamp * 1000),
    hash: event.transactionHash,
    snapshotRootHash: undefined, // No snapshot data from contract events
    snapshotData: undefined
  }))

  // Transform database deposits to match the existing Transaction interface
  const dbTransactions: Transaction[] = dbDeposits.map((deposit: DatabaseDeposit) => ({
    id: `db-${deposit.id}`,
    type: 'deposit' as const,
    amount: deposit.amount.toString(),
    token: 'STT',
    value: `$${(deposit.amount * 1000).toFixed(2)}`, // Mock USD value
    status: 'completed' as const,
    timestamp: (() => {
      const ts = deposit.created_at as unknown as string
      if (!ts) return Date.now()
      if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(ts)) return new Date(ts).getTime()
      const iso = ts.replace(' ', 'T') + 'Z'
      return new Date(iso).getTime()
    })(),
    hash: deposit.tx_hash,
    snapshotRootHash: undefined,
    snapshotData: undefined
  }))

  // Transform database withdrawals to match the existing Transaction interface
  const dbWithdrawalTransactions: Transaction[] = dbWithdrawals.map((wd: DatabaseWithdrawal) => ({
    id: `dbw-${wd.id}`,
    type: 'withdraw' as const,
    amount: wd.amount.toString(),
    token: 'RBT',
    value: `$${(wd.amount * 1000).toFixed(2)}`,
    status: 'completed' as const,
    timestamp: (() => {
      const ts = wd.created_at as unknown as string
      if (!ts) return Date.now()
      if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(ts)) return new Date(ts).getTime()
      const iso = ts.replace(' ', 'T') + 'Z'
      return new Date(iso).getTime()
    })(),
    hash: wd.tx_hash,
    snapshotRootHash: undefined,
    snapshotData: undefined
  }))

  // Combine and sort all transactions
  const allTransactions = [...vaultTransactions, ...dbTransactions, ...dbWithdrawalTransactions]
    .sort((a, b) => b.timestamp - a.timestamp)

  const transactions = allTransactions

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownRight className="w-4 h-4 text-green-600" />
      case "withdraw":
        return <ArrowUpRight className="w-4 h-4 text-red-600" />
      case "interest":
        return <TrendingUp className="w-4 h-4 text-blue-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }



  const filteredTransactions = transactions.filter(tx => {
    const typeMatch = filterType === "all" || tx.type === filterType
    const statusMatch = filterStatus === "all" || tx.status === filterStatus
    return typeMatch && statusMatch
  })

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [filterType, filterStatus])

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  const formatUTC = (timestampMs: number) => {
    if (!timestampMs || Number.isNaN(timestampMs)) return ''
    return new Date(timestampMs).toISOString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-2">
          View all vault transactions and activity from the blockchain
        </p>
        {(eventsError || depositsError || withdrawalsError) && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              {eventsError && `Error loading events: ${eventsError.message}`}
              {depositsError && ` Error loading deposits: ${depositsError.message}`}
              {withdrawalsError && ` Error loading withdrawals: ${withdrawalsError.message}`}
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter transactions by type and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="deposit">Deposits</option>
                <option value="withdraw">Withdrawals</option>
                <option value="interest">Interest</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
                {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                <br />
                <span className="text-xs text-gray-500">
                  Showing events from the last 500 blocks and neon database
                </span>
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                refetchDeposits()
                refetchWithdrawals()
                // Note: vault events will auto-refresh when component re-mounts
              }}
              variant="outline"
              size="sm"
              disabled={isLoadingEvents || isLoadingDeposits}
            >
              <Database className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(isLoadingEvents || isLoadingDeposits || isLoadingWithdrawals) ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
                <p className="text-gray-500">Loading transaction history...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {transactions.length === 0
                  ? "No transactions found on the blockchain yet"
                  : "No transactions found matching your filters"
                }
              </div>
            ) : (
              paginatedTransactions.map((tx) => (
                <div key={tx.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getTypeIcon(tx.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900 capitalize">
                            {tx.type}
                          </p>
                          {tx.snapshotRootHash && (
                            <Badge variant="secondary" className="flex items-center space-x-1">
                              <Database className="w-3 h-3" />
                              <span>Snapshot</span>
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-mono">{formatUTC(tx.timestamp)}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-gray-500 font-mono">{tx.hash.slice(0, 8)}...{tx.hash.slice(-8)}</p>
                          <a
                            href={`${NETWORKS.SOMNIA.blockExplorer}/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{parseFloat(tx.amount).toFixed(6)} {tx.token}</p>
                      <p className="text-sm text-gray-600">{tx.value}</p>
                      <div className="flex items-center justify-end mt-1">
                        {getStatusIcon(tx.status)}
                        <span className="ml-1 text-xs text-gray-500 capitalize">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Snapshot Actions */}

                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "bg-purple-600 hover:bg-purple-700" : ""}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <Button
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className={currentPage === totalPages ? "bg-purple-600 hover:bg-purple-700" : ""}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
