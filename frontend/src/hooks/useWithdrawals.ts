import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

export interface DatabaseWithdrawal {
    id: number
    user_address: string
    amount: number
    tx_hash: string
    created_at: string
}

export function useWithdrawals() {
    const [withdrawals, setWithdrawals] = useState<DatabaseWithdrawal[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const { address } = useAccount()

    const fetchWithdrawals = async (userAddress?: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const url = userAddress
                ? `/api/withdrawals?user=${userAddress}`
                : '/api/withdrawals'

            const response = await fetch(url)
            const data = await response.json()

            if (data.success) {
                setWithdrawals(data.withdrawals)
            } else {
                throw new Error(data.error || 'Failed to fetch withdrawals')
            }
        } catch (err) {
            console.error('Error fetching withdrawals:', err)
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (address) {
            fetchWithdrawals(address)
        }
    }, [address])

    return {
        withdrawals,
        isLoading,
        error,
        refetch: () => fetchWithdrawals(address)
    }
}


