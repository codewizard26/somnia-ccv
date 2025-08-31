"use client"

import { useState, useEffect } from "react"
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Database,
  Loader2
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SnapshotModal } from "@/components/SnapshotModal"

interface Transaction {
  id: string
  type: "deposit" | "withdraw" | "interest"
  amount: string
  token: string
  value: string
  status: "completed" | "pending" | "failed"
  timestamp: string
  hash: string
  snapshotRootHash?: string
  snapshotData?: any
}

// Mock data - replace with actual data from your backend
const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "deposit",
    amount: "0.5",
    token: "0G",
    value: "$1,234.56",
    status: "completed",
    timestamp: "2 hours ago",
    hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    snapshotRootHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    snapshotData: {
      txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      chainUid: 16601,
      amount: 0.5,
      token: "0G",
      timestamp: "2024-01-15T10:30:00Z",
      userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
    }
  },
  {
    id: "2",
    type: "interest",
    amount: "0.01",
    token: "0G",
    value: "$24.68",
    status: "completed",
    timestamp: "1 day ago",
    hash: "0x876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
    snapshotRootHash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    snapshotData: {
      txHash: "0x876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
      chainUid: 16601,
      amount: 0.01,
      token: "0G",
      timestamp: "2024-01-14T15:45:00Z",
      userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
    }
  },
  {
    id: "3",
    type: "withdraw",
    amount: "0.1",
    token: "0G",
    value: "$246.80",
    status: "pending",
    timestamp: "3 days ago",
    hash: "0xabcd1234ef567890abcd1234ef567890abcd1234ef567890abcd1234ef567890"
  }
]

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loadingSnapshot, setLoadingSnapshot] = useState<string | null>(null)

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

  const fetchSnapshot = async (rootHash: string, txId: string) => {
    setLoadingSnapshot(txId)
    try {
      // Mock API call to fetch snapshot from 0G
      const response = await fetch(`/api/fetch-snapshot?rootHash=${rootHash}`)
      if (response.ok) {
        const data = await response.json()
        // Update transaction with snapshot data
        setTransactions(prev => prev.map(tx =>
          tx.id === txId ? { ...tx, snapshotData: data } : tx
        ))
      } else {
        throw new Error("Failed to fetch snapshot")
      }
    } catch (error) {
      console.error("Error fetching snapshot:", error)
    } finally {
      setLoadingSnapshot(null)
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    const typeMatch = filterType === "all" || tx.type === filterType
    const statusMatch = filterStatus === "all" || tx.status === filterStatus
    return typeMatch && statusMatch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-2">
          View all your vault transactions and activity
        </p>
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
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions found matching your filters
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="border border-gray-200 rounded-lg p-4">
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
                              <span>0G</span>
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{tx.timestamp}</p>
                        <p className="text-xs text-gray-500 font-mono">{tx.hash}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{tx.amount} {tx.token}</p>
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
                  {tx.snapshotRootHash && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Database className="w-4 h-4" />
                          <span>Snapshot stored on 0G</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!tx.snapshotData && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchSnapshot(tx.snapshotRootHash!, tx.id)}
                              disabled={loadingSnapshot === tx.id}
                            >
                              {loadingSnapshot === tx.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Fetch Snapshot
                                </>
                              )}
                            </Button>
                          )}
                          {tx.snapshotData && (
                            <SnapshotModal
                              trigger={
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Snapshot
                                </Button>
                              }
                              title={`Snapshot for ${tx.type} transaction`}
                              data={tx.snapshotData}
                              rootHash={tx.snapshotRootHash}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
