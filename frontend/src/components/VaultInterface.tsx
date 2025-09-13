"use client"

import { useState, useEffect } from "react"
import { useAccount, useBalance, useChainId, useReadContract, useWriteContract, useSwitchChain, useWaitForTransactionReceipt } from "wagmi"
import { parseEther, formatEther } from "viem"
import { ArrowUpRight, ArrowDownRight, Loader2, Database, Lock, Crown, History } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { CONTRACTS, NETWORKS } from "@/config/contracts"
import StakingInterface from "./StakingInterface"
import RebaseTokenABI from "@/contracts/RebaseToken.json"
import VaultABI from "@/contracts/Vault.json"
import SimpleRebaseTokenPoolABI from "@/contracts/SimpleRebaseTokenPool.json"

// Use imported ABIs instead of hardcoded ones

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
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("deposit")
    const [amount, setAmount] = useState("")
    const [storeSnapshot, setStoreSnapshot] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [pendingDepositAmount, setPendingDepositAmount] = useState<string>("")

    const { writeContract, isPending, error, data: txHash } = useWriteContract()

    // Wait for transaction receipt to get confirmation
    const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({
        hash: txHash,
        query: {
            enabled: !!txHash,
        }
    })

    // Read RBT balance directly from RebaseToken contract
    const { data: userRBTBalance, refetch: refetchRBTBalance } = useReadContract({
        address: CONTRACTS.REBASE_TOKEN as `0x${string}`,
        abi: RebaseTokenABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
        query: {
            enabled: !!address,
        },
    })

    // Read vault balance
    const { data: vaultBalance, refetch: refetchVaultBalance } = useReadContract({
        address: CONTRACTS.VAULT as `0x${string}`,
        abi: VaultABI,
        functionName: 'totalAssets',
    })

    // Read RBT total supply
    const { data: rbtTotalSupply, refetch: refetchTotalSupply } = useReadContract({
        address: CONTRACTS.REBASE_TOKEN as `0x${string}`,
        abi: RebaseTokenABI,
        functionName: 'totalSupply',
    })

    // Read pool balance (to detect stuck funds)
    const { data: poolBalance, refetch: refetchPoolBalance } = useReadContract({
        address: CONTRACTS.POOL as `0x${string}`,
        abi: SimpleRebaseTokenPoolABI,
        functionName: 'getPoolBalance',
    })

    const isCorrectNetwork = chainId === NETWORKS.SOMNIA.id

    // Handle transaction confirmation and send n8n notification
    useEffect(() => {
        if (receipt && txHash && address && pendingDepositAmount) {
            // Transaction confirmed, store in database and send n8n notification
            storeDepositInDatabase(address, txHash, pendingDepositAmount)
            sendN8nNotification(address, txHash)

            // Clear pending deposit amount
            setPendingDepositAmount("")

            // Refetch balances
            setTimeout(() => {
                refetchRBTBalance()
                refetchVaultBalance()
                refetchTotalSupply()
                refetchPoolBalance()
            }, 1000)
        }
    }, [receipt, txHash, address, pendingDepositAmount])

    const handleSwitchToSomnia = async () => {
        try {
            await switchChain({ chainId: NETWORKS.SOMNIA.id })
        } catch (error) {
            console.error('Failed to switch chain:', error)
        }
    }

    const storeDepositInDatabase = async (walletAddress: string, txHash: string, depositAmount: string) => {
        try {
            const response = await fetch("/api/deposit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user: walletAddress,
                    amount: parseFloat(depositAmount),
                    txHash: txHash
                })
            })

            const data = await response.json()
            if (data.success) {
                console.log("Deposit stored in database successfully")
                toast.success("Deposit recorded in database!")
            } else {
                console.error("Failed to store deposit:", data.error)
                toast.error("Failed to record deposit: " + data.error)
            }
        } catch (error) {
            console.error("Error storing deposit:", error)
            toast.error("Error recording deposit")
        }
    }

    const sendN8nNotification = async (walletAddress: string, txHash: string) => {
        try {
            const webhookUrl = "https://codewizard26.app.n8n.cloud/webhook/99326cbb-87a4-4df3-924f-bae934de441e"
            const payload = {
                test: "Deposit notification from Somnia Vault",
                wallet_address: walletAddress,
                hash: txHash,
                amount: amount,
                token: "STT",
                timestamp: new Date().toISOString(),
                blockExplorer: `${NETWORKS.SOMNIA.blockExplorer}/tx/${txHash}`
            }

            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                console.log("n8n notification sent successfully")
                toast.success("Telegram notification sent!")
            } else {
                console.error("Failed to send n8n notification:", response.statusText)
                toast.error("Failed to send notification")
            }
        } catch (error) {
            console.error("Error sending n8n notification:", error)
            toast.error("Error sending notification")
        }
    }

    const handleDeposit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount')
            return
        }

        if (!balance || parseFloat(balance.formatted) < parseFloat(amount)) {
            toast.error('Insufficient STT balance')
            return
        }

        setIsLoading(true)

        try {
            const loadingToast = toast.loading("Transaction sent...")
            const amountInWei = parseEther(amount)

            // Store the deposit amount for later use when transaction is confirmed
            setPendingDepositAmount(amount)

            // Execute the deposit transaction
            writeContract({
                address: CONTRACTS.POOL as `0x${string}`,
                abi: SimpleRebaseTokenPoolABI,
                functionName: 'depositSTTForRebaseTokens',
                value: amountInWei,
            })

            toast.dismiss(loadingToast)
            toast.success("Transaction sent! Waiting for confirmation...")

            // Send Glacia Labs message
            if (storeSnapshot) {
                try {
                    const messageData = {
                        txHash: "pending",
                        chainUid: chainId,
                        amount: parseFloat(amount),
                        token: "STT",
                        timestamp: new Date().toISOString(),
                        userAddress: address,
                    }

                    // Mock Glacia Labs messaging
                    const response = await fetch("/api/glacia-message", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(messageData),
                    })

                    if (response.ok) {
                        const { messageId } = await response.json()
                        toast.success("Message sent via Glacia Labs")

                        // Add transaction to history
                        const transaction: Transaction = {
                            id: Date.now().toString(),
                            type: "deposit",
                            amount,
                            token: "STT",
                            txHash: "pending",
                            timestamp: new Date().toISOString(),
                            snapshotRootHash: messageId,
                        }
                        setTransactions(prev => [transaction, ...prev])
                    } else {
                        toast.error("Error sending Glacia message")
                    }
                } catch (error) {
                    console.error("Glacia message error:", error)
                    toast.error("Error sending Glacia message")
                }
            }

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
                address: CONTRACTS.POOL as `0x${string}`,
                abi: SimpleRebaseTokenPoolABI,
                functionName: 'withdrawSTTForRebaseTokens',
                args: [amountInWei],
            })

            // Send Glacia Labs message
            if (storeSnapshot) {
                try {
                    const messageData = {
                        txHash: "pending", // Will be updated when transaction is confirmed
                        chainUid: chainId,
                        amount: parseFloat(amount),
                        token: "RBT",
                        timestamp: new Date().toISOString(),
                        userAddress: address,
                    }

                    // Mock Glacia Labs messaging
                    const response = await fetch("/api/glacia-message", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(messageData),
                    })

                    if (response.ok) {
                        const { messageId } = await response.json()
                        toast.success("Message sent via Glacia Labs")

                        // Add transaction to history
                        const transaction: Transaction = {
                            id: Date.now().toString(),
                            type: "withdraw",
                            amount,
                            token: "RBT",
                            txHash: "pending",
                            timestamp: new Date().toISOString(),
                            snapshotRootHash: messageId,
                        }
                        setTransactions(prev => [transaction, ...prev])
                    } else {
                        toast.error("Error sending Glacia message")
                    }
                } catch (error) {
                    console.error("Glacia message error:", error)
                    toast.error("Error sending Glacia message")
                }
            }

            toast.dismiss(loadingToast)
            toast.success("Transaction confirmed!")
            setAmount("")

            // Refetch balances after successful withdrawal
            setTimeout(() => {
                refetchRBTBalance()
                refetchVaultBalance()
                refetchTotalSupply()
                refetchPoolBalance()
            }, 2000)

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

    const handleRescueStuckFunds = async () => {
        if (!poolBalance || (poolBalance as bigint) === BigInt(0)) {
            toast.error('No stuck funds to rescue')
            return
        }

        setIsLoading(true)
        try {
            const loadingToast = toast.loading("Rescuing stuck funds...")

            writeContract({
                address: CONTRACTS.POOL as `0x${string}`,
                abi: SimpleRebaseTokenPoolABI,
                functionName: 'rescueStuckSTT',
            })

            toast.dismiss(loadingToast)
            toast.success("Stuck funds rescued successfully!")

            // Refetch balances
            setTimeout(() => {
                refetchVaultBalance()
                refetchPoolBalance()
            }, 2000)

        } catch (error) {
            console.error('Rescue error:', error)
            toast.error('Rescue failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isConnected) {
        return (
            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-purple-50">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-purple-900">Connect Wallet</CardTitle>
                    <CardDescription className="text-purple-600">Please connect your wallet to use the vault</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (!isCorrectNetwork) {
        return (
            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-purple-50">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-purple-900">Wrong Network</CardTitle>
                    <CardDescription className="text-purple-600">Please switch to Somnia Testnet</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={handleSwitchToSomnia}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all"
                    >
                        Switch to Somnia Testnet
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Deposit/Withdraw Interface - Moved to top */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-purple-50">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-3xl font-bold text-purple-900 text-left">Vault Operations</CardTitle>
                            <CardDescription className="text-purple-600 text-left text-lg">Deposit or withdraw tokens from the vault</CardDescription>
                        </div>
                        <Button
                            onClick={() => router.push('/dashboard/history')}
                            variant="outline"
                            className="flex items-center space-x-2 border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                            <History className="w-4 h-4" />
                            <span>View History</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8">
                            <TabsTrigger
                                value="deposit"
                                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-left pl-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <ArrowDownRight className="w-5 h-5" />
                                    <span className="text-lg">Deposit</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="withdraw"
                                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-left pl-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <ArrowUpRight className="w-5 h-5" />
                                    <span className="text-lg">Withdraw</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="staking"
                                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-left pl-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <Crown className="w-5 h-5" />
                                    <span className="text-lg">Governance</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="deposit" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-lg font-medium text-purple-900 mb-3 text-left">
                                        Amount (STT)
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.0"
                                            disabled={isLoading || isPending}
                                            className="flex-1 px-4 py-4 text-lg border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 bg-white"
                                        />
                                        <Button
                                            onClick={handleMaxDeposit}
                                            disabled={isLoading || isPending}
                                            variant="outline"
                                            className="px-8 text-lg rounded-xl border-purple-200 text-purple-600 hover:bg-purple-50"
                                        >
                                            Max
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-purple-100">
                                    <div className="flex items-center space-x-3">
                                        <Database className="w-6 h-6 text-purple-600" />
                                        <span className="text-lg font-medium text-purple-900">Send Glacia Labs Message</span>
                                    </div>
                                    <Switch
                                        checked={storeSnapshot}
                                        onCheckedChange={setStoreSnapshot}
                                        disabled={isLoading || isPending}
                                        className="data-[state=checked]:bg-purple-600"
                                    />
                                </div>

                                <Button
                                    onClick={handleDeposit}
                                    disabled={isLoading || isPending || isConfirming || !amount || parseFloat(amount) <= 0}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-7 text-lg transition-all"
                                >
                                    {isLoading || isPending ? (
                                        <>
                                            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                            <span className="text-lg">Processing...</span>
                                        </>
                                    ) : isConfirming ? (
                                        <>
                                            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                            <span className="text-lg">Confirming...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ArrowDownRight className="w-6 h-6 mr-2" />
                                            <span className="text-lg">Deposit STT</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="withdraw" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-lg font-medium text-purple-900 mb-3 text-left">
                                        Amount (RBT)
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.0"
                                            disabled={isLoading || isPending}
                                            className="flex-1 px-4 py-4 text-lg border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 bg-white"
                                        />
                                        <Button
                                            onClick={handleMaxWithdraw}
                                            disabled={isLoading || isPending}
                                            variant="outline"
                                            className="px-8 text-lg rounded-xl border-purple-200 text-purple-600 hover:bg-purple-50"
                                        >
                                            Max
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-purple-100">
                                    <div className="flex items-center space-x-3">
                                        <Database className="w-6 h-6 text-purple-600" />
                                        <span className="text-lg font-medium text-purple-900">Send Glacia Labs Message</span>
                                    </div>
                                    <Switch
                                        checked={storeSnapshot}
                                        onCheckedChange={setStoreSnapshot}
                                        disabled={isLoading || isPending}
                                        className="data-[state=checked]:bg-purple-600"
                                    />
                                </div>

                                <Button
                                    onClick={handleWithdraw}
                                    disabled={isLoading || isPending || !amount || parseFloat(amount) <= 0}
                                    className="w-full border-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl py-7 text-lg transition-all"
                                >
                                    {isLoading || isPending ? (
                                        <>
                                            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                            <span className="text-lg">Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ArrowUpRight className="w-6 h-6 mr-2" />
                                            <span className="text-lg">Withdraw STT</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="staking" className="space-y-4">
                            <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                                <div className="text-center mb-4">
                                    <Crown className="w-16 h-16 text-yellow-600 mx-auto mb-3" />
                                    <h3 className="text-2xl font-bold text-purple-900 mb-2">Governance & Staking</h3>
                                    <p className="text-purple-600">
                                        Stake your RBT tokens to participate in governance and earn rewards
                                    </p>
                                </div>
                                <StakingInterface />
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Balance Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-purple-50">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-purple-900 text-left">Your Balances</CardTitle>
                        <CardDescription className="text-purple-600 text-left">Available tokens</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                            <p className="text-sm text-purple-600 mb-2 text-left">STT Balance</p>
                            <p className="text-2xl font-bold text-purple-900 text-left">
                                {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : "0.0000 STT"}
                            </p>
                        </div>
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                            <p className="text-sm text-purple-600 mb-2 text-left">RBT Balance</p>
                            <p className="text-2xl font-bold text-purple-900 text-left">
                                {userRBTBalance ? `${parseFloat(formatEther(userRBTBalance as bigint)).toFixed(6)} RBT` : "0.000000 RBT"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Vault Statistics */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-purple-50">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-purple-900 text-left">Vault Statistics</CardTitle>
                        <CardDescription className="text-purple-600 text-left">Current performance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                            <p className="text-sm text-purple-600 mb-2 text-left">Vault Balance</p>
                            <p className="text-2xl font-bold text-purple-900 text-left">
                                {vaultBalance ? `${parseFloat(formatEther(vaultBalance as bigint)).toFixed(4)} STT` : "0.0000 STT"}
                            </p>
                        </div>
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                            <p className="text-sm text-purple-600 mb-2 text-left">Total RBT Supply</p>
                            <p className="text-2xl font-bold text-purple-900 text-left">
                                {rbtTotalSupply ? `${parseFloat(formatEther(rbtTotalSupply as bigint)).toFixed(6)} RBT` : "0.000000 RBT"}
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl shadow-sm border ${poolBalance && (poolBalance as bigint) > BigInt(0) ? 'bg-red-50 border-red-200' : 'bg-white border-purple-100'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-600 mb-2 text-left">Pool Balance</p>
                                    <p className="text-2xl font-bold text-purple-900 text-left">
                                        {poolBalance ? `${parseFloat(formatEther(poolBalance as bigint)).toFixed(6)} STT` : "0.000000 STT"}
                                    </p>
                                    {poolBalance && (poolBalance as bigint) > BigInt(0) ? (
                                        <p className="text-xs text-red-600 mt-1">⚠️ Stuck funds detected</p>
                                    ) : null}
                                </div>
                                {poolBalance && (poolBalance as bigint) > BigInt(0) ? (
                                    <Button
                                        onClick={handleRescueStuckFunds}
                                        disabled={isLoading || isPending}
                                        className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                                    >
                                        Rescue
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            {transactions.length > 0 && (
                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-purple-50">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-purple-900">Recent Transactions</CardTitle>
                        <CardDescription className="text-purple-600">Your latest vault operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {transactions.slice(0, 5).map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-purple-100 hover:border-purple-200 transition-all">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "deposit" ? "bg-purple-100 text-purple-600" : "bg-red-100 text-red-600"
                                            }`}>
                                            {tx.type === "deposit" ? (
                                                <ArrowDownRight className="w-5 h-5" />
                                            ) : (
                                                <ArrowUpRight className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-purple-900 capitalize">{tx.type}</p>
                                            <p className="text-sm text-purple-600">
                                                {new Date(tx.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-purple-900">{tx.amount} {tx.token}</p>
                                        <p className="text-xs text-purple-600 font-mono">
                                            {tx.txHash === "pending" ? "Pending..." : `${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-8)}`}
                                        </p>
                                        {tx.snapshotRootHash && (
                                            <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-600 hover:bg-purple-200">
                                                Glacia Labs Message
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