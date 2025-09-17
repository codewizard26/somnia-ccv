"use client"

import StakingInterface from "@/components/StakingInterface"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function StakingPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Staking</h1>
                <p className="text-gray-600 mt-2">Stake RBT tokens and view your governance metrics</p>
            </div>

            <Card className="rounded-2xl border border-gray-200 shadow-md bg-white">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl text-gray-900">Governance & Staking</CardTitle>
                    <CardDescription className="text-gray-600">Manage your stake to gain voting power</CardDescription>
                </CardHeader>
                <CardContent>
                    <StakingInterface />
                </CardContent>
            </Card>
        </div>
    )
}


