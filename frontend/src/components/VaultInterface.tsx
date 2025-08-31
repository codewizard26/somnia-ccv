"use client"

import { useState } from "react"
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
            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-blue-900">Connect Wallet</CardTitle>
                    <CardDescription className="text-blue-600">Please connect your wallet to use the vault</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (!isCorrectNetwork) {
        return (
            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-blue-900">Wrong Network</CardTitle>
                    <CardDescription className="text-blue-600">Please switch to 0G Galileo Testnet</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={handleSwitchTo0G}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all"
                    >
                        Switch to 0G Galileo Testnet
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Deposit/Withdraw Interface - Moved to top */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold text-blue-900 text-left">Vault Operations</CardTitle>
                    <CardDescription className="text-blue-600 text-left text-lg">Deposit or withdraw tokens from the vault</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger
                                value="deposit"
                                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-left pl-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <ArrowDownRight className="w-5 h-5" />
                                    <span className="text-lg">Deposit</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="withdraw"
                                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-left pl-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <ArrowUpRight className="w-5 h-5" />
                                    <span className="text-lg">Withdraw</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="deposit" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-lg font-medium text-blue-900 mb-3 text-left">
                                        Amount (0G)
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.0"
                                            disabled={isLoading || isPending}
                                            className="flex-1 px-4 py-4 text-lg border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white"
                                        />
                                        <Button
                                            onClick={handleMaxDeposit}
                                            disabled={isLoading || isPending}
                                            variant="outline"
                                            className="px-8 text-lg rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
                                        >
                                            Max
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-blue-100">
                                    <div className="flex items-center space-x-3">
                                        <Database className="w-6 h-6 text-blue-600" />
                                        <span className="text-lg font-medium text-blue-900">Store Snapshot on 0G</span>
                                    </div>
                                    <Switch
                                        checked={storeSnapshot}
                                        onCheckedChange={setStoreSnapshot}
                                        disabled={isLoading || isPending}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                </div>

                                <Button
                                    onClick={handleDeposit}
                                    disabled={isLoading || isPending || !amount || parseFloat(amount) <= 0}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-7 text-lg transition-all"
                                >
                                    {isLoading || isPending ? (
                                        <>
                                            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                            <span className="text-lg">Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ArrowDownRight className="w-6 h-6 mr-2" />
                                            <span className="text-lg">Deposit 0G</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="withdraw" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-lg font-medium text-blue-900 mb-3 text-left">
                                        Amount (RBT)
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.0"
                                            disabled={isLoading || isPending}
                                            className="flex-1 px-4 py-4 text-lg border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white"
                                        />
                                        <Button
                                            onClick={handleMaxWithdraw}
                                            disabled={isLoading || isPending}
                                            variant="outline"
                                            className="px-8 text-lg rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
                                        >
                                            Max
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-blue-100">
                                    <div className="flex items-center space-x-3">
                                        <Database className="w-6 h-6 text-blue-600" />
                                        <span className="text-lg font-medium text-blue-900">Store Snapshot on 0G</span>
                                    </div>
                                    <Switch
                                        checked={storeSnapshot}
                                        onCheckedChange={setStoreSnapshot}
                                        disabled={isLoading || isPending}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                </div>

                                <Button
                                    onClick={handleWithdraw}
                                    disabled={isLoading || isPending || !amount || parseFloat(amount) <= 0}
                                    className="w-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl py-7 text-lg transition-all"
                                >
                                    {isLoading || isPending ? (
                                        <>
                                            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                            <span className="text-lg">Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ArrowUpRight className="w-6 h-6 mr-2" />
                                            <span className="text-lg">Withdraw 0G</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Balance Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-blue-900 text-left">Your Balances</CardTitle>
                        <CardDescription className="text-blue-600 text-left">Available tokens</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                            <p className="text-sm text-blue-600 mb-2 text-left">0G Balance</p>
                            <p className="text-2xl font-bold text-blue-900 text-left">
                                {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : "0.0000 0G"}
                            </p>
                        </div>
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                            <p className="text-sm text-blue-600 mb-2 text-left">RBT Balance</p>
                            <p className="text-2xl font-bold text-blue-900 text-left">
                                {userRBTBalance ? `${parseFloat(formatEther(userRBTBalance as bigint)).toFixed(6)} RBT` : "0.000000 RBT"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Vault Statistics */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-blue-900 text-left">Vault Statistics</CardTitle>
                        <CardDescription className="text-blue-600 text-left">Current performance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                            <p className="text-sm text-blue-600 mb-2 text-left">Vault Balance</p>
                            <p className="text-2xl font-bold text-blue-900 text-left">
                                {vaultBalance ? `${parseFloat(formatEther(vaultBalance as bigint)).toFixed(4)} 0G` : "0.0000 0G"}
                            </p>
                        </div>
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                            <p className="text-sm text-blue-600 mb-2 text-left">Total RBT Supply</p>
                            <p className="text-2xl font-bold text-blue-900 text-left">
                                {rbtTotalSupply ? `${parseFloat(formatEther(rbtTotalSupply as bigint)).toFixed(6)} RBT` : "0.000000 RBT"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            {transactions.length > 0 && (
                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-blue-900">Recent Transactions</CardTitle>
                        <CardDescription className="text-blue-600">Your latest vault operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {transactions.slice(0, 5).map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-200 transition-all">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "deposit" ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"
                                            }`}>
                                            {tx.type === "deposit" ? (
                                                <ArrowDownRight className="w-5 h-5" />
                                            ) : (
                                                <ArrowUpRight className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-blue-900 capitalize">{tx.type}</p>
                                            <p className="text-sm text-blue-600">
                                                {new Date(tx.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-blue-900">{tx.amount} {tx.token}</p>
                                        <p className="text-xs text-blue-600 font-mono">
                                            {tx.txHash === "pending" ? "Pending..." : `${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-8)}`}
                                        </p>
                                        {tx.snapshotRootHash && (
                                            <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-600 hover:bg-blue-200">
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
                <Card className="border-none shadow-lg bg-red-50">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-red-600">Transaction Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-600">{error.message}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}