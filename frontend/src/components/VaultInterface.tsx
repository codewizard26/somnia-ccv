"use client"

import { useState, useEffect } from "react"
import { useAccount, useBalance, useChainId, useReadContract, useWriteContract, useSwitchChain } from "wagmi"
import { parseEther, formatEther } from "viem"
import { ArrowUpRight, ArrowDownRight, Loader2, Database } from "lucide-react"
import toast from "react-hot-toast"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { CONTRACTS, NETWORKS } from "@/config/contracts"

// Vault ABI for deposit and withdraw functions
const VAULT_ABI = [
    {
        "inputs": [],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_rbtAmount",
                "type": "uint256"
            }
        ],
        "name": "redeem",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getVaultBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_rbtAmount",
                "type": "uint256"
            }
        ],
        "name": "calculateRedeemAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

// RebaseToken ABI for balance checks
const REBASE_TOKEN_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

interface Transaction {
    id: string
    type: "deposit" | "withdraw"
    amount: string
    token: string
    txHash: string
    timestamp: string
    snapshotRootHash?: string
}

export default function VaultInterface() {
    const { address, isConnected } = useAccount()
    const chainId = useChainId()
    const { data: balance } = useBalance({ address })
    const { switchChain } = useSwitchChain()
    const [activeTab, setActiveTab] = useState("deposit")
    const [amount, setAmount] = useState("")
    const [storeSnapshot, setStoreSnapshot] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [transactions, setTransactions] = useState<Transaction[]>([])

    const { writeContract, isPending, error } = useWriteContract()

    // Read RBT balance directly from RebaseToken contract
    const { data: userRBTBalance } = useReadContract({
        address: CONTRACTS.REBASE_TOKEN as `0x${string}`,
        abi: REBASE_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
        query: {
            enabled: !!address,
        },
    })

    // Read vault balance
    const { data: vaultBalance } = useReadContract({
        address: CONTRACTS.VAULT as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'getVaultBalance',
    })

    // Read RBT total supply
    const { data: rbtTotalSupply } = useReadContract({
        address: CONTRACTS.REBASE_TOKEN as `0x${string}`,
        abi: REBASE_TOKEN_ABI,
        functionName: 'totalSupply',
    })

    const isCorrectNetwork = chainId === NETWORKS.GALILEO.id

    const handleSwitchTo0G = async () => {
        try {
            await switchChain({ chainId: NETWORKS.GALILEO.id })
        } catch (error) {
            console.error('Failed to switch chain:', error)
        }
    }

    const handleDeposit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount')
            return
        }

        if (!balance || parseFloat(balance.formatted) < parseFloat(amount)) {
            toast.error('Insufficient 0G balance')
            return
        }

        setIsLoading(true)

        try {
            const loadingToast = toast.loading("Transaction sent...")
            const amountInWei = parseEther(amount)

            writeContract({
                address: CONTRACTS.VAULT as `0x${string}`,
                abi: VAULT_ABI,
                functionName: 'deposit',
                value: amountInWei,
            })

            // Store snapshot if enabled
            if (storeSnapshot) {
                try {
                    const snapshotData = {
                        txHash: "pending", // Will be updated when transaction is confirmed
                        chainUid: chainId,
                        amount: parseFloat(amount),
                        token: "0G",
                        timestamp: new Date().toISOString(),
                        userAddress: address,
                    }

                    // Mock upload to 0G
                    const response = await fetch("/api/upload-snapshot", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(snapshotData),
                    })

                    if (response.ok) {
                        const { rootHash } = await response.json()
                        toast.success("Snapshot stored in 0G")

                        // Add transaction to history
                        const transaction: Transaction = {
                            id: Date.now().toString(),
                            type: "deposit",
                            amount,
                            token: "0G",
                            txHash: "pending",
                            timestamp: new Date().toISOString(),
                            snapshotRootHash: rootHash,
                        }
                        setTransactions(prev => [transaction, ...prev])
                    } else {
                        toast.error("Error uploading snapshot")
                    }
                } catch (error) {
                    console.error("Snapshot upload error:", error)
                    toast.error("Error uploading snapshot")
                }
            }

            toast.dismiss(loadingToast)
            toast.success("Transaction confirmed!")
            setAmount("")

        } catch (error) {
            console.error('Deposit error:', error)
            toast.error('Deposit failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleWithdraw = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount')
            return
        }

        if (!userRBTBalance || parseFloat(formatEther(userRBTBalance as bigint)) < parseFloat(amount)) {
            toast.error('Insufficient RBT balance')
            return
        }

        setIsLoading(true)

        try {
            const loadingToast = toast.loading("Transaction sent...")
            const amountInWei = parseEther(amount)

            writeContract({
                address: CONTRACTS.VAULT as `0x${string}`,
                abi: VAULT_ABI,
                functionName: 'redeem',
                args: [amountInWei],
            })

            // Store snapshot if enabled
            if (storeSnapshot) {
                try {
                    const snapshotData = {
                        txHash: "pending", // Will be updated when transaction is confirmed
                        chainUid: chainId,
                        amount: parseFloat(amount),
                        token: "RBT",
                        timestamp: new Date().toISOString(),
                        userAddress: address,
                    }

                    // Mock upload to 0G
                    const response = await fetch("/api/upload-snapshot", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(snapshotData),
                    })

                    if (response.ok) {
                        const { rootHash } = await response.json()
                        toast.success("Snapshot stored in 0G")

                        // Add transaction to history
                        const transaction: Transaction = {
                            id: Date.now().toString(),
                            type: "withdraw",
                            amount,
                            token: "RBT",
                            txHash: "pending",
                            timestamp: new Date().toISOString(),
                            snapshotRootHash: rootHash,
                        }
                        setTransactions(prev => [transaction, ...prev])
                    } else {
                        toast.error("Error uploading snapshot")
                    }
                } catch (error) {
                    console.error("Snapshot upload error:", error)
                    toast.error("Error uploading snapshot")
                }
            }

            toast.dismiss(loadingToast)
            toast.success("Transaction confirmed!")
            setAmount("")

        } catch (error) {
            console.error('Withdraw error:', error)
            toast.error('Withdraw failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleMaxDeposit = () => {
        if (balance) {
            setAmount(balance.formatted)
        }
    }

    const handleMaxWithdraw = () => {
        if (userRBTBalance) {
            setAmount(formatEther(userRBTBalance as bigint))
        }
    }

    if (!isConnected) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Connect Wallet</CardTitle>
                    <CardDescription>Please connect your wallet to use the vault</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (!isCorrectNetwork) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Wrong Network</CardTitle>
                    <CardDescription>Please switch to 0G Galileo Testnet</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleSwitchTo0G} className="w-full">
                        Switch to 0G Galileo Testnet
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Balance Display */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Balances</CardTitle>
                    <CardDescription>Available tokens for vault operations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">0G Balance</p>
                            <p className="text-2xl font-bold">
                                {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : "0.0000 0G"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">RBT Balance</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {userRBTBalance ? `${parseFloat(formatEther(userRBTBalance as bigint)).toFixed(6)} RBT` : "0.000000 RBT"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Vault Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Vault Statistics</CardTitle>
                    <CardDescription>Current vault performance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Vault Balance</p>
                            <p className="text-xl font-bold text-green-600">
                                {vaultBalance ? `${parseFloat(formatEther(vaultBalance as bigint)).toFixed(4)} 0G` : "0.0000 0G"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total RBT Supply</p>
                            <p className="text-xl font-bold text-purple-600">
                                {rbtTotalSupply ? `${parseFloat(formatEther(rbtTotalSupply as bigint)).toFixed(6)} RBT` : "0.000000 RBT"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Deposit/Withdraw Interface */}
            <Card>
                <CardHeader>
                    <CardTitle>Vault Operations</CardTitle>
                    <CardDescription>Deposit or withdraw tokens from the vault</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="deposit" className="flex items-center space-x-2">
                                <ArrowDownRight className="w-4 h-4" />
                                <span>Deposit</span>
                            </TabsTrigger>
                            <TabsTrigger value="withdraw" className="flex items-center space-x-2">
                                <ArrowUpRight className="w-4 h-4" />
                                <span>Withdraw</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="deposit" className="space-y-4 mt-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount (0G)
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.0"
                                            disabled={isLoading || isPending}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                        />
                                        <Button
                                            onClick={handleMaxDeposit}
                                            disabled={isLoading || isPending}
                                            variant="outline"
                                            className="px-4"
                                        >
                                            Max
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <Database className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium">Store Snapshot on 0G</span>
                                    </div>
                                    <Switch
                                        checked={storeSnapshot}
                                        onCheckedChange={setStoreSnapshot}
                                        disabled={isLoading || isPending}
                                    />
                                </div>

                                <Button
                                    onClick={handleDeposit}
                                    disabled={isLoading || isPending || !amount || parseFloat(amount) <= 0}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    {isLoading || isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <ArrowDownRight className="w-4 h-4 mr-2" />
                                            Deposit 0G
                                        </>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="withdraw" className="space-y-4 mt-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount (RBT)
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.0"
                                            disabled={isLoading || isPending}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                        />
                                        <Button
                                            onClick={handleMaxWithdraw}
                                            disabled={isLoading || isPending}
                                            variant="outline"
                                            className="px-4"
                                        >
                                            Max
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <Database className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium">Store Snapshot on 0G</span>
                                    </div>
                                    <Switch
                                        checked={storeSnapshot}
                                        onCheckedChange={setStoreSnapshot}
                                        disabled={isLoading || isPending}
                                    />
                                </div>

                                <Button
                                    onClick={handleWithdraw}
                                    disabled={isLoading || isPending || !amount || parseFloat(amount) <= 0}
                                    variant="outline"
                                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                                >
                                    {isLoading || isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <ArrowUpRight className="w-4 h-4 mr-2" />
                                            Withdraw 0G
                                        </>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Recent Transactions */}
            {transactions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Your latest vault operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {transactions.slice(0, 5).map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "deposit" ? "bg-green-100" : "bg-red-100"
                                            }`}>
                                            {tx.type === "deposit" ? (
                                                <ArrowDownRight className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <ArrowUpRight className="w-4 h-4 text-red-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium capitalize">{tx.type}</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(tx.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{tx.amount} {tx.token}</p>
                                        <p className="text-xs text-gray-500 font-mono">
                                            {tx.txHash === "pending" ? "Pending..." : `${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-8)}`}
                                        </p>
                                        {tx.snapshotRootHash && (
                                            <Badge variant="secondary" className="mt-1">
                                                0G Snapshot
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error Display */}
            {error && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-red-600">Transaction Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-600">{error.message}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
} 