import { useState, useEffect } from 'react'
import { usePublicClient, useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACTS } from '@/config/contracts'
import VaultABI from '@/contracts/Vault.json'

export interface VaultEvent {
    id: string
    type: 'deposit' | 'redeem'
    user: string
    sttAmount: string
    rebaseTokenAmount: string
    blockNumber: bigint
    transactionHash: string
    timestamp: number
}

export function useVaultEvents(fromBlock?: bigint, toBlock?: bigint) {
    const [events, setEvents] = useState<VaultEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [hasMoreEvents, setHasMoreEvents] = useState(true)
    const [oldestBlock, setOldestBlock] = useState<bigint | null>(null)
    const publicClient = usePublicClient()
    const { address } = useAccount()

    useEffect(() => {
        const fetchEvents = async () => {
            if (!publicClient || !CONTRACTS.VAULT) return

            setIsLoading(true)
            setError(null)

            try {
                // Get current block number to limit the range
                const currentBlock = await publicClient.getBlockNumber()

                // Start from a reasonable block range (last 500 blocks or deployment block)
                // Using 500 blocks to stay well under the 1000 block RPC limit
                const deploymentBlock = BigInt(175232279) // From deployment-info.json
                const startBlock = fromBlock || (currentBlock > BigInt(500) ? currentBlock - BigInt(500) : deploymentBlock)
                const endBlock = toBlock || currentBlock

                console.log(`Fetching events from block ${startBlock} to ${endBlock}`)

                // Helper function to fetch events with chunking if needed
                const fetchEventsWithChunking = async (eventName: string, eventInputs: any[]) => {
                    try {
                        // Try to fetch all events at once first
                        return await publicClient.getLogs({
                            address: CONTRACTS.VAULT as `0x${string}`,
                            event: {
                                type: 'event',
                                name: eventName,
                                inputs: eventInputs
                            },
                            fromBlock: startBlock,
                            toBlock: endBlock
                        })
                    } catch (error: any) {
                        // If the range is too large, try fetching in smaller chunks
                        if (error.message?.includes('block range exceeds') || error.message?.includes('1000')) {
                            console.log(`Block range too large, fetching ${eventName} events in chunks...`)
                            const chunkSize = BigInt(500) // Smaller chunk size
                            const allLogs: any[] = []

                            for (let block = startBlock; block <= endBlock; block += chunkSize) {
                                const chunkEnd = block + chunkSize > endBlock ? endBlock : block + chunkSize
                                try {
                                    const chunkLogs = await publicClient.getLogs({
                                        address: CONTRACTS.VAULT as `0x${string}`,
                                        event: {
                                            type: 'event',
                                            name: eventName,
                                            inputs: eventInputs
                                        },
                                        fromBlock: block,
                                        toBlock: chunkEnd
                                    })
                                    allLogs.push(...chunkLogs)
                                } catch (chunkError) {
                                    console.warn(`Failed to fetch chunk from ${block} to ${chunkEnd}:`, chunkError)
                                }
                            }
                            return allLogs
                        }
                        throw error
                    }
                }

                // Get Deposit events
                const depositLogs = await fetchEventsWithChunking('Deposit', [
                    { name: 'user', type: 'address', indexed: true },
                    { name: 'sttAmount', type: 'uint256', indexed: false },
                    { name: 'rebaseTokenAmount', type: 'uint256', indexed: false }
                ])

                // Get Redeem events
                const redeemLogs = await fetchEventsWithChunking('Redeem', [
                    { name: 'user', type: 'address', indexed: true },
                    { name: 'sttAmount', type: 'uint256', indexed: false },
                    { name: 'rebaseTokenAmount', type: 'uint256', indexed: false }
                ])

                // Transform events to our format
                const transformedEvents: VaultEvent[] = []

                // Process deposit events
                for (const log of depositLogs) {
                    const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
                    transformedEvents.push({
                        id: `${log.transactionHash}-${log.logIndex}`,
                        type: 'deposit',
                        user: log.args.user,
                        sttAmount: formatEther(log.args.sttAmount),
                        rebaseTokenAmount: formatEther(log.args.rebaseTokenAmount),
                        blockNumber: log.blockNumber,
                        transactionHash: log.transactionHash,
                        timestamp: Number(block.timestamp),
                    })
                }

                // Process redeem events
                for (const log of redeemLogs) {
                    const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
                    transformedEvents.push({
                        id: `${log.transactionHash}-${log.logIndex}`,
                        type: 'redeem',
                        user: log.args.user,
                        sttAmount: formatEther(log.args.sttAmount),
                        rebaseTokenAmount: formatEther(log.args.rebaseTokenAmount),
                        blockNumber: log.blockNumber,
                        transactionHash: log.transactionHash,
                        timestamp: Number(block.timestamp),
                    })
                }

                // Sort by block number (newest first)
                transformedEvents.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber))

                setEvents(transformedEvents)
            } catch (err) {
                console.error('Error fetching vault events:', err)
                setError(err as Error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchEvents()
    }, [publicClient, fromBlock, toBlock, address])

    return {
        events,
        isLoading,
        error,
        hasMoreEvents,
        oldestBlock
    }
}
