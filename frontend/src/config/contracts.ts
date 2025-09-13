// Contract addresses and configuration
// Updated with deployed contract addresses

export const CONTRACTS = {
    // Deployed contract addresses on Somnia Testnet
    REBASE_TOKEN: "0x2432dC3847A04945FD80c0A81B4EbDB7C948D93f", // RebaseToken (SRBT)
    POOL: "0x430EeeAE58193373241cb2eF0FDA3c97d6474e6e", // SimpleRebaseTokenPool
    VAULT: "0x77A5840BBd508B36D49e038B908d62C994fF09fb", // Vault
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
    SOMNIA: {
        id: 50312, // Somnia testnet chain ID
        name: "Somnia Testnet",
        rpcUrl: "https://dream-rpc.somnia.network",
        blockExplorer: "https://somnia-testnet.socialscan.io",
        nativeCurrency: {
            name: "STT",
            symbol: "STT",
            decimals: 18,
        },
    },
};

export const CHAIN_ID = NETWORKS.SOMNIA.id; 