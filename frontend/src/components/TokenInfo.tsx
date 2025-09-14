'use client';

import { useRebaseTokenBalance, useRebaseTokenTotalSupply } from '@/hooks/useContracts';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACTS } from '@/config/contracts';

export default function TokenInfo() {
    const { address } = useAccount();
    const { data: tokenBalance } = useRebaseTokenBalance(address);
    const { data: totalSupply } = useRebaseTokenTotalSupply();

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Token Information</h2>

            {/* Token Stats */}
            <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">RBT Token Stats</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Your Balance:</span>
                            <span className="font-medium">
                                {tokenBalance ? formatEther(tokenBalance as bigint) : '0'} RBT
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Supply:</span>
                            <span className="font-medium">
                                {totalSupply ? formatEther(totalSupply as bigint) : '0'} RBT
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contract Addresses */}
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Contract Addresses</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Rebase Token:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {CONTRACTS.REBASE_TOKEN.slice(0, 6)}...{CONTRACTS.REBASE_TOKEN.slice(-4)}
                        </code>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Vault:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {CONTRACTS.VAULT.slice(0, 6)}...{CONTRACTS.VAULT.slice(-4)}
                        </code>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pool:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {CONTRACTS.POOL.slice(0, 6)}...{CONTRACTS.POOL.slice(-4)}
                        </code>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Features</h3>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Automatic interest accrual</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Rebase token mechanics</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Instant deposits and withdrawals</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Built on Somnia testnet</span>
                    </div>
                </div>
            </div>

            {/* Network Info */}
            <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Network Information</h4>
                <div className="text-sm text-blue-700 space-y-1">
                    <div>Network: Somnia Testnet</div>
                    <div>Chain ID: 50312</div>
                    <div>Currency: STT</div>
                </div>
            </div>
        </div>
    );
} 