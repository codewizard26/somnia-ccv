// import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { NETWORKS } from './contracts';

const galileoChain = {
    id: NETWORKS.GALILEO.id,
    name: NETWORKS.GALILEO.name,
    nativeCurrency: NETWORKS.GALILEO.nativeCurrency,
    rpcUrls: {
        default: { http: [NETWORKS.GALILEO.rpcUrl] },
        public: { http: [NETWORKS.GALILEO.rpcUrl] },
    },
    blockExplorers: {
        default: { name: '0G Explorer', url: NETWORKS.GALILEO.blockExplorer },
    },
} as const;

const somniaChain = {
    id: NETWORKS.SOMNIA.id,
    name: NETWORKS.SOMNIA.name,
    nativeCurrency: NETWORKS.SOMNIA.nativeCurrency,
    rpcUrls: {
        default: { http: [NETWORKS.SOMNIA.rpcUrl] },
        public: { http: [NETWORKS.SOMNIA.rpcUrl] },
    },
    blockExplorers: {
        default: { name: 'Somnia Explorer', url: NETWORKS.SOMNIA.blockExplorer },
    },
} as const;

export const config = createConfig({
    chains: [somniaChain, galileoChain, mainnet, sepolia], // Somnia first for hackathon, then others
    transports: {
        [somniaChain.id]: http(),
        [galileoChain.id]: http(),
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    },
    ssr: true,
}); 