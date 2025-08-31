// Contract addresses and configuration
// Updated with deployed contract addresses

export const CONTRACTS = {
    // Deployed contract addresses on 0G Galileo Testnet
    REBASE_TOKEN: "0xE4aD0ADAf7E5759569081dF90fC76381eD70A2B5",
    POOL: "0x6c1FEDA3Ace971Ba274BC5b5622acC08Ad2A872C",
    VAULT: "0x1a89Be0B6e08B8cF668B36c6F95f9781ABC917ba",
};

export const NETWORKS = {
    GALILEO: {
        id: 16601, // 0x40d9 in hex - actual 0G Galileo Testnet chain ID
        name: "0G Galileo Testnet",
        rpcUrl: "https://evmrpc-testnet.0g.ai",
        blockExplorer: "https://galileo.0g.ai",
        nativeCurrency: {
            name: "0G",
            symbol: "0G",
            decimals: 18,
        },
    },
};

export const CHAIN_ID = NETWORKS.GALILEO.id; 