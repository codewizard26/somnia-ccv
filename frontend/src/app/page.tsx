'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useBalance } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import NetworkDebug from '@/components/NetworkDebug';
import VaultInterface from '@/components/VaultInterface';
import { NETWORKS } from '@/config/contracts';

export default function Home() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const router = useRouter();
  const isCorrectNetwork = chainId === NETWORKS.GALILEO.id;

  // Redirect to dashboard if connected
  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">0G</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                0G Rebase Token Vault
              </h1>
            </div>
            <div className="hidden md:block">
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 bg-clip-text text-transparent">
                0G Rebase Token
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Vault
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Earn interest on your native 0G tokens with our innovative
              <span className="text-purple-400 font-semibold"> rebase vault system</span>
            </p>
            <div className="flex justify-center mb-12">
              <div className="md:hidden">
                <ConnectButton />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="text-3xl font-bold text-purple-400 mb-2">5%</div>
                <div className="text-gray-300">Annual Interest Rate</div>
              </div>
              <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="text-3xl font-bold text-blue-400 mb-2">0G</div>
                <div className="text-gray-300">Native Token Support</div>
              </div>
              <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="text-3xl font-bold text-green-400 mb-2">RBT</div>
                <div className="text-gray-300">Rebase Token Rewards</div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Component - Always show for troubleshooting */}
        <div className="mb-8">
          <NetworkDebug />
        </div>

        {isConnected ? (
          <div className="space-y-8">
            {/* Vault Interface - Show when connected and on correct network */}
            {isCorrectNetwork && <VaultInterface />}

            {/* Network Warning - Show when connected but on wrong network */}
            {!isCorrectNetwork && (
              <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8">
                <h2 className="text-2xl font-semibold text-red-400 mb-6">⚠️ Wrong Network Detected</h2>
                <div className="bg-black/20 rounded-xl p-6 text-center">
                  <h3 className="text-lg font-medium text-red-300 mb-4">Switch to 0G Galileo Testnet</h3>
                  <p className="text-red-200 mb-6">
                    You&apos;re currently connected to the wrong network. Please switch to 0G Galileo Testnet to use the vault.
                  </p>
                  <div className="bg-black/30 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-white mb-2">Required Network:</h4>
                    <p className="text-gray-300 text-sm">
                      <strong>Network:</strong> 0G Galileo Testnet<br />
                      <strong>Chain ID:</strong> {NETWORKS.GALILEO.id}<br />
                      <strong>RPC URL:</strong> {NETWORKS.GALILEO.rpcUrl}<br />
                      <strong>Block Explorer:</strong> {NETWORKS.GALILEO.blockExplorer}
                    </p>
                  </div>
                  <p className="text-red-200 text-sm">
                    Please switch to the correct network in your wallet to continue.
                  </p>
                </div>
              </div>
            )}

            {/* Connection Status */}
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Connection Status</h2>

              {isCorrectNetwork ? (
                <div className="space-y-6">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 font-medium">Connected to 0G Galileo Testnet</span>
                    </div>
                    <p className="text-green-300 text-sm mt-2">Ready to deposit 0G tokens and earn interest</p>
                  </div>

                  <div className="bg-black/30 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Your Balances</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">0G Balance:</span>
                        <span className="font-medium text-white">
                          {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Wallet Address:</span>
                        <span className="font-mono text-sm text-purple-400">
                          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                    <h4 className="font-medium text-blue-400 mb-3">Vault Features:</h4>
                    <ul className="text-sm text-blue-300 space-y-2">
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span>Deposit native 0G tokens to earn interest</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span>Receive RBT tokens representing your share</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span>RBT tokens automatically rebase with interest</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span>Withdraw anytime to claim your earnings in 0G</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
                    <h4 className="font-medium text-yellow-400 mb-2">⚠️ MetaMask Display Issue</h4>
                    <p className="text-sm text-yellow-300">
                      MetaMask may show &quot;ETH&quot; instead of &quot;0G&quot; when signing transactions. This is just a display issue -
                      you&apos;re actually sending 0G tokens, not ETH.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                  <h3 className="text-lg font-medium text-red-400 mb-4">⚠️ Wrong Network Detected</h3>
                  <p className="text-red-300 mb-6">
                    You&apos;re currently connected to the wrong network. Please switch to 0G Galileo Testnet to use the vault.
                  </p>
                  <div className="bg-black/30 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-white mb-2">Required Network:</h4>
                    <p className="text-gray-300 text-sm">
                      <strong>Network:</strong> 0G Galileo Testnet<br />
                      <strong>Chain ID:</strong> {NETWORKS.GALILEO.id}<br />
                      <strong>Currency:</strong> 0G
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-12 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mx-auto mb-8 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">🔗</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-gray-300 mb-8 text-lg">
                Connect your wallet to the 0G network to start earning interest on your 0G tokens
              </p>
              <div className="bg-black/30 rounded-xl p-6 mb-8">
                <p className="text-sm text-gray-300">
                  <strong className="text-white">Required Network:</strong> 0G Galileo Testnet<br />
                  <strong className="text-white">Chain ID:</strong> {NETWORKS.GALILEO.id}<br />
                  <strong className="text-white">Currency:</strong> 0G<br />
                  <strong className="text-white">RPC URL:</strong> https://evmrpc-testnet.0g.ai
                </p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-8">
                <h4 className="font-medium text-yellow-400 mb-3">⚠️ Important Notes:</h4>
                <ul className="text-sm text-yellow-300 space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span>Make sure to add 0G Galileo Testnet to MetaMask</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span>MetaMask may show &quot;ETH&quot; instead of &quot;0G&quot; - this is normal</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span>You&apos;re actually sending 0G tokens, not ETH</span>
                  </li>
                </ul>
              </div>
              <ConnectButton />
            </div>
          </div>
        )}

        {/* Network Information */}
        <div className="mt-16 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h3 className="text-2xl font-semibold text-white mb-6">Network Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-purple-400 mb-4">0G Galileo Testnet</h4>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Chain ID:</span>
                  <span className="font-mono text-white">{NETWORKS.GALILEO.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>RPC URL:</span>
                  <span className="font-mono text-white">https://evmrpc-testnet.0g.ai</span>
                </div>
                <div className="flex justify-between">
                  <span>Currency:</span>
                  <span className="font-mono text-white">0G</span>
                </div>
                <div className="flex justify-between">
                  <span>Block Explorer:</span>
                  <span className="font-mono text-white">https://galileo.0g.ai</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-blue-400 mb-4">How to Add to MetaMask</h4>
              <ol className="text-sm text-gray-300 space-y-3">
                <li className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">1</span>
                  <span>Open MetaMask → Settings → Networks</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">2</span>
                  <span>Click &quot;Add Network&quot;</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">3</span>
                  <span>Enter the details above</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">4</span>
                  <span>Save and switch to 0G network</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-xl border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>© 2024 0G Rebase Token Vault. Built for the 0G Hackathon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
