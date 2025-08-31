"use client"

import { useState } from "react"
import {
    BarChart3,
    TrendingUp,
    Users,
    ArrowUpRight,
    Timer,
    AlertCircle,
} from "lucide-react"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// ---------------- Mock Data ----------------
const mockTVLData = [
    { date: "Aug 1", value: 1000000 },
    { date: "Aug 8", value: 1250000 },
    { date: "Aug 15", value: 1150000 },
    { date: "Aug 22", value: 1400000 },
    { date: "Aug 29", value: 1600000 },
]

const mockDepositsWithdrawals = [
    { date: "Aug 25", deposits: 150000, withdrawals: 50000 },
    { date: "Aug 26", deposits: 200000, withdrawals: 75000 },
    { date: "Aug 27", deposits: 180000, withdrawals: 60000 },
    { date: "Aug 28", deposits: 250000, withdrawals: 80000 },
    { date: "Aug 29", deposits: 300000, withdrawals: 100000 },
]

const mockRebaseTokenData = [
    { date: "Aug 1", supply: 1000000, tvl: 1000000 },
    { date: "Aug 8", supply: 1050000, tvl: 1250000 },
    { date: "Aug 15", supply: 1100000, tvl: 1150000 },
    { date: "Aug 22", supply: 1150000, tvl: 1400000 },
    { date: "Aug 29", supply: 1200000, tvl: 1600000 },
]

const mockDistributionData = [
    { name: "Top 3 Whales", value: 45 },
    { name: "Next 7 Large Holders", value: 25 },
    { name: "Other Holders", value: 30 },
]

const COLORS = ["#3B82F6", "#60A5FA", "#93C5FD"]

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

// ---------------- Component ----------------
export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState("1M") // 1D, 1W, 1M, 3M, All

    return (
        <div className="p-6 space-y-6">
            {/* ---- Info Note ---- */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Demo Data</p>
                            <p className="text-sm text-blue-700">
                                The analytics shown here are using mock data for demonstration. Live data will be integrated once the 0G storage layer is connected.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ---- Overview Cards ---- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* TVL */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Value Locked</p>
                                <h3 className="text-2xl font-bold text-gray-900">$1.6M</h3>
                                <p className="mt-1 text-sm text-green-600 flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    +15.3%
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Depositors */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Active Depositors</p>
                                <h3 className="text-2xl font-bold text-gray-900">156</h3>
                                <p className="mt-1 text-sm text-green-600 flex items-center">
                                    <ArrowUpRight className="w-4 h-4 mr-1" />
                                    +23 this week
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Deposits/Withdrawals */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Deposits</p>
                                <h3 className="text-2xl font-bold text-gray-900">$2.5M</h3>
                                <p className="mt-1 text-sm text-gray-600">$350K withdrawn</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ArrowUpRight className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* APY */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Current APY</p>
                                <h3 className="text-2xl font-bold text-gray-900">8.5%</h3>
                                <p className="mt-1 text-sm text-green-600 flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    +0.5% this week
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Timer className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ---- Vault Growth ---- */}
            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <CardTitle>Vault Growth</CardTitle>
                    <div className="flex space-x-2 mt-2 md:mt-0">
                        {["1D", "1W", "1M", "3M", "All"].map((range) => (
                            <Button
                                key={range}
                                variant={timeRange === range ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTimeRange(range)}
                            >
                                {range}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockTVLData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Line type="monotone" dataKey="value" name="TVL" stroke="#3B82F6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* ---- Deposits vs Withdrawals + User Distribution ---- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Deposits vs Withdrawals */}
                <Card>
                    <CardHeader>
                        <CardTitle>Deposits vs Withdrawals</CardTitle>
                        <CardDescription>Daily activity for the last 5 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={mockDepositsWithdrawals}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                    <Bar dataKey="deposits" name="Deposits" fill="#3B82F6" />
                                    <Bar dataKey="withdrawals" name="Withdrawals" fill="#EF4444" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* User Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Distribution</CardTitle>
                        <CardDescription>Concentration of funds by holder type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={mockDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        nameKey="name"
                                        label
                                    >
                                        {mockDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ---- Rebase Token Performance ---- */}
            <Card>
                <CardHeader>
                    <CardTitle>Rebase Token Performance</CardTitle>
                    <CardDescription>Token supply growth vs vault TVL</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockRebaseTokenData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickFormatter={(value) => formatCurrency(value)}
                                />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="supply" name="Token Supply" stroke="#3B82F6" strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="tvl" name="TVL" stroke="#60A5FA" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* ---- Risk / Behavior Insights ---- */}
            <Card>
                <CardHeader>
                    <CardTitle>AI Risk Insights</CardTitle>
                    <CardDescription>Powered by 0G Compute</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            {
                                message: "Unusual large withdrawal detected in last 24h",
                                type: "warning",
                            },
                            {
                                message: "TVL grew by 15% this week due to 3 new large depositors",
                                type: "info",
                            },
                            {
                                message: "Vault is 80% concentrated in top 5 addresses",
                                type: "alert",
                            },
                        ].map((insight, index) => (
                            <div
                                key={index}
                                className={`flex items-start space-x-4 p-4 rounded-lg ${insight.type === "warning"
                                    ? "bg-yellow-50"
                                    : insight.type === "alert"
                                        ? "bg-red-50"
                                        : "bg-blue-50"
                                    }`}
                            >
                                <AlertCircle
                                    className={`w-5 h-5 mt-0.5 ${insight.type === "warning"
                                        ? "text-yellow-600"
                                        : insight.type === "alert"
                                            ? "text-red-600"
                                            : "text-blue-600"
                                        }`}
                                />
                                <p className="text-sm">{insight.message}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
