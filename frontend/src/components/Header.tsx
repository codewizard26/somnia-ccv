'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {
    return (
        <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Rebase Vault
                        </h1>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            0G Hackathon
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center space-x-6">
                        <a href="#vault" className="text-gray-600 hover:text-gray-900">
                            Vault
                        </a>
                        <a href="#tokens" className="text-gray-600 hover:text-gray-900">
                            Tokens
                        </a>
                        <a href="#docs" className="text-gray-600 hover:text-gray-900">
                            Docs
                        </a>
                    </nav>

                    <ConnectButton />
                </div>
            </div>
        </header>
    );
} 