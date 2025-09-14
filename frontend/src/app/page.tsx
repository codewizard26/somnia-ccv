'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { Database, Cpu, Shield, ArrowRight, ExternalLink, Link, Coins, BarChart3, Timer, GitMerge } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-orange-500 rounded-xl flex items-center justify-center transform rotate-3 transition-transform hover:rotate-6">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-orange-600 bg-clip-text text-transparent">
                  Somnia Vault
                </h1>
                <p className="text-sm text-purple-600">Somnia Hackathon 2025</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="https://docs.somnia.network"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 font-medium flex items-center group"
              >
                Somnia Docs
                <ExternalLink className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
              </a>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-orange-50 opacity-70"></div>
          <div className="container mx-auto text-center max-w-4xl relative z-10">
            <div className="inline-block mb-4 px-6 py-2 bg-purple-100 rounded-full">
              <span className="text-purple-600 font-semibold">Somnia Hackathon 2025</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-purple-900 mb-6 leading-tight">
              Somnia-Nexus-Vaultia <br />
              <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                Smart Vault
              </span>
            </h1>
            <p className="text-xl text-purple-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Experience seamless DeFi with Somnia-Nexus-Vaultia,
              powered by OpenAI integration and n8n automation for the Somnia Network ecosystem.
            </p>
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={() => router.push('/dashboard')}
                className="group relative px-8 py-4 bg-purple-600 rounded-xl overflow-hidden transition-all hover:bg-purple-700"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative flex items-center text-white font-medium text-lg">
                  Launch App
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
              <a
                href="https://docs.somnia.network"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 border-2 border-purple-200 text-purple-600 rounded-xl font-medium text-lg transition-all hover:border-purple-300 hover:bg-purple-50 flex items-center"
              >
                Explore Docs
                <ExternalLink className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <div className="w-2 h-16 bg-gradient-to-b from-purple-200 to-transparent"></div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold text-purple-900 mb-4">
                Somnia-Powered DeFi
              </h2>
              <p className="text-purple-600">
                Somnia-Nexus-Vaultia vault technology built for the Somnia ecosystem
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Database,
                  title: "Real-Time Monitoring",
                  description: "Live transaction monitoring with instant updates across all connected chains.",
                  gradient: "from-purple-400 to-purple-600"
                },
                {
                  icon: Cpu,
                  title: "Ai integration & n8n Automation",
                  description: "Intelligent workflow automation powered by OpenAI integration and n8n for DeFi operations.",
                  gradient: "from-orange-400 to-purple-600"
                },
                {
                  icon: Database,
                  title: "Neon DB Integration",
                  description: "Event mirroring and analytics storage on Neon serverless Postgres.",
                  gradient: "from-purple-600 to-orange-600"
                },
                {
                  icon: Link,
                  title: "Cross-Chain Messaging",
                  description: "Seamless cross-chain message transfers powered by Glacia Labs on Somnia.",
                  gradient: "from-purple-500 to-orange-500"
                }
              ].map((feature, index) => (
                <div key={index} className="group relative">
                  <div className="absolute inset-0 bg-purple-50 rounded-2xl transform transition-transform group-hover:scale-105 group-hover:shadow-lg"></div>
                  <div className="relative p-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 transform transition-transform group-hover:rotate-6`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-purple-900 mb-4">{feature.title}</h3>
                    <p className="text-purple-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-purple-900 text-center mb-12">How Somnia Vault Works</h2>
            <div className="max-w-4xl mx-auto">
              {/* Project Overview */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100 mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200 to-transparent opacity-20 rounded-full transform translate-x-32 -translate-y-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-200 to-transparent opacity-20 rounded-full transform -translate-x-24 translate-y-24"></div>

                <div className="relative">
                  <h3 className="text-3xl font-bold text-purple-900 mb-4 flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-orange-500 rounded-xl flex items-center justify-center mr-4 transform rotate-3">
                      <Coins className="w-6 h-6 text-white" />
                    </div>
                    Somnia Smart Vault
                  </h3>
                  <p className="text-purple-600 mb-12 text-lg max-w-3xl">
                    A cross-chain DeFi vault built for Somnia Hackathon that enables seamless message transfers
                    across multiple chains using Glacia Labs integration and n8n automation.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        icon: BarChart3,
                        title: "Cross-Chain Vault",
                        description: "Deposit tokens across multiple chains",
                        gradient: "from-purple-400 to-purple-600"
                      },
                      {
                        icon: GitMerge,
                        title: "Cross-Chain Messaging ",
                        description: "Seamless cross-chain messaging via Glacia Labs",
                        gradient: "from-orange-400 to-purple-600"
                      },
                      {
                        icon: Timer,
                        title: "Ai integration & n8n automation",
                        description: "Intelligent vault ai integration and workflow automation with n8n",
                        gradient: "from-purple-600 to-orange-600"
                      }
                    ].map((feature, index) => (
                      <div key={index} className="group bg-white p-6 rounded-xl border border-purple-100 hover:shadow-lg transition-all transform hover:-translate-y-1">
                        <div className={`w-12 h-12 mb-4 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center transform transition-transform group-hover:rotate-6`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold text-purple-900 mb-2">{feature.title}</h4>
                        <p className="text-purple-600">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Process Steps */}
              <div className="space-y-6 relative">
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-purple-600 via-orange-400 to-transparent"></div>
                {[
                  {
                    title: 'Cross-Chain Deposit',
                    description: 'User deposits tokens from any supported chain using secure cross-chain messaging.',
                    icon: Coins
                  },
                  {
                    title: 'Message Processing',
                    description: 'Cross-chain messages are processed securely by the Smart Vault pipeline.',
                    icon: Database
                  },
                  {
                    title: 'Ai integration & n8n Automation',
                    description: 'Intelligent workflow automation and processing powered by OpenAI integration and n8n.',
                    icon: Cpu
                  },
                  {
                    title: 'Analytics Dashboard',
                    description: 'Real-time cross-chain analytics and transaction monitoring.',
                    icon: BarChart3
                  }
                ].map((step, index) => (
                  <div key={index} className="flex items-start space-x-4 bg-white p-6 rounded-xl border border-purple-100 ml-8 hover:shadow-md transition-all relative">
                    <div className="absolute -left-8 w-8 h-8 bg-gradient-to-br from-purple-600 to-orange-500 rounded-xl flex items-center justify-center transform -translate-x-1/2">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-purple-900 mb-1">{step.title}</h4>
                      <p className="text-purple-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Showcase Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-purple-900 text-center mb-12">Somnia Glacia Showcase</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-purple-50 p-8 rounded-2xl border border-purple-100">
                <h3 className="text-xl font-semibold text-purple-900 mb-4">Glacia Labs Message</h3>
                <div className="bg-white p-4 rounded-xl border border-purple-100">
                  <pre className="text-sm text-purple-600 overflow-x-auto">
                    {JSON.stringify({
                      type: "glacia-message",
                      amount: "1.5 ETH",
                      fromChain: "Ethereum",
                      toChain: "Somnia",
                      timestamp: "2025-01-01T12:00:00Z",
                      messageId: "glc_123...abc"
                    }, null, 2)}
                  </pre>
                </div>
              </div>
              <div className="bg-purple-50 p-8 rounded-2xl border border-purple-100">
                <h3 className="text-xl font-semibold text-purple-900 mb-4">n8n Workflow Analytics</h3>
                <div className="aspect-video bg-white rounded-xl border border-purple-100 flex items-center justify-center">
                  <p className="text-purple-600">Automated Workflow Charts & Analytics</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-purple-900 text-center mb-12">Somnia Vault Roadmap</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                { phase: "Phase 1", title: "Messaging Integration", status: "complete" },
                { phase: "Phase 2", title: "Somnia Chain Integration", status: "complete" },
                { phase: "Phase 3", title: "Ai integration & n8n Workflow Automation", status: "complete" },
                { phase: "Phase 4", title: "Multi-Chain Support & Advanced Features", status: "current" }
              ].map((item) => (
                <div key={item.phase} className="flex items-center bg-white p-6 rounded-xl border border-purple-100">
                  <div className="w-24 font-medium text-purple-600">{item.phase}</div>
                  <div className="flex-1 text-purple-900">{item.title}</div>
                  <div>
                    {item.status === 'complete' && <span className="text-green-500">✅</span>}
                    {item.status === 'current' && <span className="text-orange-500">🔄</span>}
                    {item.status === 'future' && <span>🔮</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-purple-100">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-purple-600 font-medium">Somnia Vault</span>
            </div>
            <div className="flex items-center space-x-8">
              <a href="https://docs.somnia.network" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 transition-colors">Somnia Docs</a>
              <a href="https://github.com/somnia-network" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 transition-colors">GitHub</a>
              <a href="https://twitter.com/somnia_network" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 transition-colors">Twitter</a>
              <a href="https://discord.gg/somnia" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
