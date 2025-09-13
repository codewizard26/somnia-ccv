"use client"

import { useState, useEffect } from "react"
import { useAccount, useBalance, useChainId, useReadContract, useWriteContract, useSwitchChain } from "wagmi"
import { parseEther, formatEther } from "viem"
import { Coins, TrendingUp, Vote, Loader2, Lock, Unlock, Crown, BarChart3, Users } from "lucide-react"
import toast from "react-hot-toast"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CONTRACTS, NETWORKS } from "@/config/contracts"
import RebaseTokenABI from "@/contracts/RebaseToken.json"
import SimpleRebaseTokenPoolABI from "@/contracts/SimpleRebaseTokenPool.json"



interface StakingStats {
    totalStaked: string
    userStaked: string
    userBalance: string
    governancePower: string
    votingWeight: string
    rewardRate: string
    estimatedAPY: string
}

export default function StakingInterface() {
    const { address, isConnected } = useAccount()
    const chainId = useChainId()
    const { switchChain } = useSwitchChain()
    const [activeTab, setActiveTab] = useState("stake")
    const [amount, setAmount] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [needsApproval, setNeedsApproval] = useState(false)

    const { writeContract, isPending } = useWriteContract()

    // Read user's RBT balance
    const { data: userRBTBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACTS.REBASE_TOKEN as `0x${string}`,
        abi: RebaseTokenABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
        query: {
            enabled: !!address,
        },
    })

    // Read user's staked balance
    const { data: userStakedBalance, refetch: refetchStaked } = useReadContract({
        address: CONTRACTS.POOL as `0x${string}`,
        abi: SimpleRebaseTokenPoolABI,
        functionName: 'stakedBalances',
        args: [address as `0x${string}`],
        query: {
            enabled: !!address && !!CONTRACTS.POOL,
        },
    })

    // Read total staked amount
    const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({
        address: CONTRACTS.POOL as `0x${string}`,
        abi: SimpleRebaseTokenPoolABI,
        functionName: 'totalStaked',
        query: {
            enabled: !!CONTRACTS.POOL,
        },
    })

    // Read RBT total supply
    const { data: totalSupply } = useReadContract({
        address: CONTRACTS.REBASE_TOKEN as `0x${string}`,
        abi: RebaseTokenABI,
        functionName: 'totalSupply',
    })

    // Read reward rate
    const { data: rewardRate } = useReadContract({
        address: CONTRACTS.POOL as `0x${string}`,
        abi: SimpleRebaseTokenPoolABI,
        functionName: 'rewardRate',
        query: {
            enabled: !!CONTRACTS.POOL,
        },
    })

    // Read allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: CONTRACTS.REBASE_TOKEN as `0x${string}`,
        abi: RebaseTokenABI,
        functionName: 'allowance',
        args: [address as `0x${string}`, CONTRACTS.POOL as `0x${string}`],
        query: {
            enabled: !!address && !!CONTRACTS.POOL,
        },
    })

    const isCorrectNetwork = chainId === NETWORKS.SOMNIA.id

    // Calculate staking statistics
    const stakingStats: StakingStats = {
        totalStaked: totalStaked ? formatEther(totalStaked as bigint) : "0",
        userStaked: userStakedBalance ? formatEther(userStakedBalance as bigint) : "0",
        userBalance: userRBTBalance ? formatEther(userRBTBalance as bigint) : "0",
        governancePower: calculateGovernancePower(),
        votingWeight: calculateVotingWeight(),
        rewardRate: rewardRate ? formatEther(rewardRate as bigint) : "0",
        estimatedAPY: calculateEstimatedAPY(),
    }

    function calculateGovernancePower(): string {
        if (!userStakedBalance || !totalSupply) return "0"
        const staked = parseFloat(formatEther(userStakedBalance as bigint))
        const supply = parseFloat(formatEther(totalSupply as bigint))
        return supply > 0 ? ((staked / supply) * 100).toFixed(4) : "0"
    }

    function calculateVotingWeight(): string {
        if (!userStakedBalance || !totalStaked) return "0"
        const userStake = parseFloat(formatEther(userStakedBalance as bigint))
        const totalStake = parseFloat(formatEther(totalStaked as bigint))
        return totalStake > 0 ? ((userStake / totalStake) * 100).toFixed(4) : "0"
    }

    function calculateEstimatedAPY(): string {
        if (!rewardRate || !totalStaked) return "0"
        const rate = parseFloat(formatEther(rewardRate as bigint))
        const staked = parseFloat(formatEther(totalStaked as bigint))
        if (staked === 0) return "0"

        // Calculate APY: (reward rate per second * seconds per year) / total staked * 100
        const secondsPerYear = 365 * 24 * 60 * 60
        const annualRewards = rate * secondsPerYear
        const apy = (annualRewards / staked) * 100
        return apy.toFixed(2)
    }

    // Check if approval is needed
    useEffect(() => {
        if (amount && allowance) {
            const amountBigInt = parseEther(amount)
            setNeedsApproval(amountBigInt > (allowance as bigint))
        } else {
            setNeedsApproval(false)
        }
    }, [amount, allowance])

    const handleSwitchToSomnia = async () => {
        try {
            await switchChain({ chainId: NETWORKS.SOMNIA.id })
        } catch (error) {
            console.error('Failed to switch chain:', error)
        }
    }

    const handleApprove = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount')
            return
        }

        setIsLoading(true)
        try {
            const loadingToast = toast.loading("Approving tokens...")
            const amountInWei = parseEther(amount)

            writeContract({
                address: CONTRACTS.REBASE_TOKEN as `0x${string}`,
                abi: RebaseTokenABI,
                functionName: 'approve',
                args: [CONTRACTS.POOL as `0x${string}`, amountInWei],
            })

            toast.dismiss(loadingToast)
            toast.success("Tokens approved successfully!")

            // Refetch allowance
            setTimeout(() => {
                refetchAllowance()
            }, 2000)

        } catch (error) {
            console.error('Approval error:', error)
            toast.error('Approval failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleStake = async () => {
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
            const loadingToast = toast.loading("Staking tokens...")
            const amountInWei = parseEther(amount)

            writeContract({
                address: CONTRACTS.POOL as `0x${string}`,
                abi: SimpleRebaseTokenPoolABI,
                functionName: 'stake',
                args: [amountInWei],
            })

            toast.dismiss(loadingToast)
            toast.success("Tokens staked successfully!")
            setAmount("")

            // Refetch balances
            setTimeout(() => {
                refetchBalance()
                refetchStaked()
                refetchTotalStaked()
            }, 2000)

        } catch (error) {
            console.error('Staking error:', error)
            toast.error('Staking failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUnstake = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount')
            return
        }

        if (!userStakedBalance || parseFloat(formatEther(userStakedBalance as bigint)) < parseFloat(amount)) {
            toast.error('Insufficient staked balance')
            return
        }

        setIsLoading(true)
        try {
            const loadingToast = toast.loading("Unstaking tokens...")
            const amountInWei = parseEther(amount)

            writeContract({
                address: CONTRACTS.POOL as `0x${string}`,
                abi: SimpleRebaseTokenPoolABI,
                functionName: 'unstake',
                args: [amountInWei],
            })

            toast.dismiss(loadingToast)
            toast.success("Tokens unstaked successfully!")
            setAmount("")

            // Refetch balances
            setTimeout(() => {
                refetchBalance()
                refetchStaked()
                refetchTotalStaked()
            }, 2000)

        } catch (error) {
            console.error('Unstaking error:', error)
            toast.error('Unstaking failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleMaxStake = () => {
        if (userRBTBalance) {
            setAmount(formatEther(userRBTBalance as bigint))
        }
    }

    const handleMaxUnstake = () => {
        if (userStakedBalance) {
            setAmount(formatEther(userStakedBalance as bigint))
        }
    }

    if (!isConnected) {
        return (
            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-blue-900">Connect Wallet</CardTitle>
                    <CardDescription className="text-blue-600">Please connect your wallet to access staking</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (!isCorrectNetwork) {
        return (
            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-blue-900">Wrong Network</CardTitle>
                    <CardDescription className="text-blue-600">Please switch to Somnia Testnet</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={handleSwitchToSomnia}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all"
                    >
                        Switch to Somnia Testnet
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Governance Power Overview */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="space-y-1">
                    <div className="flex items-center space-x-3">
                        <Crown className="w-8 h-8 text-yellow-600" />
                        <div>
                            <CardTitle className="text-3xl font-bold text-blue-900">Governance Dashboard</CardTitle>
                            <CardDescription className="text-blue-600 text-lg">Your voting power and staking rewards</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white rounded-xl border border-blue-100">
                            <div className="flex items-center space-x-2 mb-2">
                                <Vote className="w-5 h-5 text-blue-600" />
                                <p className="text-sm text-blue-600">Governance Power</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-900">{stakingStats.governancePower}%</p>
                            <p className="text-xs text-blue-500">of total supply</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-blue-100">
                            <div className="flex items-center space-x-2 mb-2">
                                <Users className="w-5 h-5 text-green-600" />
                                <p className="text-sm text-green-600">Voting Weight</p>
                            </div>
                            <p className="text-2xl font-bold text-green-900">{stakingStats.votingWeight}%</p>
                            <p className="text-xs text-green-500">of staked tokens</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-blue-100">
                            <div className="flex items-center space-x-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                                <p className="text-sm text-purple-600">Estimated APY</p>
                            </div>
                            <p className="text-2xl font-bold text-purple-900">{stakingStats.estimatedAPY}%</p>
                            <p className="text-xs text-purple-500">annual yield</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-blue-100">
                            <div className="flex items-center space-x-2 mb-2">
                                <Lock className="w-5 h-5 text-orange-600" />
                                <p className="text-sm text-orange-600">Your Stake</p>
                            </div>
                            <p className="text-2xl font-bold text-orange-900">{parseFloat(stakingStats.userStaked).toFixed(4)}</p>
                            <p className="text-xs text-orange-500">RBT staked</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Staking Interface */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold text-blue-900">Staking Operations</CardTitle>
                    <CardDescription className="text-blue-600 text-lg">Stake RBT tokens to gain governance power</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger
                                value="stake"
                                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                            >
                                <div className="flex items-center space-x-2">
                                    <Lock className="w-5 h-5" />
                                    <span className="text-lg">Stake</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="unstake"
                                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                            >
                                <div className="flex items-center space-x-2">
                                    <Unlock className="w-5 h-5" />
                                    <span className="text-lg">Unstake</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="stake" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-lg font-medium text-blue-900 mb-3">
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
                                            onClick={handleMaxStake}
                                            disabled={isLoading || isPending}
                                            variant="outline"
                                            className="px-8 text-lg rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
                                        >
                                            Max
                                        </Button>
                                    </div>
                                    <p className="text-sm text-blue-600 mt-2">
                                        Available: {parseFloat(stakingStats.userBalance).toFixed(6)} RBT
                                    </p>
                                </div>

                                {needsApproval ? (
                                    <Button
                                        onClick={handleApprove}
                                        disabled={isLoading || isPending || !amount || parseFloat(amount) <= 0}
                                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl py-7 text-lg transition-all"
                                    >
                                        {isLoading || isPending ? (
                                            <>
                                                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                                <span className="text-lg">Approving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Coins className="w-6 h-6 mr-2" />
                                                <span className="text-lg">Approve RBT</span>
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleStake}
                                        disabled={isLoading || isPending || !amount || parseFloat(amount) <= 0}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-7 text-lg transition-all"
                                    >
                                        {isLoading || isPending ? (
                                            <>
                                                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                                <span className="text-lg">Staking...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-6 h-6 mr-2" />
                                                <span className="text-lg">Stake RBT</span>
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="unstake" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-lg font-medium text-blue-900 mb-3">
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
                                            onClick={handleMaxUnstake}
                                            disabled={isLoading || isPending}
                                            variant="outline"
                                            className="px-8 text-lg rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
                                        >
                                            Max
                                        </Button>
                                    </div>
                                    <p className="text-sm text-blue-600 mt-2">
                                        Staked: {parseFloat(stakingStats.userStaked).toFixed(6)} RBT
                                    </p>
                                </div>

                                <Button
                                    onClick={handleUnstake}
                                    disabled={isLoading || isPending || !amount || parseFloat(amount) <= 0}
                                    className="w-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl py-7 text-lg transition-all"
                                >
                                    {isLoading || isPending ? (
                                        <>
                                            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                            <span className="text-lg">Unstaking...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Unlock className="w-6 h-6 mr-2" />
                                            <span className="text-lg">Unstake RBT</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Staking Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-blue-900">Your Staking Stats</CardTitle>
                        <CardDescription className="text-blue-600">Personal staking overview</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-white rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-600 mb-2">RBT Balance</p>
                            <p className="text-2xl font-bold text-blue-900">
                                {parseFloat(stakingStats.userBalance).toFixed(6)} RBT
                            </p>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-600 mb-2">Staked Balance</p>
                            <p className="text-2xl font-bold text-blue-900">
                                {parseFloat(stakingStats.userStaked).toFixed(6)} RBT
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-blue-900">Protocol Statistics</CardTitle>
                        <CardDescription className="text-blue-600">Overall protocol metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-white rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-600 mb-2">Total Staked</p>
                            <p className="text-2xl font-bold text-blue-900">
                                {parseFloat(stakingStats.totalStaked).toFixed(6)} RBT
                            </p>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-600 mb-2">Reward Rate</p>
                            <p className="text-2xl font-bold text-blue-900">
                                {parseFloat(stakingStats.rewardRate).toFixed(8)} RBT/sec
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Governance Power Visualization */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="space-y-1">
                    <div className="flex items-center space-x-3">
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                        <div>
                            <CardTitle className="text-2xl text-blue-900">Governance Power Breakdown</CardTitle>
                            <CardDescription className="text-blue-600">Understanding your voting influence</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-white rounded-xl border border-blue-100">
                                <h4 className="font-semibold text-blue-900 mb-3">Governance Power</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Your Staked RBT:</span>
                                        <span className="font-medium">{parseFloat(stakingStats.userStaked).toFixed(6)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Total RBT Supply:</span>
                                        <span className="font-medium">{totalSupply ? parseFloat(formatEther(totalSupply as bigint)).toFixed(6) : "0"}</span>
                                    </div>
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between">
                                            <span className="text-blue-900 font-semibold">Governance Power:</span>
                                            <span className="font-bold text-blue-900">{stakingStats.governancePower}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-white rounded-xl border border-blue-100">
                                <h4 className="font-semibold text-blue-900 mb-3">Voting Weight</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Your Staked RBT:</span>
                                        <span className="font-medium">{parseFloat(stakingStats.userStaked).toFixed(6)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Total Staked:</span>
                                        <span className="font-medium">{parseFloat(stakingStats.totalStaked).toFixed(6)}</span>
                                    </div>
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between">
                                            <span className="text-blue-900 font-semibold">Voting Weight:</span>
                                            <span className="font-bold text-blue-900">{stakingStats.votingWeight}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                        <div className="flex items-center space-x-2 mb-2">
                            <Crown className="w-5 h-5 text-yellow-600" />
                            <h4 className="font-semibold text-blue-900">Governance Benefits</h4>
                        </div>
                        <ul className="space-y-1 text-blue-700">
                            <li>• Vote on protocol upgrades and parameter changes</li>
                            <li>• Propose new features and improvements</li>
                            <li>• Earn staking rewards while participating in governance</li>
                            <li>• Higher stake = more voting power and influence</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
