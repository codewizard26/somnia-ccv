import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

export interface DatabaseDeposit {
    id: number
    user_address: string
    amount: number
    tx_hash: string
    created_at: string
}

export function useDeposits() {
    const [deposits, setDeposits] = useState<DatabaseDeposit[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const { address } = useAccount()

    const fetchDeposits = async (userAddress?: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const url = userAddress
                ? `/api/deposits?user=${userAddress}`
                : '/api/deposits'

            const response = await fetch(url)
            const data = await response.json()

            if (data.success) {
                setDeposits(data.deposits)
            } else {
                throw new Error(data.error || 'Failed to fetch deposits')
            }
        } catch (err) {
            console.error('Error fetching deposits:', err)
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (address) {
            fetchDeposits(address)
        }
    }, [address])

    return {
        deposits,
        isLoading,
        error,
        refetch: () => fetchDeposits(address)
    }
}
