'use client';

import { useAccount, useChainId, useBalance } from 'wagmi';
import { NETWORKS } from '@/config/contracts';

export default function NetworkDebug() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { data: balance } = useBalance({ address });

    return (
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <span className="text-blue-400">🔧</span>
                <span>Network Debug Info</span>
            </h3>

            <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Wallet Connected:</span>
                    <span className={`font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                        {isConnected ? '✅ Yes' : '❌ No'}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Wallet Address:</span>
                    <span className="font-mono text-xs text-blue-400">
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Current Chain ID:</span>
                    <span className="font-medium text-white">
                        {chainId ? chainId.toString() : 'Unknown'}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Expected Chain ID:</span>
                    <span className="font-medium text-white">
                        {NETWORKS.GALILEO.id.toString()}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Correct Network:</span>
                    <span className={`font-medium ${chainId === NETWORKS.GALILEO.id ? 'text-green-400' : 'text-red-400'}`}>
                        {chainId === NETWORKS.GALILEO.id ? '✅ Yes' : '❌ No'}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Balance:</span>
                    <span className="font-medium text-white">
                        {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Network Name:</span>
                    <span className="font-medium text-purple-400">
                        {chainId === NETWORKS.GALILEO.id ? 'Galileo Testnet' : 'Unknown Network'}
                    </span>
                </div>
            </div>

            <div className="mt-6 p-4 bg-black/30 rounded-xl">
                <h4 className="font-medium text-blue-400 mb-3">Network Configuration:</h4>
                <div className="text-xs text-gray-300 space-y-2">
                    <div className="flex justify-between">
                        <span>Chain ID:</span>
                        <span className="font-mono text-white">{NETWORKS.GALILEO.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>RPC URL:</span>
                        <span className="font-mono text-white">{NETWORKS.GALILEO.rpcUrl}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Currency:</span>
                        <span className="font-mono text-white">{NETWORKS.GALILEO.nativeCurrency.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Explorer:</span>
                        <span className="font-mono text-white">{NETWORKS.GALILEO.blockExplorer}</span>
                    </div>
                </div>
            </div>
        </div>
    );
} 