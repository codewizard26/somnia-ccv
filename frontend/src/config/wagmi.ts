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

export const config = createConfig({
    chains: [galileoChain, mainnet, sepolia], // 0G first, then others
    transports: {
        [galileoChain.id]: http(),
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    },
    ssr: true,
}); 